"use client";
import { useQuery } from "@tanstack/react-query";
import { getProfile, getEvidence, getClassification } from "@/lib/api";

export function useProfile(runnerId: string) {
  return useQuery({
    queryKey: ["profile", runnerId],
    queryFn: () => getProfile(runnerId),
    enabled: !!runnerId,
    retry: false,
  });
}

export function useEvidence(runnerId: string) {
  return useQuery({
    queryKey: ["evidence", runnerId],
    queryFn: () => getEvidence(runnerId),
    enabled: !!runnerId,
    retry: false,
  });
}

export function useClassification(runnerId: string) {
  return useQuery({
    queryKey: ["classification", runnerId],
    queryFn: () => getClassification(runnerId),
    enabled: !!runnerId,
    retry: false,
  });
}
