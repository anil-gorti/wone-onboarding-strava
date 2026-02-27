import { redirect } from 'next/navigation'

/**
 * GET /api/auth/strava
 *
 * Redirects the browser to Strava's OAuth authorisation page.
 * The scopes requested are the minimum needed for profile + activity data:
 *   - read               → public profile
 *   - profile:read_all   → private profile fields (city, etc.)
 *   - activity:read_all  → all activities including private ones
 */
export function GET() {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: process.env.STRAVA_REDIRECT_URI!,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,profile:read_all,activity:read_all',
  })

  redirect(`https://www.strava.com/oauth/authorize?${params.toString()}`)
}
