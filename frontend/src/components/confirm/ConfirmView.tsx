'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp, MapPin, User, Activity, Trophy } from 'lucide-react'
import type { StravaConfirmData, NormalizedRace } from '@/lib/normalize'

interface Props {
  data: StravaConfirmData
}

export default function ConfirmView({ data }: Props) {
  const { athlete, stats, races } = data
  const [racesOpen, setRacesOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="text-center pb-4">
          <span className="inline-block text-orange-500 font-semibold text-xs tracking-widest uppercase mb-3">
            Strava Connected
          </span>
          <h1 className="text-3xl font-bold text-gray-900">Confirm your profile</h1>
          <p className="text-gray-500 text-sm mt-2">
            Review your Strava data before we build your WONE profile.
          </p>
        </div>

        {/* ── Athlete card ─────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
          <div className="relative w-20 h-20 shrink-0">
            <Image
              src={athlete.photo}
              alt={athlete.name}
              fill
              sizes="80px"
              className="rounded-full object-cover ring-4 ring-orange-50"
              priority
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 truncate">{athlete.name}</h2>

            {athlete.username && (
              <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-0.5">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>@{athlete.username}</span>
              </div>
            )}

            {athlete.location && (
              <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{athlete.location}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── Aggregate stats ──────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-orange-500" />
            <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
              This year
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile label="Runs"      value={String(stats.ytd.runs)} />
            <StatTile label="Distance"  value={`${stats.ytd.distanceKm} km`} />
            <StatTile label="Hours"     value={stats.ytd.hours} />
            <StatTile label="Elevation" value={`${stats.ytd.elevationM} m`} />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
            <span>
              All-time runs:{' '}
              <strong className="text-gray-800">{stats.allTime.runs.toLocaleString()}</strong>
            </span>
            <span>
              All-time distance:{' '}
              <strong className="text-gray-800">{Number(stats.allTime.distanceKm).toLocaleString()} km</strong>
            </span>
          </div>
        </section>

        {/* ── Race list (toggleable) ───────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setRacesOpen((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
            aria-expanded={racesOpen}
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-gray-800">Race history</span>
              <span className="text-sm text-gray-400">
                ({races.length} {races.length === 1 ? 'race' : 'races'} found)
              </span>
            </div>
            {racesOpen
              ? <ChevronUp   className="w-5 h-5 text-gray-400 shrink-0" />
              : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
          </button>

          {racesOpen && (
            <div className="divide-y divide-gray-50">
              {races.length === 0 ? (
                <div className="px-6 py-10 text-center text-gray-400 text-sm">
                  No activities are marked as races in your Strava history.
                  <br />
                  <span className="text-xs">
                    Edit an activity in Strava and set the type to &ldquo;Race&rdquo; for it to appear here.
                  </span>
                </div>
              ) : (
                races.map((race) => <RaceRow key={race.id} race={race} />)
              )}
            </div>
          )}
        </section>

        {/* ── Action bar ──────────────────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          <a
            href="/api/auth/strava"
            className="flex-1 text-center py-3 px-4 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Reconnect Strava
          </a>
          <button className="flex-1 py-3 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 active:bg-orange-700 transition-colors">
            Build my profile →
          </button>
        </div>

      </div>
    </main>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

function RaceRow({ race }: { race: NormalizedRace }) {
  return (
    <div className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
      <div className="min-w-0">
        <div className="font-medium text-gray-800 truncate">{race.name}</div>
        <div className="text-xs text-gray-400 mt-0.5">
          {race.date} &middot; {race.type}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-semibold text-gray-700">{race.time}</div>
        <div className="text-xs text-gray-400">{race.distance}</div>
      </div>
    </div>
  )
}
