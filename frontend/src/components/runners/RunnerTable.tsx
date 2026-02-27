"use client";
import Link from "next/link";
import type { Runner } from "@/lib/types";
import { useTriggerPipeline } from "@/hooks/useRunners";

function StatusBadge({ status, hasProfile }: { status: string | null; hasProfile: boolean }) {
  if (hasProfile) {
    return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Profile Ready</span>;
  }
  if (!status) {
    return <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500">No Profile</span>;
  }
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    running_agent_1: "bg-blue-100 text-blue-700",
    running_agent_2: "bg-blue-100 text-blue-700",
    running_agent_3: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
  };
  const color = colors[status] || "bg-zinc-100 text-zinc-500";
  const label = status.replace(/_/g, " ").replace("running ", "");
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>{label}</span>;
}

export default function RunnerTable({ runners }: { runners: Runner[] }) {
  const triggerMutation = useTriggerPipeline();

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200">
        <thead className="bg-zinc-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Runner</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">City</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Club</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Races</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {runners.map((runner) => (
            <tr key={runner.id} className="hover:bg-zinc-50">
              <td className="whitespace-nowrap px-6 py-4">
                <Link href={`/runners/${runner.id}`} className="font-medium text-zinc-900 hover:text-blue-600">
                  {runner.name}
                </Link>
                {runner.age && <span className="ml-2 text-sm text-zinc-400">{runner.age}y</span>}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">{runner.city || "-"}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">{runner.club_name || "-"}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">
                {runner.race_results?.length || 0}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <StatusBadge status={runner.latest_pipeline_status} hasProfile={runner.has_profile} />
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right">
                <button
                  onClick={() => triggerMutation.mutate({ runnerId: runner.id })}
                  disabled={triggerMutation.isPending || runner.latest_pipeline_status?.startsWith("running")}
                  className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                >
                  {runner.has_profile ? "Regenerate" : "Generate Profile"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
