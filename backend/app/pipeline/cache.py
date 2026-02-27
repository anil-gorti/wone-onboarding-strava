import hashlib
import json
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.classification import Classification
from app.models.evidence_brief import EvidenceBrief


def compute_hash(data: dict) -> str:
    serialized = json.dumps(data, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode()).hexdigest()


class PipelineCache:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_valid_brief(self, runner_id: str, raw_data_hash: str) -> Optional[EvidenceBrief]:
        result = await self.db.execute(
            select(EvidenceBrief)
            .where(
                EvidenceBrief.runner_id == runner_id,
                EvidenceBrief.source_data_hash == raw_data_hash,
            )
            .order_by(EvidenceBrief.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_valid_classification(self, runner_id: str, brief_hash: str) -> Optional[Classification]:
        result = await self.db.execute(
            select(Classification)
            .where(
                Classification.runner_id == runner_id,
                Classification.brief_hash == brief_hash,
            )
            .order_by(Classification.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
