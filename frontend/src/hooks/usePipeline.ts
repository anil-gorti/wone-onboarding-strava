"use client";
import { useQuery } from "@tanstack/react-query";
import { listPipelineRuns, getPipelineRun } from "@/lib/api";

export function usePipelineRuns() {
  return useQuery({
    queryKey: ["pipelineRuns"],
    queryFn: listPipelineRuns,
    refetchInterval: 5000,
  });
}

export function usePipelineRun(runId: string) {
  return useQuery({
    queryKey: ["pipelineRun", runId],
    queryFn: () => getPipelineRun(runId),
    enabled: !!runId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === "completed" || data.status === "failed")) {
        return false;
      }
      return 2000;
    },
  });
}
