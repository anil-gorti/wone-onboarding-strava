```markdown
# WONE — Strava OAuth Onboarding

A Next.js 16 app that connects a runner's Strava account and renders a
confirmation screen showing their profile, aggregate stats, and race history.
Built as the onboarding entry point for the WONE runner profile pipeline.

---

## Features

- **OAuth 2.0 flow** — redirects to Strava, exchanges code for token, handles
  denial/errors gracefully
- **Large account support** — stores only a lightweight session cookie
  (`access_token` + `athlete_id`) to avoid the 4 KB browser limit that causes
  redirect loops on accounts with thousands of activities
- **Server-side data fetching** — athlete profile, YTD/all-time stats, and race
  history are fetched in the Next.js Server Component on `/confirm`, keeping the
  client bundle minimal
- **Race detection** — paginates up to 1 000 recent activities and filters for
  Strava `workout_type` 1 (run race) and 11 (ride race)
- **Confirmation screen** — profile photo, name, location, stats grid, and a
  toggleable race list sorted newest-first

---

## Project Structure

```
wone-onboarding-strava/
├── frontend/                          # Next.js 16 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/auth/strava/
│   │   │   │   ├── route.ts           # GET → redirects to Strava OAuth
│   │   │   │   └── callback/
│   │   │   │       └── route.ts       # GET → token exchange, sets session cookie
│   │   │   └── confirm/
│   │   │       └── page.tsx           # Server Component — fetches & renders data
│   │   ├── components/confirm/
│   │   │   └── ConfirmView.tsx        # Client Component — toggleable race list
│   │   └── lib/
│   │       ├── strava.ts              # Strava API calls
│   │       └── normalize.ts           # Data normalization + shared types
│   ├── next.config.ts                 # Strava + Google CDN image domains
│   └── .env.local                     # ← not committed, see setup below
└── backend/                           # Python pipeline (separate service)
```

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A [Strava API application](https://www.strava.com/settings/api)

### 2. Clone & install

```bash
git clone https://github.com/anil-gorti/wone-onboarding-strava.git
cd wone-onboarding-strava/frontend
npm install
```

### 3. Configure environment

Create `frontend/.env.local`:

```env
STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here
STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/strava/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

In your Strava API settings, set **Authorization Callback Domain** to `localhost`.

### 4. Run

```bash
npm run dev
```

Open `http://localhost:3000/api/auth/strava` to kick off the OAuth flow.

---

## OAuth Flow

```
Browser                          Next.js                        Strava
  │                                 │                              │
  │  GET /api/auth/strava           │                              │
  │────────────────────────────────▶│                              │
  │◀── 307 ────────────────────────│                              │
  │                                 │                              │
  │  GET /oauth/authorize?...       │                              │
  │────────────────────────────────────────────────────────────────▶
  │◀── redirect /callback?code=... ─────────────────────────────────
  │                                 │                              │
  │  GET /api/auth/strava/callback  │                              │
  │────────────────────────────────▶│                              │
  │                                 │  POST /oauth/token           │
  │                                 │─────────────────────────────▶│
  │                                 │◀── { access_token, athlete }─│
  │                                 │                              │
  │                                 │  Set-Cookie: strava_session  │
  │◀── 307 /confirm ───────────────│  (~200 bytes, 1h TTL)        │
  │                                 │                              │
  │  GET /confirm                   │                              │
  │────────────────────────────────▶│                              │
  │                                 │  GET /athlete                │
  │                                 │  GET /athletes/:id/stats     │
  │                                 │  GET /athlete/activities (×n)│
  │                                 │─────────────────────────────▶│
  │                                 │◀─────────────────────────────│
  │◀── 200 HTML ───────────────────│                              │
```

---

## API Reference

### `GET /api/auth/strava`
Redirects to Strava's OAuth authorization page with scopes:
`read`, `profile:read_all`, `activity:read_all`

### `GET /api/auth/strava/callback`
| Param | Description |
|-------|-------------|
| `code` | Authorization code from Strava |
| `error` | Present if user denied access |

On success: sets `strava_session` cookie, redirects to `/confirm`.  
On error: redirects to `/?error=strava_denied`.

### `GET /confirm`
Server-rendered page. Reads `strava_session` cookie, fetches fresh data from
Strava, and renders the confirmation UI. Redirects to `/api/auth/strava` if
the cookie is missing or expired.

---

## Key Design Decisions

**Why store only the token in the cookie?**  
Storing fully normalized athlete data (including race history) in a cookie
causes `ERR_TOO_MANY_REDIRECTS` for athletes with large activity histories.
The browser silently drops cookies over 4 KB, `/confirm` finds no cookie,
redirects to re-auth, Strava auto-approves, and the loop never breaks.
Storing `{ access_token, athlete_id }` (~200 bytes) is always safe.

**Why fetch data in the Server Component?**  
The `/confirm` page is a one-time confirmation step — latency is acceptable
and keeping the fetch server-side means the access token never touches the
client, no loading spinners, and no extra API routes needed.

**Why paginate up to 1 000 activities?**  
Strava's max `per_page` is 200. Five pages covers most active athletes'
recent history without excessive API calls. Activities are filtered by
`workout_type` (1 = run race, 11 = ride race) after fetching.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRAVA_CLIENT_ID` | Yes | Numeric app ID from Strava API settings |
| `STRAVA_CLIENT_SECRET` | Yes | Secret from Strava API settings |
| `STRAVA_REDIRECT_URI` | Yes | Must match Strava app callback domain |
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL, no trailing slash |

---

## Stack

- [Next.js 16](https://nextjs.org) — App Router, Server Components
- [Tailwind CSS v4](https://tailwindcss.com)
- [Lucide React](https://lucide.dev) — icons
- [Strava API v3](https://developers.strava.com/docs/reference/)
```
