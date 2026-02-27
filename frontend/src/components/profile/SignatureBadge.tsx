import { Award } from "lucide-react";

export default function SignatureBadge({ data }: { data: { badge_label: string; description?: string } }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2">
      <Award className="h-4 w-4 text-amber-500" />
      <span className="text-sm font-semibold text-zinc-900">{data.badge_label}</span>
      {data.description && <span className="text-xs text-zinc-500">&middot; {data.description}</span>}
    </div>
  );
}
