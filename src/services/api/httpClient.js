import axios from 'axios';

// Cache is persisted to localStorage (not just an in-memory Map) so it
// survives page refreshes and Vite's dev hot-reloads. The free CricAPI
// quota is only 100 requests/day — a JS-memory-only cache gets wiped on
// every refresh, so a testing/debugging session with a handful of
// refreshes can burn through the whole daily quota by itself even though
// the app's own polling respects the TTLs correctly.
const STORAGE_PREFIX = 'cricpulse_cache_v1:';

// In-flight requests still only need to live in memory — they can't
// meaningfully survive a page reload anyway (the caller that started them
// is gone), but they DO still matter for deduping several concurrent
// callers within the same page load (e.g. React StrictMode's double
// mount in dev, or Home + Live both requesting the same data at once).
const inFlight = new Map();

function readStorage(key) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // private browsing, storage disabled, or corrupt entry
  }
}

function writeStorage(key, entry) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Quota exceeded or storage unavailable — cache just won't persist
    // across a refresh this time; the app still works, just re-fetches.
  }
}

function getCached(key, ttlMs) {
  const entry = readStorage(key);
  if (!entry) return null;
  if (Date.now() - entry.time > ttlMs) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch {
      /* ignore */
    }
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  writeStorage(key, { data, time: Date.now() });
}

/**
 * Fetches `key` via `requestFn` unless a fresh cached value exists.
 * Concurrent calls with the same key while one is already in flight all
 * share that single underlying request instead of firing duplicates.
 * @param {string} key unique cache key (usually the full request URL + params)
 * @param {() => Promise<any>} requestFn
 * @param {number} ttlMs how long to trust the cached value (default 60s)
 */
export async function cachedRequest(key, requestFn, ttlMs = 60_000) {
  const cached = getCached(key, ttlMs);
  if (cached) return cached;

  const pending = inFlight.get(key);
  if (pending) return pending;

  const promise = requestFn()
    .then((data) => {
      setCached(key, data);
      return data;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);
  return promise;
}

export function clearCache() {
  inFlight.clear();
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

export const http = axios.create({ timeout: 15_000 });
