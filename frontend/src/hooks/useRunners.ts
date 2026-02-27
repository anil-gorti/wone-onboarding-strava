"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listRunners, getRunner, triggerPipeline } from "@/lib/api";

export function useRunners() {
  return useQuery({
    queryKey: ["runners"],
    queryFn: listRunners,
    refetchInterval: 10000,
  });
}

export function useRunner(id: string) {
  return useQuery({
    queryKey: ["runner", id],
    queryFn: () => getRunner(id),
    enabled: !!id,
  });
}

export function useTriggerPipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ runnerId, fromStage }: { runnerId: string; fromStage?: number }) =>
      triggerPipeline(runnerId, fromStage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runners"] });
      queryClient.invalidateQueries({ queryKey: ["pipelineRuns"] });
    },
  });
}
