from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.pipeline_run import PipelineRun
from app.models.runner import Runner
from app.pipeline.task_runner import task_runner
from app.schemas.pipeline import PipelineRunListResponse, PipelineRunResponse, PipelineTriggerResponse

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.post("/run/{runner_id}", response_model=PipelineTriggerResponse)
async def trigger_pipeline(runner_id: str, from_stage: int = 1, db: AsyncSession = Depends(get_db)):
    # Verify runner exists
    result = await db.execute(select(Runner).where(Runner.id == runner_id))
    runner = result.scalar_one_or_none()
    if not runner:
        raise HTTPException(status_code=404, detail="Runner not found")

    if task_runner.is_running(runner_id):
        raise HTTPException(status_code=409, detail="Pipeline already running for this runner")

    # Create pipeline run record
    run = PipelineRun(runner_id=runner_id, status="pending")
    db.add(run)
    await db.commit()
    await db.refresh(run)

    # Submit to background task runner
    await task_runner.submit(runner_id, run.id, from_stage)

    return PipelineTriggerResponse(run_id=run.id, runner_id=runner_id, status="pending")


@router.get("/runs", response_model=PipelineRunListResponse)
async def list_pipeline_runs(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    count_result = await db.execute(select(func.count(PipelineRun.id)))
    total = count_result.scalar()

    result = await db.execute(
        select(PipelineRun, Runner.name)
        .join(Runner, PipelineRun.runner_id == Runner.id)
        .order_by(PipelineRun.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    rows = result.all()

    runs = []
    for run, runner_name in rows:
        runs.append(
            PipelineRunResponse(
                id=run.id,
                runner_id=run.runner_id,
                runner_name=runner_name,
                status=run.status,
                agent_1_cached=run.agent_1_cached,
                agent_2_cached=run.agent_2_cached,
                error_stage=run.error_stage,
                error_message=run.error_message,
                agent_1_latency_ms=run.agent_1_latency_ms,
                agent_2_latency_ms=run.agent_2_latency_ms,
                agent_3_latency_ms=run.agent_3_latency_ms,
                total_latency_ms=run.total_latency_ms,
                started_at=str(run.started_at) if run.started_at else None,
                completed_at=str(run.completed_at) if run.completed_at else None,
                created_at=str(run.created_at),
            )
        )

    return PipelineRunListResponse(runs=runs, total=total)


@router.get("/runs/{run_id}", response_model=PipelineRunResponse)
async def get_pipeline_run(run_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PipelineRun, Runner.name)
        .join(Runner, PipelineRun.runner_id == Runner.id)
        .where(PipelineRun.id == run_id)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Pipeline run not found")

    run, runner_name = row
    return PipelineRunResponse(
        id=run.id,
        runner_id=run.runner_id,
        runner_name=runner_name,
        status=run.status,
        agent_1_cached=run.agent_1_cached,
        agent_2_cached=run.agent_2_cached,
        error_stage=run.error_stage,
        error_message=run.error_message,
        agent_1_latency_ms=run.agent_1_latency_ms,
        agent_2_latency_ms=run.agent_2_latency_ms,
        agent_3_latency_ms=run.agent_3_latency_ms,
        total_latency_ms=run.total_latency_ms,
        started_at=str(run.started_at) if run.started_at else None,
        completed_at=str(run.completed_at) if run.completed_at else None,
        created_at=str(run.created_at),
    )
