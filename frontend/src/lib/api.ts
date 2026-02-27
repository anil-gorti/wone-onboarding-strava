import type {
  Runner,
  RunnerListResponse,
  RaceResult,
  RacePatch,
  PipelineTriggerResponse,
  PipelineRun,
  PipelineRunListResponse,
  Profile,
  EvidenceBrief,
  Classification,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error ${res.status}: ${error}`);
  }
  return res.json();
}

// Runners
export const listRunners = () => fetchJSON<RunnerListResponse>("/runners");

export const getRunner = (id: string) => fetchJSON<Runner>(`/runners/${id}`);

export const createRunner = (data: Record<string, unknown>) =>
  fetchJSON<Runner>("/runners", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Pipeline
export const triggerPipeline = (runnerId: string, fromStage = 1) =>
  fetchJSON<PipelineTriggerResponse>(
    `/pipeline/run/${runnerId}?from_stage=${fromStage}`,
    { method: "POST" }
  );

export const listPipelineRuns = () =>
  fetchJSON<PipelineRunListResponse>("/pipeline/runs");

export const getPipelineRun = (runId: string) =>
  fetchJSON<PipelineRun>(`/pipeline/runs/${runId}`);

/** Update mutable fields on a single race result. */
export const patchRace = (runnerId: string, raceId: string, updates: RacePatch) =>
  fetchJSON<RaceResult>(`/runners/${runnerId}/races/${raceId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

// Profiles
export const getProfile = (runnerId: string) =>
  fetchJSON<Profile>(`/profiles/${runnerId}`);

export const getEvidence = (runnerId: string) =>
  fetchJSON<EvidenceBrief>(`/profiles/${runnerId}/evidence`);

export const getClassification = (runnerId: string) =>
  fetchJSON<Classification>(`/profiles/${runnerId}/classification`);
