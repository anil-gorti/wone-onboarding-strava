import uuid
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class RaceResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_name: str
    date: Optional[str] = None
    distance: Optional[str] = None
    finish_time: Optional[str] = None
    timing_link: Optional[str] = None   # URL to timing company results page
    hidden: bool = False                # athlete hid this from their public profile
    claimed: bool = True                # False = "this race might not be mine"
    category_rank: Optional[int] = None
    overall_rank: Optional[int] = None
    total_participants: Optional[int] = None
    source: str = "self_reported"
    notes: Optional[str] = None


class RacePatch(BaseModel):
    """Partial update for a single race — all fields optional."""
    finish_time: Optional[str] = None
    timing_link: Optional[str] = None
    hidden: Optional[bool] = None
    claimed: Optional[bool] = None


class ExternalData(BaseModel):
    strava_connected: bool = False
    monthly_volume_km: Optional[float] = None
    recent_activity_types: List[str] = []
    other_platforms: List[str] = []


class SelfReported(BaseModel):
    favorite_distance: Optional[str] = None
    goals: Optional[str] = None
    injuries_mentioned: Optional[str] = None
    other_sports: List[str] = []
    coaching_status: str = "unknown"


class RunnerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    club_name: Optional[str] = None
    club_join_date: Optional[str] = None
    self_reported_running_since: Optional[str] = None
    race_results: List[RaceResult] = []
    external_data: ExternalData = ExternalData()
    self_reported: SelfReported = SelfReported()


class RunnerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    club_name: Optional[str] = None
    club_join_date: Optional[str] = None
    self_reported_running_since: Optional[str] = None
    race_results: Optional[List[RaceResult]] = None
    external_data: Optional[ExternalData] = None
    self_reported: Optional[SelfReported] = None


class RunnerResponse(BaseModel):
    id: str
    name: str
    email: Optional[str]
    age: Optional[int]
    gender: Optional[str]
    city: Optional[str]
    club_name: Optional[str]
    club_join_date: Optional[str]
    self_reported_running_since: Optional[str]
    race_results: List[Dict[str, Any]]
    external_data: Dict[str, Any]
    self_reported: Dict[str, Any]
    raw_data_hash: Optional[str]
    created_at: str
    updated_at: str
    has_profile: bool = False
    latest_pipeline_status: Optional[str] = None

    class Config:
        from_attributes = True


class RunnerListResponse(BaseModel):
    runners: List[RunnerResponse]
    total: int
