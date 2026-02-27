import hashlib
import json
import uuid
from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.runner import Runner
from app.models.profile import Profile
from app.models.pipeline_run import PipelineRun
from app.schemas.runner import RunnerCreate, RunnerUpdate


def compute_raw_data_hash(runner: Runner) -> str:
    data = json.dumps(
        {
            "race_results": runner.race_results or [],
            "external_data": runner.external_data or {},
            "self_reported": runner.self_reported or {},
        },
        sort_keys=True,
    )
    return hashlib.sha256(data.encode()).hexdigest()


class RunnerService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_runners(self, skip: int = 0, limit: int = 50) -> tuple:
        count_result = await self.db.execute(select(func.count(Runner.id)))
        total = count_result.scalar()

        result = await self.db.execute(
            select(Runner).order_by(Runner.created_at.desc()).offset(skip).limit(limit)
        )
        runners = result.scalars().all()
        return runners, total

    async def get_runner(self, runner_id: str) -> Optional[Runner]:
        result = await self.db.execute(select(Runner).where(Runner.id == runner_id))
        return result.scalar_one_or_none()

    async def create_runner(self, data: RunnerCreate) -> Runner:
        runner = Runner(
            name=data.name,
            email=data.email,
            age=data.age,
            gender=data.gender,
            city=data.city,
            club_name=data.club_name,
            club_join_date=data.club_join_date,
            self_reported_running_since=data.self_reported_running_since,
            race_results=[r.dict() for r in data.race_results],
            external_data=data.external_data.dict(),
            self_reported=data.self_reported.dict(),
        )
        runner.raw_data_hash = compute_raw_data_hash(runner)
        self.db.add(runner)
        await self.db.commit()
        await self.db.refresh(runner)
        return runner

    async def update_runner(self, runner_id: str, data: RunnerUpdate) -> Optional[Runner]:
        runner = await self.get_runner(runner_id)
        if not runner:
            return None

        update_data = data.dict(exclude_unset=True)
        if "race_results" in update_data and update_data["race_results"] is not None:
            update_data["race_results"] = [r.dict() if hasattr(r, "dict") else r for r in update_data["race_results"]]
        if "external_data" in update_data and update_data["external_data"] is not None:
            update_data["external_data"] = update_data["external_data"].dict() if hasattr(update_data["external_data"], "dict") else update_data["external_data"]
        if "self_reported" in update_data and update_data["self_reported"] is not None:
            update_data["self_reported"] = update_data["self_reported"].dict() if hasattr(update_data["self_reported"], "dict") else update_data["self_reported"]

        for key, value in update_data.items():
            setattr(runner, key, value)

        runner.raw_data_hash = compute_raw_data_hash(runner)
        await self.db.commit()
        await self.db.refresh(runner)
        return runner

    async def delete_runner(self, runner_id: str) -> bool:
        runner = await self.get_runner(runner_id)
        if not runner:
            return False
        await self.db.delete(runner)
        await self.db.commit()
        return True

    async def backfill_race_ids(self, runner: Runner) -> None:
        """Lazily assign UUIDs to any race that was stored without one.

        race_results is a JSON column — SQLAlchemy won't detect in-place
        mutations, so we must reassign the list and call flag_modified.
        """
        from sqlalchemy.orm.attributes import flag_modified

        races = list(runner.race_results or [])
        modified = any(not r.get("id") for r in races)
        if modified:
            for r in races:
                if not r.get("id"):
                    r["id"] = str(uuid.uuid4())
            runner.race_results = races
            flag_modified(runner, "race_results")
            await self.db.commit()
            await self.db.refresh(runner)

    async def get_runner_with_status(self, runner: Runner) -> dict:
        """Enrich runner with profile and pipeline status."""
        await self.backfill_race_ids(runner)

        profile_result = await self.db.execute(
            select(Profile).where(Profile.runner_id == runner.id, Profile.is_active == True).limit(1)
        )
        has_profile = profile_result.scalar_one_or_none() is not None

        run_result = await self.db.execute(
            select(PipelineRun)
            .where(PipelineRun.runner_id == runner.id)
            .order_by(PipelineRun.created_at.desc())
            .limit(1)
        )
        latest_run = run_result.scalar_one_or_none()

        return {
            **{c.name: getattr(runner, c.name) for c in runner.__table__.columns},
            "created_at": str(runner.created_at),
            "updated_at": str(runner.updated_at),
            "has_profile": has_profile,
            "latest_pipeline_status": latest_run.status if latest_run else None,
        }
