import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ConfirmView from '@/components/confirm/ConfirmView'
import { getAthlete, getAthleteStats, getRaceActivities } from '@/lib/strava'
import {
  normalizeAthlete,
  normalizeStats,
  normalizeActivity,
  type StravaConfirmData,
} from '@/lib/normalize'

/**
 * /confirm — Server Component
 *
 * Reads the lightweight strava_session cookie (access_token + athlete_id),
 * then fetches athlete profile, stats, and race activities directly from
 * Strava on the server. This avoids storing large payloads in cookies, which
 * causes ERR_TOO_MANY_REDIRECTS for athletes with thousands of activities.
 */
export default async function ConfirmPage() {
  const cookieStore = await cookies()
  const raw = cookieStore.get('strava_session')?.value

  if (!raw) {
    redirect('/api/auth/strava')
  }

  const { access_token, athlete_id } = JSON.parse(raw) as {
    access_token: string
    athlete_id: number
  }

  try {
    const athlete = await getAthlete(access_token)
    const [stats, races] = await Promise.all([
      getAthleteStats(access_token, athlete_id),
      getRaceActivities(access_token),
    ])

    const data: StravaConfirmData = {
      athlete: normalizeAthlete(athlete),
      stats: normalizeStats(stats),
      races: races
        .map(normalizeActivity)
        .sort((a, b) => b.dateISO.localeCompare(a.dateISO)),
    }

    return <ConfirmView data={data} />
  } catch (err) {
    console.error('[confirm]', err)
    // Token may have expired — clear the session and re-auth
    const response = redirect('/api/auth/strava')
    return response
  }
}
