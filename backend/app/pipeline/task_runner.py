import asyncio
import logging
from typing import Dict, Set

from app.database import async_session
from app.pipeline.orchestrator import PipelineOrchestrator
from app.config import settings

logger = logging.getLogger(__name__)


class TaskRunner:
    """In-process async task runner for pipeline executions."""

    def __init__(self):
        self._semaphore = asyncio.Semaphore(settings.max_concurrent_pipelines)
        self._active_runners: Set[str] = set()
        self._tasks: Dict[str, asyncio.Task] = {}

    def is_running(self, runner_id: str) -> bool:
        return runner_id in self._active_runners

    async def submit(self, runner_id: str, run_id: str, from_stage: int = 1) -> bool:
        if self.is_running(runner_id):
            logger.warning(f"Pipeline already running for runner {runner_id}")
            return False

        task = asyncio.create_task(self._execute(runner_id, run_id, from_stage))
        self._tasks[run_id] = task
        return True

    async def _execute(self, runner_id: str, run_id: str, from_stage: int):
        async with self._semaphore:
            self._active_runners.add(runner_id)
            try:
                async with async_session() as db:
                    orchestrator = PipelineOrchestrator(db)
                    await orchestrator.run(runner_id, run_id, from_stage)
                    logger.info(f"Pipeline completed for runner {runner_id}, run {run_id}")
            except Exception as e:
                logger.exception(f"Pipeline failed for runner {runner_id}: {e}")
            finally:
                self._active_runners.discard(runner_id)
                self._tasks.pop(run_id, None)


# Singleton
task_runner = TaskRunner()
