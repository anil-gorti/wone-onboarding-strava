interface RaceEvent {
  event_name: string;
  date: string;
  distance: string;
  finish_time: string;
  highlight?: boolean;
  note?: string;
}

export default function RaceTimeline({ data, narrative }: { data: { races: RaceEvent[] }; narrative: string | null }) {
  const races = data?.races || [];
  if (races.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Race Timeline</h3>
      {narrative && <p className="text-sm text-zinc-600">{narrative}</p>}
      <div className="space-y-2">
        {races.map((race, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 rounded-lg border p-3 ${
              race.highlight ? "border-blue-200 bg-blue-50" : "border-zinc-200 bg-white"
            }`}
          >
            <div className="w-20 flex-shrink-0 text-xs text-zinc-400">{race.date}</div>
            <div className="flex-1">
              <div className="font-medium text-zinc-900">{race.event_name}</div>
              <div className="text-xs text-zinc-500">
                {race.distance} &middot; {race.finish_time}
              </div>
            </div>
            {race.note && (
              <div className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">{race.note}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
