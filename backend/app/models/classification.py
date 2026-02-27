from sqlalchemy import Column, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Classification(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "classifications"

    runner_id = Column(String(36), ForeignKey("runners.id", ondelete="CASCADE"), nullable=False)
    evidence_brief_id = Column(String(36), ForeignKey("evidence_briefs.id", ondelete="CASCADE"), nullable=False)
    brief_hash = Column(String(64), nullable=False)
    primary_archetype = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    classification = Column(JSON, nullable=False)
    model_used = Column(String(100), nullable=True)
    token_usage = Column(JSON, nullable=True)
    latency_ms = Column(Integer, nullable=True)

    runner = relationship("Runner", back_populates="classifications")
    evidence_brief = relationship("EvidenceBrief", back_populates="classifications")
    profiles = relationship("Profile", back_populates="classification", cascade="all, delete-orphan")
