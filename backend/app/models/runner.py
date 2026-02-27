from sqlalchemy import Column, Float, Integer, JSON, String
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Runner(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "runners"

    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    club_name = Column(String(255), nullable=True)
    club_join_date = Column(String(7), nullable=True)  # YYYY-MM
    self_reported_running_since = Column(String(4), nullable=True)  # YYYY

    race_results = Column(JSON, default=list)
    external_data = Column(JSON, default=dict)
    self_reported = Column(JSON, default=dict)

    raw_data_hash = Column(String(64), nullable=True)

    evidence_briefs = relationship("EvidenceBrief", back_populates="runner", cascade="all, delete-orphan")
    classifications = relationship("Classification", back_populates="runner", cascade="all, delete-orphan")
    profiles = relationship("Profile", back_populates="runner", cascade="all, delete-orphan")
    pipeline_runs = relationship("PipelineRun", back_populates="runner", cascade="all, delete-orphan")
