'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MapPin, ArrowRight, RefreshCw, Loader2 } from 'lucide-react'
import type { StravaConfirmData, NormalizedRace } from '@/lib/normalize'

interface Props {
  data: StravaConfirmData
}

export default function ConfirmView({ data }: Props) {
  const { athlete, stats, races } = data
  const recentRaces = races.slice(0, 3)
  const router = useRouter()
  const [building, setBuilding] = useState(false)
  const [buildError, setBuildError] = useState<string | null>(null)

  async function handleBuild() {
    setBuilding(true)
    setBuildError(null)
    try {
      const res = await fetch('/api/runners/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athlete, races }),
      })
      if (!res.ok) throw new Error('Failed to create profile')
      router.push('/my-results')
    } catch {
      setBuildError('Something went wrong. Please try again.')
      setBuilding(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAF9] flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-lg">

        {/* ── WONE wordmark ──────────────────────────────────────────── */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-orange-500">
            WONE
          </span>
        </div>

        {/* ── Athlete hero ───────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative w-28 h-28 mb-5">
            <Image
              src={athlete.photo}
              alt={athlete.name}
              fill
              sizes="112px"
              className="rounded-full object-cover ring-4 ring-orange-500 ring-offset-4 ring-offset-[#FAFAF9] shadow-xl"
              priority
            />
          </div>

          <h1 className="text-4xl font-black text-gray-950 tracking-tight leading-none mb-2">
            {athlete.name}
          </h1>

          {athlete.location && (
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{athlete.location}</span>
            </div>
          )}
        </div>

        {/* ── All-time stats ─────────────────────────────────────────── */}
        <div className="grid grid-cols-4 mb-10">
          <StatPillar
            value={stats.allTime.runs.toLocaleString()}
            label="Races"
            sub="all time"
          />
          <StatPillar
            value={`${Number(stats.allTime.distanceKm).toLocaleString()} km`}
            label="Distance"
            sub="all time"
          />
          <StatPillar
            value={stats.ytd.hours}
            label="Hours"
            sub="this year"
          />
          <StatPillar
            value={`${Number(stats.ytd.elevationM).toLocaleString()} m`}
            label="Elevation"
            sub="this year"
          />
        </div>

        {/* ── Divider ────────────────────────────────────────────────── */}
        <div className="h-px bg-gray-100 mb-8" />

        {/* ── Recent races ───────────────────────────────────────────── */}
        {recentRaces.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400">
                Recent races
              </span>
              {races.length > 3 && (
                <a
                  href="/my-results"
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
                >
                  See all {races.length} <ArrowRight className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="space-y-1">
              {recentRaces.map((race) => (
                <RecentRaceRow key={race.id} race={race} />
              ))}
            </div>
          </div>
        )}

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <button
          onClick={handleBuild}
          disabled={building}
          className="w-full bg-gray-950 hover:bg-gray-800 active:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-950/20"
        >
          {building ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Building your profile…
            </>
          ) : (
            <>
              Build my WONE profile
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {buildError && (
          <p className="text-center text-sm text-red-500 mt-3">{buildError}</p>
        )}

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="text-center mt-6">
          <a
            href="/api/auth/strava"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Reconnect Strava
          </a>
        </div>

      </div>
    </main>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPillar({
  value,
  label,
  sub,
}: {
  value: string
  label: string
  sub: string
}) {
  return (
    <div className="flex flex-col items-center text-center px-2">
      <span className="text-2xl font-black text-gray-950 leading-none mb-1">
        {value}
      </span>
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      <span className="text-[10px] text-gray-400 mt-0.5">{sub}</span>
    </div>
  )
}

function RecentRaceRow({ race }: { race: NormalizedRace }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-gray-900 text-sm truncate">
          {race.name}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {race.date} · {race.distance}
        </div>
      </div>
      <div className="text-sm font-bold text-gray-700 tabular-nums ml-4 shrink-0">
        {race.time}
      </div>
    </div>
  )
}
