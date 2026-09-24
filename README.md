# CricPulse 🏏

**Live Cricket. Real Stats. One Place.**

A production-quality cricket web platform built with React, Vite, Firebase, and live cricket/weather data — designed to feel like a real sports dashboard, not an API demo.

---

## Features

- **Live match center** — live scores, scorecards, venue weather, follow-match
- **Schedule & series** — Today/Tomorrow/This Week grouping, series overview with tabs
- **Players** — search with Load More pagination, profiles, career stats by format, side-by-side player comparison
- **Search** — global debounced search across players, matches, series, news (only fires once you actually type)
- **Auth & profile** — Firebase email/password + Google login, "My Cricket" hub
- **Favorites** — favorite teams/players, follow matches, all synced to Firestore
- **News, comments & polls** — Firestore-backed articles with Load More pagination, threaded comments, fan polls with live % results
- **Admin dashboard** — news CRUD with image upload, comment moderation, poll creation, platform stats, and a "grant admin access by email" tool
- **Dark/light sports-dashboard theme** — auto-detects the OS preference on first visit and follows it live, or manually toggle and it remembers your choice
- **Live score auto-refresh** — the Live page, Home's live section, and an open Match Details page poll every 60s while a match is actually live, pausing automatically in background tabs. The interval is intentionally kept equal to the underlying cache TTL (see `cricketApi.js`) — the free CricAPI plan's 100 requests/day gets exhausted fast if polling fires faster than data is cached as fresh
- **Push notifications** — following a match offers to enable browser push; a scheduled Cloud Function checks followed matches every 5 minutes and notifies you when the status changes
- **Installable PWA** — add CricPulse to your home screen / desktop, with an app icon, offline app-shell, and a native install prompt
- **Honest empty states** — where the free API tier has no data (rankings, records, team rosters, commentary), the UI says so clearly instead of inventing numbers
- **Cricket/Weather API keys in `.env.local`** — the simpler setup: no Cloud Functions/Blaze plan needed just to show match data, at the cost of the key being visible in the browser (see Security Notes)

## Tech Stack

React 18 · Vite · JavaScript (no TS) · React Router DOM · Firebase (Auth/Firestore/Storage/**Functions**) · react-hot-toast · React Icons · Recharts · Vitest + React Testing Library

**Data sources:**
- Cricket data: [CricketData.org](https://cricketdata.org) (CricAPI v1 free tier) — `currentMatches`, `match_info`, `match_scorecard`, `series`, `series_info`, `players`, `players_info`
- Weather: [OpenWeatherMap](https://openweathermap.org/current) free current-weather endpoint

> The free tiers of both APIs are limited — no teams list, rankings, records, commentary, or squads endpoint on the free Cricket API plan, and no rain-probability field on the free Weather API plan. The relevant screens (Teams, Rankings, Records, Squads, Commentary tabs) show a clear "not available on this plan" message instead of invented data.

## Project Layout

```
cricpulse/
├── src/                    # the React app (Vite)
├── functions/               # Cloud Functions: setAdminRole, checkFollowedMatches (push notifications)
├── scripts/
│   └── bootstrapFirstAdmin.js   # one-time script to create the first admin
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
└── firebase.json
```

## Installation

```bash
git clone <your-repo-url>
cd cricpulse
npm install
cd functions && npm install && cd ..
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your **Firebase** config only — Cricket/Weather API keys are no longer client-side, see below.

```bash
cp .env.example .env.local
```

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=
```

`.env` / `.env.local` are already in `.gitignore` — never commit real keys.

## Firebase Setup

1. Create a project at console.firebase.google.com
2. Enable **Authentication** → Email/Password and Google providers
3. Enable **Firestore Database**
4. Enable **Storage**
5. **Upgrade to the Blaze (pay-as-you-go) plan** — still required, because this project's two remaining Cloud Functions (`setAdminRole` for the admin-grant tool, and `checkFollowedMatches` for push notifications) are 2nd-gen functions, and Firebase requires Blaze for *any* 2nd-gen function regardless of what it does — the free-tier usage here (a handful of calls plus one scheduled run every 5 minutes) stays well within Firebase's no-cost monthly quota for a small app. If you don't want push notifications or the in-app admin-grant tool at all, you can skip Cloud Functions entirely (delete `functions/` and use `scripts/bootstrapFirstAdmin.js` to set every admin manually) and stay on the free Spark plan.
6. If keeping `checkFollowedMatches`: set its Cricket API key secret (separate from the client's `.env.local` key — this one's for the function's own server-side match-status checks):
   ```bash
   firebase functions:secrets:set CRICKET_API_KEY
   ```
7. Copy your web app config into `.env.local`
8. Deploy the security rules, indexes, and functions:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage:rules,functions
   ```
   The indexes are required — `getNewsList`/`getNewsPage` (category/featured filter + date sort) and `getActivePolls` (active filter + date sort) each combine an equality filter with `orderBy` on a different field, which Firestore does not index automatically. Skipping this step means those queries throw a "the query requires an index" error the first time they run.

### Creating the first admin

`setAdminRole` (the Cloud Function the Admin Dashboard's "Grant admin access" form calls) requires the *caller* to already be an admin — so it can't create the very first one. Bootstrap that one manually:

1. Firebase Console → Project Settings → Service accounts → **Generate new private key** → save as `scripts/serviceAccountKey.json` (already gitignored — never commit it)
2. `node scripts/bootstrapFirstAdmin.js you@example.com`
3. Sign out and back in on the site so your ID token picks up the new custom claim

From then on, that admin can promote anyone else from **Admin Dashboard → Users → Grant admin access**.

## Push Notifications Setup

1. Enable **Cloud Messaging** in the Firebase Console (Project Settings → Cloud Messaging)
2. Generate a Web Push certificate: same page → **Web configuration** → "Generate key pair" → copy it into `VITE_FIREBASE_VAPID_KEY`
3. `checkFollowedMatches` runs on a schedule (Cloud Scheduler), which requires the Blaze plan you already enabled above — no extra setup needed beyond deploying functions
4. On first "Follow Match" click, the browser will prompt for notification permission; it can also be managed anytime from **Profile → Match notifications**

Notifications fire when a followed match's status text changes (innings break, target set, result, etc.) — checked every 5 minutes, not truly real-time, to stay within free-tier Cricket API request limits.

## PWA / Install

The app is installable — visiting it in a supporting browser shows an install prompt (or use the browser's own "Install app" / "Add to Home Screen" menu item). Installed, it opens in its own window with an app icon, and the built app shell (JS/CSS/icons) is cached for faster repeat loads. Live data (scores, Firestore, auth) is deliberately excluded from that cache — see the comment in `vite.config.js` — so an installed/offline app never shows a stale score as if it were current; it simply won't load fresh pages without a connection.

## Cricket & Weather API Setup

The client calls both APIs directly with keys in `.env.local` — no Cloud Functions involved for this part, so no Blaze plan is required just to show match/weather data:

1. Get a free key from [cricketdata.org](https://cricketdata.org) and from [openweathermap.org/api](https://openweathermap.org/api)
2. Add them to `.env.local`:
   ```
   VITE_CRICKET_API_KEY=your_key_here
   VITE_WEATHER_API_KEY=your_key_here
   ```
3. Restart `npm run dev` (Vite only reads `.env*` files on startup)

`src/services/api/httpClient.js` caches responses in `localStorage` (60s–10min TTLs depending on how often the data changes) — persisted rather than just in-memory, so a page refresh or dev hot-reload doesn't wipe the cache and force a fresh API call. The free plan's 100 requests/day disappears fast otherwise: a single Match Details page polling faster than its own cache TTL can burn the entire daily quota by itself within an hour.

**Tradeoff:** because `VITE_*` variables are baked into the built JS, anyone can read these keys from DevTools → Network tab (or even just the page source) and use them elsewhere against your quota. For a portfolio/personal project this is usually an acceptable risk; if you want the keys hidden server-side instead, an earlier version of this project proxied both APIs through Cloud Functions (`cricketProxy`/`weatherProxy`, called via `httpsCallable`) — that pattern still works and can be reintroduced if you upgrade to Blaze later for other reasons (see below).

## Running Locally

```bash
npm run dev
```

Cloud Functions calls (`httpsCallable`) need a deployed project (or the Firebase emulator) to resolve — see `firebase emulators:start` if you want to develop against local functions instead of the live deployment.

## Testing

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Vitest + React Testing Library, covering the pure utility functions (`formatters`, `validators`), the `useDebounce` hook's timing behavior, and component tests for `Button` and `MatchCard`. Firebase-dependent code (services, pages that call Firestore/Functions) isn't unit-tested here — that's a good next step via the Firebase emulator suite rather than mocking the SDK.

## Production Build

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

## Deployment

```bash
npm run build
firebase deploy
```

`firebase.json` wires hosting (serving `dist/`), Firestore rules/indexes, Storage rules, and Functions together, so a plain `firebase deploy` ships all of it.

## Security Notes

- Firestore & Storage rules (`firestore.rules`, `storage.rules`) enforce ownership on favorites/follows, restrict news/poll writes to admins, and validate comment shape and image uploads server-side — the client never self-declares admin status.
- **Admin status comes only from a Firebase custom claim**, read via `getIdTokenResult()` in `AuthContext`, set only by the `setAdminRole` Cloud Function (which itself re-checks the caller is already an admin) or the one-time bootstrap script. Nothing in the client can grant itself admin.
- **Cricket/Weather API keys DO ship to the browser** (`VITE_CRICKET_API_KEY`, `VITE_WEATHER_API_KEY`) — a deliberate simplicity tradeoff so no Cloud Functions/Blaze plan is needed just to show match data. Anyone can read these from DevTools and use them against your API quota; rotate the key at cricketdata.org/openweathermap if that happens. This does *not* expose anything else — Firebase config values in the same file are safe to expose by design, and no user data or Firebase-side secrets are affected.
- No card numbers, government IDs, or other sensitive data are collected anywhere in the app.

## Future Improvements

- CI/CD (GitHub Actions) to run `npm run test` and `npm run build` on every PR, and auto-deploy on merge to main
- Firebase emulator-backed integration tests for the Firestore/Functions-dependent code paths
- Rankings & Records once a paid/alternate data source with ICC rankings and historical records is connected
- Team roster & squads pages once a teams endpoint is available
- Ball-by-ball commentary once a provider that includes it is connected
- Push notifications for followed matches
- Redux Toolkit if global state grows beyond what Context comfortably handles
#   c r i c p l u s  
 