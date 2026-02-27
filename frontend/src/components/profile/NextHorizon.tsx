import { ArrowRight } from "lucide-react";

export default function NextHorizon({ data }: { data: { suggestion: string; reason?: string } }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-5">
      <div className="flex items-start gap-3">
        <ArrowRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-400" />
        <div>
          <div className="text-sm font-medium text-zinc-900">{data.suggestion}</div>
          {data.reason && <p className="mt-1 text-xs text-zinc-500">{data.reason}</p>}
        </div>
      </div>
    </div>
  );
}
