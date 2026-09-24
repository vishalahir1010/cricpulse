import { http, cachedRequest } from './httpClient';

// CricketData.org (cricapi.com v1) free-tier base. Free plan exposes:
// currentMatches, matches, match_info, match_scorecard, series, series_info,
// players, players_info. Each call consumes one hit from the daily quota,
// so every function here is wrapped in cachedRequest to avoid duplicate calls.
//
// NOTE: the API key is read from VITE_CRICKET_API_KEY, which ships inside
// the client bundle — anyone can view it via DevTools/Network tab. This is
// a deliberate simplicity tradeoff (no Cloud Functions / Blaze plan
// required); see README > Cricket & Weather API Setup for the tradeoff and
// the alternative Cloud Functions proxy pattern if you want the key hidden
// server-side instead.
const BASE_URL = 'https://api.cricapi.com/v1';
const API_KEY = import.meta.env.VITE_CRICKET_API_KEY;

async function get(endpoint, params = {}, ttlMs) {
  const query = { apikey: API_KEY, ...params };
  const cacheKey = `${endpoint}:${JSON.stringify(query)}`;

  return cachedRequest(
    cacheKey,
    async () => {
      const { data } = await http.get(`${BASE_URL}/${endpoint}`, { params: query });
      if (data.status !== 'success') {
        throw new Error(data.message || `Cricket API request to ${endpoint} failed`);
      }
      return data;
    },
    ttlMs
  );
}

// --- Matches -----------------------------------------------------------

/** Live + recently-updated matches. Refreshed periodically — see Live.jsx /
 * Home.jsx poll intervals, which are kept equal to this TTL so a poll tick
 * never fires a network call sooner than the data is actually considered
 * stale (the free plan's 100 requests/day makes that mismatch expensive). */
export async function getLiveMatches() {
  const res = await get('currentMatches', { offset: 0 }, 60_000);
  return (res.data || []).filter((m) => m.matchStarted && !m.matchEnded);
}

/** All current/upcoming/recent matches from the same feed, split by status. */
export async function getAllMatches(offset = 0) {
  const res = await get('currentMatches', { offset }, 60_000);
  return res.data || [];
}

export async function getUpcomingMatches() {
  const all = await getAllMatches();
  return all.filter((m) => !m.matchStarted);
}

export async function getRecentMatches() {
  const all = await getAllMatches();
  return all.filter((m) => m.matchEnded);
}

export async function getMatchDetails(matchId) {
  const res = await get('match_info', { id: matchId }, 60_000);
  return res.data;
}

export async function getMatchScorecard(matchId) {
  const res = await get('match_scorecard', { id: matchId }, 60_000);
  return res.data;
}

// --- Series --------------------------------------------------------------

export async function getSeries(offset = 0) {
  const res = await get('series', { offset }, 5 * 60_000);
  return res.data || [];
}

export async function getSeriesDetails(seriesId) {
  const res = await get('series_info', { id: seriesId }, 5 * 60_000);
  return res.data;
}

// --- Players ---------------------------------------------------------------

export async function searchPlayers(name, offset = 0) {
  const res = await get('players', { offset, search: name }, 5 * 60_000);
  return res.data || [];
}

// A plain search('kohli') matches ANY player whose name contains that
// string — the free API has no real "trending"/"popular" concept, so a
// single surname search often surfaces random unfamous namesakes instead
// of well-known players. This searches a short curated list of well-known
// full names instead and takes each one's best (first) match — still 100%
// real API data, just a smarter query than one generic partial-name search.
const TRENDING_PLAYER_NAMES = ['Virat Kohli', 'Rohit Sharma', 'Ben Stokes', 'Babar Azam'];

export async function getTrendingPlayers() {
  const results = await Promise.all(
    TRENDING_PLAYER_NAMES.map(async (name) => {
      try {
        const matches = await searchPlayers(name);
        return matches[0] || null;
      } catch {
        return null;
      }
    })
  );
  return results.filter(Boolean);
}

export async function getPlayerDetails(playerId) {
  const res = await get('players_info', { id: playerId }, 10 * 60_000);
  return res.data;
}

// Note: the free CricAPI tier has no dedicated /teams or /rankings endpoint.
// Team rosters and rankings pages must fall back to data derived from
// series/match responses (teamInfo blocks) with a clear "not available on
// the free plan" empty state rather than invented data — see Rankings.jsx.
