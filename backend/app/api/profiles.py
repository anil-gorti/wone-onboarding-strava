from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.classification import Classification
from app.models.evidence_brief import EvidenceBrief
from app.models.profile import Profile
from app.schemas.profile import ClassificationResponse, EvidenceBriefResponse, ProfileResponse

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/{runner_id}", response_model=ProfileResponse)
async def get_active_profile(runner_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Profile)
        .where(Profile.runner_id == runner_id, Profile.is_active == True)
        .limit(1)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="No active profile found")

    return ProfileResponse(
        id=profile.id,
        runner_id=profile.runner_id,
        classification_id=profile.classification_id,
        profile_content=profile.profile_content,
        version=profile.version,
        is_active=profile.is_active,
        model_used=profile.model_used,
        token_usage=profile.token_usage,
        latency_ms=profile.latency_ms,
        created_at=str(profile.created_at),
    )


@router.get("/{runner_id}/history")
async def get_profile_history(runner_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Profile)
        .where(Profile.runner_id == runner_id)
        .order_by(Profile.version.desc())
    )
    profiles = result.scalars().all()
    return [
        ProfileResponse(
            id=p.id,
            runner_id=p.runner_id,
            classification_id=p.classification_id,
            profile_content=p.profile_content,
            version=p.version,
            is_active=p.is_active,
            model_used=p.model_used,
            token_usage=p.token_usage,
            latency_ms=p.latency_ms,
            created_at=str(p.created_at),
        )
        for p in profiles
    ]


@router.get("/{runner_id}/evidence", response_model=EvidenceBriefResponse)
async def get_evidence_brief(runner_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(EvidenceBrief)
        .where(EvidenceBrief.runner_id == runner_id)
        .order_by(EvidenceBrief.created_at.desc())
        .limit(1)
    )
    brief = result.scalar_one_or_none()
    if not brief:
        raise HTTPException(status_code=404, detail="No evidence brief found")

    return EvidenceBriefResponse(
        id=brief.id,
        runner_id=brief.runner_id,
        source_data_hash=brief.source_data_hash,
        brief=brief.brief,
        model_used=brief.model_used,
        token_usage=brief.token_usage,
        latency_ms=brief.latency_ms,
        created_at=str(brief.created_at),
    )


@router.get("/{runner_id}/classification", response_model=ClassificationResponse)
async def get_classification(runner_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Classification)
        .where(Classification.runner_id == runner_id)
        .order_by(Classification.created_at.desc())
        .limit(1)
    )
    classification = result.scalar_one_or_none()
    if not classification:
        raise HTTPException(status_code=404, detail="No classification found")

    return ClassificationResponse(
        id=classification.id,
        runner_id=classification.runner_id,
        evidence_brief_id=classification.evidence_brief_id,
        primary_archetype=classification.primary_archetype,
        confidence=classification.confidence,
        classification=classification.classification,
        model_used=classification.model_used,
        token_usage=classification.token_usage,
        latency_ms=classification.latency_ms,
        created_at=str(classification.created_at),
    )
