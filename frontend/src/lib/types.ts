export interface RaceResult {
  id: string;                        // UUID assigned server-side
  event_name: string;
  date: string | null;
  distance: string | null;
  finish_time: string | null;
  timing_link: string | null;        // URL to timing company results page
  hidden: boolean;                   // athlete hid this from their public profile
  claimed: boolean;                  // false = "this race might not be mine"
  category_rank: number | null;
  overall_rank: number | null;
  total_participants: number | null;
  source: string;
  notes: string | null;
}

/** Partial update sent to PATCH /runners/:id/races/:raceId */
export interface RacePatch {
  finish_time?: string | null;
  timing_link?: string | null;
  hidden?: boolean;
  claimed?: boolean;
}

export interface Runner {
  id: string;
  name: string;
  email: string | null;
  age: number | null;
  gender: string | null;
  city: string | null;
  club_name: string | null;
  club_join_date: string | null;
  self_reported_running_since: string | null;
  race_results: RaceResult[];
  external_data: Record<string, unknown>;
  self_reported: Record<string, unknown>;
  raw_data_hash: string | null;
  created_at: string;
  updated_at: string;
  has_profile: boolean;
  latest_pipeline_status: string | null;
}

export interface RunnerListResponse {
  runners: Runner[];
  total: number;
}

export interface PipelineTriggerResponse {
  run_id: string;
  runner_id: string;
  status: string;
}

export interface PipelineRun {
  id: string;
  runner_id: string;
  runner_name: string | null;
  status: string;
  agent_1_cached: boolean;
  agent_2_cached: boolean;
  error_stage: string | null;
  error_message: string | null;
  agent_1_latency_ms: number | null;
  agent_2_latency_ms: number | null;
  agent_3_latency_ms: number | null;
  total_latency_ms: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface PipelineRunListResponse {
  runs: PipelineRun[];
  total: number;
}

export interface StatBarItem {
  label: string;
  value: string;
  icon_hint: string;
}

export interface ProfileComponent {
  type: string;
  priority: number;
  data: Record<string, unknown>;
  narrative: string | null;
}

export interface ProfileContent {
  headline: string;
  tagline: string | null;
  stat_bar: StatBarItem[];
  components: ProfileComponent[];
  excluded_components: { type: string; reason: string }[];
  profile_stage: string;
  suggested_next_action: {
    action: string;
    reason: string;
  };
}

export interface ProfileMeta {
  archetype_used: string;
  tone_applied: string;
  data_density: string;
  components_count: number;
  generation_notes: string;
}

export interface Profile {
  id: string;
  runner_id: string;
  classification_id: string;
  profile_content: {
    runner_id?: string;
    profile_content?: ProfileContent;
    meta?: ProfileMeta;
  };
  version: number;
  is_active: boolean;
  model_used: string | null;
  token_usage: Record<string, unknown> | null;
  latency_ms: number | null;
  created_at: string;
}

export interface EvidenceBrief {
  id: string;
  runner_id: string;
  source_data_hash: string;
  brief: Record<string, unknown>;
  model_used: string | null;
  created_at: string;
}

export interface Classification {
  id: string;
  runner_id: string;
  primary_archetype: string;
  confidence: number;
  classification: Record<string, unknown>;
  model_used: string | null;
  created_at: string;
}
