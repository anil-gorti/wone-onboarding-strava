from sqlalchemy import Boolean, Column, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Profile(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "profiles"

    runner_id = Column(String(36), ForeignKey("runners.id", ondelete="CASCADE"), nullable=False)
    classification_id = Column(String(36), ForeignKey("classifications.id", ondelete="CASCADE"), nullable=False)
    profile_content = Column(JSON, nullable=False)
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    model_used = Column(String(100), nullable=True)
    token_usage = Column(JSON, nullable=True)
    latency_ms = Column(Integer, nullable=True)

    runner = relationship("Runner", back_populates="profiles")
    classification = relationship("Classification", back_populates="profiles")
