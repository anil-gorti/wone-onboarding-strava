from sqlalchemy import Column, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class EvidenceBrief(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "evidence_briefs"

    runner_id = Column(String(36), ForeignKey("runners.id", ondelete="CASCADE"), nullable=False)
    source_data_hash = Column(String(64), nullable=False)
    brief = Column(JSON, nullable=False)
    model_used = Column(String(100), nullable=True)
    token_usage = Column(JSON, nullable=True)
    latency_ms = Column(Integer, nullable=True)

    runner = relationship("Runner", back_populates="evidence_briefs")
    classifications = relationship("Classification", back_populates="evidence_brief", cascade="all, delete-orphan")
