from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    runner_id: str
    classification_id: str
    profile_content: Dict[str, Any]
    version: int
    is_active: bool
    model_used: Optional[str]
    token_usage: Optional[Dict[str, Any]]
    latency_ms: Optional[int]
    created_at: str


class EvidenceBriefResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    runner_id: str
    source_data_hash: str
    brief: Dict[str, Any]
    model_used: Optional[str]
    token_usage: Optional[Dict[str, Any]]
    latency_ms: Optional[int]
    created_at: str


class ClassificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    runner_id: str
    evidence_brief_id: str
    primary_archetype: str
    confidence: float
    classification: Dict[str, Any]
    model_used: Optional[str]
    token_usage: Optional[Dict[str, Any]]
    latency_ms: Optional[int]
    created_at: str
