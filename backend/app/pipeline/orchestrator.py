import logging
from datetime import datetime
from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.client import get_anthropic_client
from app.agents.detective import DetectiveAgent
from app.agents.pattern_reader import PatternReaderAgent
from app.agents.storyteller import StorytellerAgent
from app.agents.base import AgentError
from app.models.classification import Classification
from app.models.evidence_brief import EvidenceBrief
from app.models.pipeline_run import PipelineRun
from app.models.profile import Profile
from app.models.runner import Runner
from app.pipeline.cache import PipelineCache, compute_hash

logger = logging.getLogger(__name__)


class PipelineOrchestrator:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.cache = PipelineCache(db)
        client = get_anthropic_client()
        self.detective = DetectiveAgent(client)
        self.pattern_reader = PatternReaderAgent(client)
        self.storyteller = StorytellerAgent(client)

    async def run(self, runner_id: str, run_id: str, from_stage: int = 1) -> None:
        run = await self._get_run(run_id)
        runner = await self._get_runner(runner_id)
        if not runner or not run:
            return

        run.started_at = datetime.utcnow()
        run.status = "running_agent_1"
        await self.db.commit()

        try:
            # Stage 1: Detective
            brief_model = None
            if from_stage <= 1:
                brief_model = await self._run_agent_1(runner, run)
            else:
                # Load existing brief
                brief_model = await self._get_latest_brief(runner_id)
                if not brief_model:
                    raise AgentError("No existing evidence brief found to resume from")

            # Stage 2: Pattern Reader
            classification_model = None
            if from_stage <= 2:
                classification_model = await self._run_agent_2(runner, run, brief_model)
            else:
                classification_model = await self._get_latest_classification(runner_id)
                if not classification_model:
                    raise AgentError("No existing classification found to resume from")

            # Stage 3: Storyteller
            await self._run_agent_3(runner, run, brief_model, classification_model)

            # Complete
            run.status = "completed"
            run.completed_at = datetime.utcnow()
            if run.started_at:
                run.total_latency_ms = int((run.completed_at - run.started_at).total_seconds() * 1000)
            await self.db.commit()

        except Exception as e:
            logger.exception(f"Pipeline failed for runner {runner_id}")
            run.status = "failed"
            run.error_message = str(e)[:2000]
            run.completed_at = datetime.utcnow()
            await self.db.commit()
            raise

    async def _run_agent_1(self, runner: Runner, run: PipelineRun) -> EvidenceBrief:
        run.status = "running_agent_1"
        await self.db.commit()

        # Check cache
        cached = await self.cache.get_valid_brief(runner.id, runner.raw_data_hash)
        if cached:
            run.agent_1_cached = True
            run.evidence_brief_id = cached.id
            run.agent_1_latency_ms = 0
            await self.db.commit()
            logger.info(f"Agent 1 cache hit for runner {runner.id}")
            return cached

        # Build input from runner data
        input_data = {
            "runner_id": runner.id,
            "basic_info": {
                "name": runner.name,
                "age": runner.age,
                "gender": runner.gender,
                "city": runner.city,
                "club_name": runner.club_name,
                "club_join_date": runner.club_join_date,
                "self_reported_running_since": runner.self_reported_running_since,
            },
            "race_results": runner.race_results or [],
            "external_data": runner.external_data or {},
            "self_reported": runner.self_reported or {},
        }

        result = await self.detective.run(input_data)

        brief = EvidenceBrief(
            runner_id=runner.id,
            source_data_hash=runner.raw_data_hash,
            brief=result.data,
            model_used=result.model_used,
            token_usage={"input_tokens": result.input_tokens, "output_tokens": result.output_tokens},
            latency_ms=result.latency_ms,
        )
        self.db.add(brief)
        await self.db.flush()

        run.evidence_brief_id = brief.id
        run.agent_1_latency_ms = result.latency_ms
        await self.db.commit()
        return brief

    async def _run_agent_2(self, runner: Runner, run: PipelineRun, brief: EvidenceBrief) -> Classification:
        run.status = "running_agent_2"
        await self.db.commit()

        brief_hash = compute_hash(brief.brief)

        # Check cache
        cached = await self.cache.get_valid_classification(runner.id, brief_hash)
        if cached:
            run.agent_2_cached = True
            run.classification_id = cached.id
            run.agent_2_latency_ms = 0
            await self.db.commit()
            logger.info(f"Agent 2 cache hit for runner {runner.id}")
            return cached

        result = await self.pattern_reader.run(brief.brief)

        classification = Classification(
            runner_id=runner.id,
            evidence_brief_id=brief.id,
            brief_hash=brief_hash,
            primary_archetype=result.data.get("classification", {}).get("primary_archetype", "UNCLASSIFIED"),
            confidence=self._parse_confidence(
                result.data.get("classification", {}).get("primary_confidence", "LOW")
            ),
            classification=result.data,
            model_used=result.model_used,
            token_usage={"input_tokens": result.input_tokens, "output_tokens": result.output_tokens},
            latency_ms=result.latency_ms,
        )
        self.db.add(classification)
        await self.db.flush()

        run.classification_id = classification.id
        run.agent_2_latency_ms = result.latency_ms
        await self.db.commit()
        return classification

    async def _run_agent_3(
        self, runner: Runner, run: PipelineRun, brief: EvidenceBrief, classification: Classification
    ) -> Profile:
        run.status = "running_agent_3"
        await self.db.commit()

        input_data = {
            "evidence_brief": brief.brief,
            "classification": classification.classification,
        }

        result = await self.storyteller.run(input_data)

        # Deactivate previous profiles
        await self.db.execute(
            update(Profile)
            .where(Profile.runner_id == runner.id, Profile.is_active == True)
            .values(is_active=False)
        )

        # Get next version number
        latest = await self.db.execute(
            select(Profile)
            .where(Profile.runner_id == runner.id)
            .order_by(Profile.version.desc())
            .limit(1)
        )
        latest_profile = latest.scalar_one_or_none()
        next_version = (latest_profile.version + 1) if latest_profile else 1

        profile = Profile(
            runner_id=runner.id,
            classification_id=classification.id,
            profile_content=result.data,
            version=next_version,
            is_active=True,
            model_used=result.model_used,
            token_usage={"input_tokens": result.input_tokens, "output_tokens": result.output_tokens},
            latency_ms=result.latency_ms,
        )
        self.db.add(profile)
        await self.db.flush()

        run.profile_id = profile.id
        run.agent_3_latency_ms = result.latency_ms
        await self.db.commit()
        return profile

    async def _get_run(self, run_id: str) -> Optional[PipelineRun]:
        result = await self.db.execute(select(PipelineRun).where(PipelineRun.id == run_id))
        return result.scalar_one_or_none()

    async def _get_runner(self, runner_id: str) -> Optional[Runner]:
        result = await self.db.execute(select(Runner).where(Runner.id == runner_id))
        return result.scalar_one_or_none()

    async def _get_latest_brief(self, runner_id: str) -> Optional[EvidenceBrief]:
        result = await self.db.execute(
            select(EvidenceBrief)
            .where(EvidenceBrief.runner_id == runner_id)
            .order_by(EvidenceBrief.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def _get_latest_classification(self, runner_id: str) -> Optional[Classification]:
        result = await self.db.execute(
            select(Classification)
            .where(Classification.runner_id == runner_id)
            .order_by(Classification.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    @staticmethod
    def _parse_confidence(confidence_str: str) -> float:
        mapping = {"HIGH": 0.9, "MEDIUM": 0.6, "LOW": 0.3}
        return mapping.get(confidence_str.upper(), 0.3)
