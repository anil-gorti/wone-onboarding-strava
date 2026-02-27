import { Star } from "lucide-react";

interface Milestone {
  title: string;
  date?: string;
  description?: string;
}

export default function MilestoneCards({ data }: { data: { milestones: Milestone[] } }) {
  const milestones = data?.milestones || [];
  if (milestones.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Milestones</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {milestones.map((m, i) => (
          <div key={i} className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
              <div>
                <div className="font-medium text-zinc-900">{m.title}</div>
                {m.date && <div className="text-xs text-zinc-400">{m.date}</div>}
                {m.description && <p className="mt-1 text-sm text-zinc-600">{m.description}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
