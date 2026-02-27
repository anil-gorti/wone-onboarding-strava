const STRAVA_BASE = 'https://www.strava.com/api/v3'

// ─── Response types ───────────────────────────────────────────────────────────

export interface StravaToken {
  access_token: string
  refresh_token: string
  expires_at: number
  token_type: string
  athlete: StravaAthlete
}

export interface StravaAthlete {
  id: number
  username: string
  firstname: string
  lastname: string
  city: string | null
  state: string | null
  country: string | null
  sex: string
  profile: string        // full-size photo URL
  profile_medium: string // 62x62 photo URL
  created_at: string
  updated_at: string
}

interface RunTotals {
  count: number
  distance: number      // metres
  moving_time: number   // seconds
  elapsed_time: number  // seconds
  elevation_gain: number
}

export interface StravaStats {
  recent_run_totals: RunTotals
  ytd_run_totals: RunTotals
  all_run_totals: RunTotals
}

export interface StravaActivity {
  id: number
  name: string
  distance: number           // metres
  moving_time: number        // seconds
  elapsed_time: number       // seconds
  total_elevation_gain: number
  type: string               // legacy field
  sport_type: string         // e.g. "Run", "Ride"
  start_date: string         // UTC ISO-8601
  start_date_local: string   // local ISO-8601
  workout_type: number | null // 1 = Race (run), 11 = Race (ride)
  average_speed: number      // m/s
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function stravaFetch<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${STRAVA_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    // Opt out of Next.js fetch caching — token data must stay fresh
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Strava API error ${res.status} on ${path}`)
  }
  return res.json() as Promise<T>
}

// ─── Public functions ─────────────────────────────────────────────────────────

/**
 * Exchange an authorisation code for an access token.
 * Called from the OAuth callback route.
 */
export async function exchangeToken(code: string): Promise<StravaToken> {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Strava token exchange failed: ${res.status}`)
  }
  return res.json() as Promise<StravaToken>
}

/** Fetch the authenticated athlete's profile. */
export async function getAthlete(accessToken: string): Promise<StravaAthlete> {
  return stravaFetch<StravaAthlete>('/athlete', accessToken)
}

/** Fetch aggregate stats for a given athlete. */
export async function getAthleteStats(
  accessToken: string,
  athleteId: number,
): Promise<StravaStats> {
  return stravaFetch<StravaStats>(`/athletes/${athleteId}/stats`, accessToken)
}

/**
 * Fetch all activities flagged as races (workout_type 1 = run race, 11 = ride race).
 * Paginates up to 5 pages × 200 activities = 1 000 max.
 */
export async function getRaceActivities(
  accessToken: string,
): Promise<StravaActivity[]> {
  const PER_PAGE = 200
  const MAX_PAGES = 5
  const races: StravaActivity[] = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await stravaFetch<StravaActivity[]>(
      `/athlete/activities?per_page=${PER_PAGE}&page=${page}`,
      accessToken,
    )
    if (batch.length === 0) break

    for (const a of batch) {
      if (a.workout_type === 1 || a.workout_type === 11) {
        races.push(a)
      }
    }

    if (batch.length < PER_PAGE) break // no more pages
  }

  return races
}
