import { http, cachedRequest } from './httpClient';

// OpenWeatherMap free tier: /data/2.5/weather returns current conditions only
// (temp, humidity, wind, cloud cover). There is no rain-probability field on
// this endpoint (that needs the paid One Call API), so `rainChance` is
// derived loosely from cloud cover as a rough indicator and clearly labeled
// as such in the UI rather than presented as a real forecast probability.
//
// NOTE: same tradeoff as cricketApi.js — VITE_WEATHER_API_KEY ships inside
// the client bundle, visible via DevTools. See README for the alternative
// Cloud Functions proxy pattern if you want the key hidden server-side.
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

function normalize(raw) {
  return {
    location: raw.name,
    country: raw.sys?.country,
    tempC: Math.round(raw.main?.temp),
    feelsLikeC: Math.round(raw.main?.feels_like),
    condition: raw.weather?.[0]?.main,
    description: raw.weather?.[0]?.description,
    icon: raw.weather?.[0]?.icon,
    humidity: raw.main?.humidity,
    windKph: raw.wind?.speed != null ? Math.round(raw.wind.speed * 3.6) : null,
    cloudCoverPct: raw.clouds?.all ?? null,
  };
}

export async function getVenueWeather(cityName) {
  const cacheKey = `weather:city:${cityName}`;
  const raw = await cachedRequest(
    cacheKey,
    async () => {
      const { data } = await http.get(BASE_URL, {
        params: { q: cityName, appid: API_KEY, units: 'metric' },
      });
      return data;
    },
    10 * 60_000 // weather doesn't need refetching more than every 10 min
  );
  return normalize(raw);
}

export async function getWeatherByCoordinates(lat, lon) {
  const cacheKey = `weather:coord:${lat},${lon}`;
  const raw = await cachedRequest(
    cacheKey,
    async () => {
      const { data } = await http.get(BASE_URL, {
        params: { lat, lon, appid: API_KEY, units: 'metric' },
      });
      return data;
    },
    10 * 60_000
  );
  return normalize(raw);
}
