from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class PipelineRun(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "pipeline_runs"

    runner_id = Column(String(36), ForeignKey("runners.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), nullable=False, default="pending")

    evidence_brief_id = Column(String(36), ForeignKey("evidence_briefs.id"), nullable=True)
    classification_id = Column(String(36), ForeignKey("classifications.id"), nullable=True)
    profile_id = Column(String(36), ForeignKey("profiles.id"), nullable=True)

    agent_1_cached = Column(Boolean, default=False)
    agent_2_cached = Column(Boolean, default=False)

    error_stage = Column(String(20), nullable=True)
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)

    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    agent_1_latency_ms = Column(Integer, nullable=True)
    agent_2_latency_ms = Column(Integer, nullable=True)
    agent_3_latency_ms = Column(Integer, nullable=True)
    total_latency_ms = Column(Integer, nullable=True)

    runner = relationship("Runner", back_populates="pipeline_runs")
