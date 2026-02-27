import { NextRequest, NextResponse } from 'next/server'
import type { NormalizedAthlete, NormalizedRace } from '@/lib/normalize'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

/**
 * POST /api/runners/create
 *
 * Called by the "Build my WONE profile" button on /confirm.
 * 1. Maps normalised Strava data → RunnerCreate payload.
 * 2. POSTs to the backend to create (or find) the Runner record.
 * 3. Reads the existing strava_session cookie, merges in runner_id.
 * 4. Sets the updated cookie and returns { runner_id }.
 *
 * Because strava_session is HttpOnly it cannot be written from client JS,
 * so this Route Handler acts as the secure bridge.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      athlete: NormalizedAthlete
      races: NormalizedRace[]
    }

    // Map to the backend RunnerCreate schema
    const runnerPayload = {
      name: body.athlete.name,
      city: body.athlete.location.split(',')[0]?.trim() ?? null,
      race_results: body.races.map((r) => ({
        event_name: r.name,
        date: r.dateISO.split('T')[0] ?? null,
        distance: r.distance,
        finish_time: r.time,
        source: 'strava',
      })),
      external_data: {
        strava_connected: true,
        strava_athlete_id: body.athlete.id,
      },
    }

    const backendRes = await fetch(`${BACKEND_URL}/runners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(runnerPayload),
      cache: 'no-store',
    })

    if (!backendRes.ok) {
      throw new Error(`Backend returned ${backendRes.status}`)
    }

    const runner = await backendRes.json() as { id: string }

    // Merge runner_id into the existing strava_session cookie
    const existingRaw = request.cookies.get('strava_session')?.value ?? '{}'
    const existingSession = JSON.parse(existingRaw)
    const updatedSession = { ...existingSession, runner_id: runner.id }

    const response = NextResponse.json({ runner_id: runner.id })
    response.cookies.set('strava_session', JSON.stringify(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days — long enough for onboarding
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[runners/create]', err)
    return NextResponse.json(
      { error: 'Failed to create runner profile' },
      { status: 500 },
    )
  }
}
