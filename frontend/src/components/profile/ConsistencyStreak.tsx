interface StreakData {
  months: { month: string; active: boolean; races?: number }[];
  longest_streak: number;
}

export default function ConsistencyStreak({ data }: { data: StreakData }) {
  const months = data?.months || [];
  if (months.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Activity Pattern
        {data.longest_streak > 0 && (
          <span className="ml-2 font-normal normal-case text-zinc-500">
            {data.longest_streak} month streak
          </span>
        )}
      </h3>
      <div className="flex flex-wrap gap-1">
        {months.map((m, i) => (
          <div
            key={i}
            title={`${m.month}${m.races ? `: ${m.races} race(s)` : ""}`}
            className={`h-6 w-6 rounded-sm ${
              m.active
                ? m.races && m.races > 1
                  ? "bg-emerald-600"
                  : "bg-emerald-400"
                : "bg-zinc-100"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-zinc-400">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-zinc-100" /> Inactive
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-emerald-400" /> Active
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-emerald-600" /> Multiple races
        </div>
      </div>
    </div>
  );
}
