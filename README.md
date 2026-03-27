# Strava Runner Profile

A full-stack application that connects a runner's Strava account and builds an AI-powered profile — surfacing race history, training stats, and LLM-generated insights about their running identity.

**Frontend:** Next.js 16 · OAuth 2.0 · Server Components  
**Backend:** FastAPI · Python · SQLite · Anthropic Claude (multi-agent pipeline)

---

## What It Does

1. **OAuth Onboarding** — Runner authenticates with Strava; app fetches their profile, YTD/all-time stats, and up to 1,000 recent activities
2. **Confirmation Screen** — Server-rendered view shows profile photo, location, stats grid, and a toggleable race history sorted newest-first
3. **AI Pipeline** — Three-agent backend pipeline (Detective → Pattern Reader → Storyteller) analyzes race data and generates a structured runner profile

---

## Features

- **OAuth 2.0 flow** — redirects to Strava, exchanges code for token, handles denial/errors gracefully
- **Large account support** — stores only a lightweight session cookie (`access_token` + `athlete_id`) to avoid the 4 KB browser limit that causes redirect loops on accounts with thousands of activities
- **Server-side data fetching** — athlete profile, YTD/all-time stats, and race history are fetched in the Next.js Server Component on `/confirm`, keeping the client bundle minimal
- **Race detection** — paginates up to 1,000 recent activities and filters for Strava `workout_type` 1 (run race) and 11 (ride race)
- **Confirmation screen** — profile photo, name, location, stats grid, and a toggleable race list sorted newest-first
- **Multi-agent AI analysis** — three specialized Claude agents reason over race data to produce a structured runner profile with archetype classification

---

## Architecture

```
strava-runner-profile/
├── frontend/                          # Next.js 16 App Router
│   └── src/
│       ├── app/
│       │   ├── api/auth/strava/
│       │   │   ├── route.ts           # GET → redirects to Strava OAuth
│       │   │   └── callback/
│       │   │       └── route.ts       # GET → token exchange, sets session cookie
│       │   └── confirm/
│       │       └── page.tsx           # Server Component — fetches & renders data
│       ├── components/confirm/
│       │   └── ConfirmView.tsx        # Client Component — toggleable race list
│       └── lib/
│           ├── strava.ts              # Strava API calls
│           └── normalize.ts          # Data normalization + shared types
│   ├── next.config.ts                # Strava + Google CDN image domains
│   └── .env.local                    # ← not committed, see setup below
└── backend/                          # Python AI pipeline (FastAPI)
    └── app/
        ├── agents/                   # Claude-powered agent classes
        │   ├── detective.py          # Agent 1: extracts evidence brief from raw data
        │   ├── pattern_reader.py     # Agent 2: classifies runner archetype
        │   └── storyteller.py        # Agent 3: generates profile content
        ├── pipeline/                 # Orchestration logic
        ├── prompts/                  # System prompt files (Markdown)
        │   ├── detective_system.md
        │   ├── pattern_reader_system.md
        │   └── storyteller_system.md
        ├── api/                      # FastAPI route handlers
        ├── models/                   # SQLAlchemy models
        ├── schemas/                  # Pydantic schemas
        ├── services/                 # Business logic
        └── main.py                   # FastAPI app entrypoint
```

---

## AI Pipeline

The backend runs a three-agent pipeline powered by Anthropic Claude:

```
Raw Strava Data
      │
      ▼
┌─────────────┐
│  Detective  │  Agent 1 — Reads raw activity data, flags gaps,
│             │  produces a structured evidence brief with
└──────┬──────┘  confidence indicators (HIGH / MEDIUM / LOW)
       │
       ▼
┌───────────────┐
│ Pattern Reader│  Agent 2 — Classifies runner into one of 10
│               │  archetypes (Progression Chaser, Podium Hunter,
└──────┬────────┘  Festival Runner, etc.) with evidence citations
       │
       ▼
┌─────────────┐
│ Storyteller │  Agent 3 — Takes evidence brief + classification,
│             │  generates final profile content (narrative +
└─────────────┘  structured JSON output)
```

**Runner Archetypes (10 total):**
Progression Chaser · Circuit Regular · Sunday Faithful · Comeback Runner · Late Bloomer · Distance Migrator · Podium Hunter · Festival Runner · Organizer-Athlete · Quiet Grinder

---

## OAuth Flow

```
Browser          Next.js              Strava
  │                 │                    │
  │ GET /api/auth/strava                 │
  │────────────────▶│                    │
  │◀── 307 ─────────│                    │
  │                 │                    │
  │          GET /oauth/authorize?...    │
  │──────────────────────────────────────▶
  │◀── redirect /callback?code=... ──────
  │                 │                    │
  │ GET /api/auth/strava/callback        │
  │────────────────▶│                    │
  │                 │ POST /oauth/token  │
  │                 │───────────────────▶│
  │                 │◀── { access_token }│
  │                 │                    │
  │◀── 307 /confirm ─── Set-Cookie: strava_session (~200 bytes, 1h TTL)
  │                 │                    │
  │ GET /confirm    │                    │
  │────────────────▶│                    │
  │                 │── GET /athlete ────▶
  │                 │── GET /stats ──────▶
  │                 │── GET /activities ─▶
  │                 │◀───────────────────│
  │◀── 200 HTML ────│                    │
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Strava API application](https://www.strava.com/settings/api)
- An [Anthropic API key](https://console.anthropic.com/) (for the backend pipeline)

### 1. Clone & install

```bash
git clone https://github.com/anil-gorti/strava-runner-profile.git
cd strava-runner-profile

# Frontend
cd frontend && npm install

# Backend
cd ../backend && pip install -r requirements.txt
```

### 2. Configure environment

**Frontend** — create `frontend/.env.local`:

```env
STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here
STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/strava/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Backend** — create `backend/.env`:

```env
ANTHROPIC_API_KEY=your_anthropic_key_here
STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here
```

In your Strava API settings, set **Authorization Callback Domain** to `localhost`.

### 3. Run

```bash
# Frontend (terminal 1)
cd frontend && npm run dev

# Backend (terminal 2)
cd backend && uvicorn app.main:app --reload
```

Open `http://localhost:3000/api/auth/strava` to kick off the OAuth flow.

---

## API Reference

### `GET /api/auth/strava`
Redirects to Strava's OAuth authorization page with scopes: `read`, `profile:read_all`, `activity:read_all`

### `GET /api/auth/strava/callback`

| Param | Description |
|-------|-------------|
| `code` | Authorization code from Strava |
| `error` | Present if user denied access |

On success: sets `strava_session` cookie, redirects to `/confirm`.  
On error: redirects to `/?error=strava_denied`.

### `GET /confirm`
Server-rendered page. Reads `strava_session` cookie, fetches fresh data from Strava, renders the confirmation UI. Redirects to `/api/auth/strava` if the cookie is missing or expired.

---

## Key Design Decisions

**Why store only the token in the cookie?**  
Storing fully normalized athlete data (including race history) in a cookie causes `ERR_TOO_MANY_REDIRECTS` for athletes with large activity histories. The browser silently drops cookies over 4 KB, `/confirm` finds no cookie, redirects to re-auth, Strava auto-approves, and the loop never breaks. Storing `{ access_token, athlete_id }` (~200 bytes) is always safe.

**Why fetch data in the Server Component?**  
The `/confirm` page is a one-time confirmation step — latency is acceptable, and keeping the fetch server-side means the access token never touches the client, no loading spinners, and no extra API routes needed.

**Why paginate up to 1,000 activities?**  
Strava's max `per_page` is 200. Five pages covers most active athletes' recent history without excessive API calls. Activities are filtered by `workout_type` (1 = run race, 11 = ride race) after fetching.

**Why a multi-agent pipeline instead of one prompt?**  
Separating concerns across three agents — evidence extraction, classification, and narrative generation — produces more reliable, auditable outputs. Each agent has a focused task, a constrained output schema, and explicit confidence indicators. Chaining them means the Storyteller only sees structured, already-validated input.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRAVA_CLIENT_ID` | Yes | Numeric app ID from Strava API settings |
| `STRAVA_CLIENT_SECRET` | Yes | Secret from Strava API settings |
| `STRAVA_REDIRECT_URI` | Yes | Must match Strava app callback domain |
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL, no trailing slash |
| `ANTHROPIC_API_KEY` | Yes (backend) | Claude API key from Anthropic Console |

---

## Stack

**Frontend**
- [Next.js 16](https://nextjs.org/) — App Router, Server Components
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) — icons
- [Strava API v3](https://developers.strava.com/docs/reference/)

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — async API framework
- [Anthropic Claude](https://www.anthropic.com/) — multi-agent LLM pipeline
- [SQLAlchemy](https://www.sqlalchemy.org/) + aiosqlite — async ORM
- [Pydantic](https://docs.pydantic.dev/) — schema validation
- [Uvicorn](https://www.uvicorn.org/) — ASGI server

---

## What I Learned / What Broke

- **Cookie size limits are a real production gotcha** — discovered via `ERR_TOO_MANY_REDIRECTS` on accounts with 2,000+ activities. Fixed by storing only the token (~200 bytes) and fetching data server-side on each `/confirm` load.
- **Strava pagination isn't obvious** — the API returns an empty array (not an error) when you exceed available pages. Implemented a stop condition on empty page response.
- **Agent chaining requires strict output schemas** — early versions of the pipeline failed when the Pattern Reader returned informal text; switching to JSON-schema-enforced outputs made the Storyteller reliable.
- **Server Components removed the need for a loading state** — initial approach used client-side fetching with a spinner; switching to a Server Component simplified the code significantly and kept the access token off the client.
