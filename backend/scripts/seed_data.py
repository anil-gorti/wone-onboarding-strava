"""Seed the database with test runner fixtures."""
import asyncio
import json
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import engine, async_session
from app.models import Base, Runner
from app.services.runner_service import RunnerService, compute_raw_data_hash
from app.schemas.runner import RunnerCreate, RaceResult, ExternalData, SelfReported

FIXTURES_DIR = Path(__file__).parent.parent / "tests" / "fixtures"


async def seed():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    fixture_files = sorted(FIXTURES_DIR.glob("*.json"))
    if not fixture_files:
        print("No fixture files found")
        return

    async with async_session() as db:
        service = RunnerService(db)

        for fixture_path in fixture_files:
            data = json.loads(fixture_path.read_text())
            print(f"Seeding: {data['name']} ({fixture_path.stem})")

            runner_data = RunnerCreate(
                name=data["name"],
                email=data.get("email"),
                age=data.get("age"),
                gender=data.get("gender"),
                city=data.get("city"),
                club_name=data.get("club_name"),
                club_join_date=data.get("club_join_date"),
                self_reported_running_since=data.get("self_reported_running_since"),
                race_results=[RaceResult(**r) for r in data.get("race_results", [])],
                external_data=ExternalData(**data.get("external_data", {})),
                self_reported=SelfReported(**data.get("self_reported", {})),
            )

            runner = await service.create_runner(runner_data)
            print(f"  -> Created runner {runner.id}")

    print(f"\nSeeded {len(fixture_files)} runners successfully.")


if __name__ == "__main__":
    asyncio.run(seed())
