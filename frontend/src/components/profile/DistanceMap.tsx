interface DistanceEntry {
  distance: string;
  count: number;
  best_time?: string;
}

export default function DistanceMap({ data }: { data: { distances: DistanceEntry[] } }) {
  const distances = data?.distances || [];
  if (distances.length === 0) return null;

  const maxCount = Math.max(...distances.map((d) => d.count));

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Distance Profile</h3>
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="space-y-3">
          {distances.map((d, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-28 flex-shrink-0 text-sm font-medium text-zinc-700">{d.distance}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-6 rounded bg-blue-500/20" style={{ width: `${(d.count / maxCount) * 100}%` }}>
                    <div
                      className="h-full rounded bg-blue-500"
                      style={{ width: `${(d.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500">
                    {d.count}x {d.best_time && `(best: ${d.best_time})`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
