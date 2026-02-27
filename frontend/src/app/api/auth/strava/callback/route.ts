import { NextRequest, NextResponse } from 'next/server'
import { exchangeToken } from '@/lib/strava'

/**
 * GET /api/auth/strava/callback
 *
 * Strava redirects here after the user grants (or denies) access.
 *
 * Intentionally lightweight: we only exchange the code for a token and
 * store { access_token, athlete_id } in a small HttpOnly cookie (~200 bytes).
 * All heavy Strava API calls (stats, paginated activities) happen in the
 * /confirm Server Component so we never hit the 4 KB cookie size limit —
 * which would cause an ERR_TOO_MANY_REDIRECTS loop for athletes with large
 * activity histories.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/?error=strava_denied', request.url))
  }

  try {
    const token = await exchangeToken(code)

    // Store only what we need to identify the session — stays well under 4 KB
    const session = {
      access_token: token.access_token,
      athlete_id: token.athlete.id,
    }

    const response = NextResponse.redirect(new URL('/confirm', request.url))
    response.cookies.set('strava_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[strava/callback]', err)
    return NextResponse.redirect(
      new URL('/?error=strava_fetch_failed', request.url),
    )
  }
}
