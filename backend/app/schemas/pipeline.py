from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class PipelineTriggerResponse(BaseModel):
    run_id: str
    runner_id: str
    status: str


class PipelineRunResponse(BaseModel):
    id: str
    runner_id: str
    runner_name: Optional[str] = None
    status: str
    agent_1_cached: bool
    agent_2_cached: bool
    error_stage: Optional[str]
    error_message: Optional[str]
    agent_1_latency_ms: Optional[int]
    agent_2_latency_ms: Optional[int]
    agent_3_latency_ms: Optional[int]
    total_latency_ms: Optional[int]
    started_at: Optional[str]
    completed_at: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


class PipelineRunListResponse(BaseModel):
    runs: List[PipelineRunResponse]
    total: int
