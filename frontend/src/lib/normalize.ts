import type { StravaAthlete, StravaStats, StravaActivity } from './strava'

// ─── Output types (used by the confirm page + stored in cookie) ───────────────

export interface NormalizedAthlete {
  id: number
  name: string
  username: string
  photo: string     // full-size profile photo URL
  location: string  // "City, State, Country" (any parts that exist)
  sex: string
}

export interface NormalizedStats {
  ytd: {
    runs: number
    distanceKm: string
    hours: string
    elevationM: string
  }
  allTime: {
    runs: number
    distanceKm: string
  }
}

export interface NormalizedRace {
  id: number
  name: string
  date: string     // human-readable, e.g. "Mar 15, 2024"
  dateISO: string  // for sorting
  distance: string // formatted, e.g. "42.2 km"
  distanceM: number
  time: string     // H:MM:SS
  type: string     // "Run" | "Ride" etc.
}

export interface StravaConfirmData {
  athlete: NormalizedAthlete
  stats: NormalizedStats
  races: NormalizedRace[]
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDistanceKm(metres: number): string {
  const km = metres / 1000
  // Show more precision for shorter distances
  return km >= 10 ? `${km.toFixed(1)} km` : `${km.toFixed(2)} km`
}

function buildLocation(a: StravaAthlete): string {
  return [a.city, a.state, a.country].filter(Boolean).join(', ')
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

export function normalizeAthlete(raw: StravaAthlete): NormalizedAthlete {
  return {
    id: raw.id,
    name: `${raw.firstname} ${raw.lastname}`.trim(),
    username: raw.username,
    photo: raw.profile,
    location: buildLocation(raw),
    sex: raw.sex,
  }
}

export function normalizeStats(raw: StravaStats): NormalizedStats {
  const ytd = raw.ytd_run_totals
  const all = raw.all_run_totals
  return {
    ytd: {
      runs: ytd.count,
      distanceKm: (ytd.distance / 1000).toFixed(0),
      hours: (ytd.moving_time / 3600).toFixed(0),
      elevationM: ytd.elevation_gain.toFixed(0),
    },
    allTime: {
      runs: all.count,
      distanceKm: (all.distance / 1000).toFixed(0),
    },
  }
}

export function normalizeActivity(raw: StravaActivity): NormalizedRace {
  const date = new Date(raw.start_date_local)
  return {
    id: raw.id,
    name: raw.name,
    date: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    dateISO: raw.start_date_local,
    distance: formatDistanceKm(raw.distance),
    distanceM: raw.distance,
    time: formatDuration(raw.moving_time),
    type: raw.sport_type || raw.type,
  }
}
