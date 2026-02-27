from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from app.database import get_db
from app.schemas.runner import (
    RacePatch,
    RunnerCreate,
    RunnerListResponse,
    RunnerResponse,
    RunnerUpdate,
)
from app.services.runner_service import RunnerService

router = APIRouter(prefix="/runners", tags=["runners"])


@router.get("", response_model=RunnerListResponse)
async def list_runners(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    service = RunnerService(db)
    runners, total = await service.list_runners(skip, limit)
    enriched = [await service.get_runner_with_status(r) for r in runners]
    return RunnerListResponse(runners=enriched, total=total)


@router.post("", response_model=RunnerResponse, status_code=201)
async def create_runner(data: RunnerCreate, db: AsyncSession = Depends(get_db)):
    service = RunnerService(db)
    runner = await service.create_runner(data)
    return await service.get_runner_with_status(runner)


@router.get("/{runner_id}", response_model=RunnerResponse)
async def get_runner(runner_id: str, db: AsyncSession = Depends(get_db)):
    service = RunnerService(db)
    runner = await service.get_runner(runner_id)
    if not runner:
        raise HTTPException(status_code=404, detail="Runner not found")
    return await service.get_runner_with_status(runner)


@router.put("/{runner_id}", response_model=RunnerResponse)
async def update_runner(runner_id: str, data: RunnerUpdate, db: AsyncSession = Depends(get_db)):
    service = RunnerService(db)
    runner = await service.update_runner(runner_id, data)
    if not runner:
        raise HTTPException(status_code=404, detail="Runner not found")
    return await service.get_runner_with_status(runner)


@router.delete("/{runner_id}", status_code=204)
async def delete_runner(runner_id: str, db: AsyncSession = Depends(get_db)):
    service = RunnerService(db)
    deleted = await service.delete_runner(runner_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Runner not found")


@router.patch("/{runner_id}/races/{race_id}", response_model=Dict[str, Any])
async def patch_race(
    runner_id: str,
    race_id: str,
    data: RacePatch,
    db: AsyncSession = Depends(get_db),
):
    """Update mutable fields on a single race (finish_time, timing_link, hidden, claimed).

    race_results is a JSON column — SQLAlchemy won't detect in-place mutations,
    so we reassign the full list and call flag_modified before committing.
    """
    service = RunnerService(db)
    runner = await service.get_runner(runner_id)
    if not runner:
        raise HTTPException(status_code=404, detail="Runner not found")

    races = list(runner.race_results or [])
    race_index = next(
        (i for i, r in enumerate(races) if r.get("id") == race_id),
        None,
    )
    if race_index is None:
        raise HTTPException(status_code=404, detail="Race not found")

    # Merge only the fields that were explicitly sent
    patch_dict = data.dict(exclude_unset=True)
    races[race_index] = {**races[race_index], **patch_dict}

    # Reassign + flag so SQLAlchemy detects the change
    runner.race_results = races
    flag_modified(runner, "race_results")
    await db.commit()
    await db.refresh(runner)

    return runner.race_results[race_index]
