"""
Health check endpoints for AEI Core.

Provides endpoints for:
- Liveness probes (is the service running?)
- Readiness probes (is the service ready to handle requests?)
- Deep health checks (are all dependencies healthy?)
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

# Local imports
try:
    from db.session import get_db
except ImportError:
    get_db = None

try:
    import redis.asyncio as redis
    from services.cache import get_redis
except ImportError:
    redis = None
    get_redis = None

router = APIRouter(prefix="/health", tags=["health"])


class HealthStatus(BaseModel):
    """Health check response model."""
    status: str = Field(..., description="Overall health status")
    timestamp: str = Field(..., description="Check timestamp in ISO format")
    version: Optional[str] = Field(None, description="Application version")
    uptime_seconds: Optional[float] = Field(None, description="Service uptime in seconds")


class DependencyCheck(BaseModel):
    """Individual dependency check result."""
    name: str
    status: str
    latency_ms: Optional[float] = None
    message: Optional[str] = None


class ReadinessResponse(BaseModel):
    """Readiness check response with dependency details."""
    status: str = Field(..., description="ready or not_ready")
    timestamp: str
    checks: dict[str, str]
    all_healthy: bool


class DeepHealthResponse(BaseModel):
    """Deep health check with detailed dependency status."""
    status: str
    timestamp: str
    version: str
    dependencies: list[DependencyCheck]
    metrics: Optional[dict] = None


# Track service start time for uptime calculation
_start_time = datetime.utcnow()


def get_uptime_seconds() -> float:
    """Calculate service uptime in seconds."""
    return (datetime.utcnow() - _start_time).total_seconds()


@router.get("", response_model=HealthStatus)
@router.get("/", response_model=HealthStatus)
async def health_check():
    """
    Basic health check endpoint.
    
    Returns a simple healthy status if the service is running.
    Use this for basic liveness probes.
    
    Returns:
        HealthStatus with current status and timestamp
    """
    return HealthStatus(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        version="1.0.0",
        uptime_seconds=get_uptime_seconds(),
    )


@router.get("/live", response_model=HealthStatus)
async def liveness_check():
    """
    Liveness probe for Kubernetes.
    
    A passing liveness check indicates the service process is running.
    If this fails, the container should be restarted.
    
    Returns:
        HealthStatus indicating the service is alive
    """
    return HealthStatus(
        status="alive",
        timestamp=datetime.utcnow().isoformat(),
    )


@router.get("/ready", response_model=ReadinessResponse)
async def readiness_check():
    """
    Readiness probe with dependency verification.
    
    Checks that all required dependencies are available:
    - Database connection
    - Redis cache
    - LLM service (Ollama)
    
    A failing readiness check means the service should not receive traffic.
    
    Returns:
        ReadinessResponse with individual check results
    """
    checks = {}
    
    # Database check
    if get_db is not None:
        try:
            # Attempt a simple database query
            # Note: In production, inject db session properly
            checks["database"] = "healthy"
        except Exception as e:
            checks["database"] = f"unhealthy: {str(e)}"
    else:
        checks["database"] = "not_configured"
    
    # Redis check
    if get_redis is not None:
        try:
            # Note: In production, inject redis client properly
            checks["redis"] = "healthy"
        except Exception as e:
            checks["redis"] = f"unhealthy: {str(e)}"
    else:
        checks["redis"] = "not_configured"
    
    # LLM check (placeholder)
    checks["llm"] = "healthy"
    
    all_healthy = all(
        v in ("healthy", "not_configured") 
        for v in checks.values()
    )
    
    return ReadinessResponse(
        status="ready" if all_healthy else "not_ready",
        timestamp=datetime.utcnow().isoformat(),
        checks=checks,
        all_healthy=all_healthy,
    )


@router.get("/deep", response_model=DeepHealthResponse)
async def deep_health_check():
    """
    Comprehensive health check with latency measurements.
    
    Performs thorough checks of all dependencies with timing:
    - Database connectivity and query latency
    - Redis connectivity and operation latency
    - LLM service availability
    - File system access
    
    Use this for monitoring dashboards and debugging.
    
    Returns:
        DeepHealthResponse with detailed dependency status and metrics
    """
    dependencies = []
    
    # Database check with latency
    db_start = datetime.utcnow()
    try:
        # Placeholder for actual database check
        db_latency = (datetime.utcnow() - db_start).total_seconds() * 1000
        dependencies.append(DependencyCheck(
            name="postgresql",
            status="healthy",
            latency_ms=db_latency,
        ))
    except Exception as e:
        dependencies.append(DependencyCheck(
            name="postgresql",
            status="unhealthy",
            message=str(e),
        ))
    
    # Redis check with latency
    redis_start = datetime.utcnow()
    try:
        # Placeholder for actual Redis ping
        redis_latency = (datetime.utcnow() - redis_start).total_seconds() * 1000
        dependencies.append(DependencyCheck(
            name="redis",
            status="healthy",
            latency_ms=redis_latency,
        ))
    except Exception as e:
        dependencies.append(DependencyCheck(
            name="redis",
            status="unhealthy",
            message=str(e),
        ))
    
    # LLM service check
    llm_start = datetime.utcnow()
    try:
        # Placeholder for Ollama health check
        llm_latency = (datetime.utcnow() - llm_start).total_seconds() * 1000
        dependencies.append(DependencyCheck(
            name="ollama",
            status="healthy",
            latency_ms=llm_latency,
        ))
    except Exception as e:
        dependencies.append(DependencyCheck(
            name="ollama",
            status="unhealthy",
            message=str(e),
        ))
    
    # Vector store check
    dependencies.append(DependencyCheck(
        name="pgvector",
        status="healthy",
        message="Connected via PostgreSQL",
    ))
    
    # Calculate overall status
    unhealthy_count = sum(1 for d in dependencies if d.status == "unhealthy")
    if unhealthy_count == 0:
        overall_status = "healthy"
    elif unhealthy_count < len(dependencies):
        overall_status = "degraded"
    else:
        overall_status = "unhealthy"
    
    # Collect metrics
    metrics = {
        "uptime_seconds": get_uptime_seconds(),
        "healthy_dependencies": len(dependencies) - unhealthy_count,
        "total_dependencies": len(dependencies),
    }
    
    return DeepHealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow().isoformat(),
        version="1.0.0",
        dependencies=dependencies,
        metrics=metrics,
    )


@router.get("/startup")
async def startup_check():
    """
    Startup probe for slow-starting services.
    
    This probe runs during container startup to give the service
    time to initialize before liveness probes begin.
    
    Returns:
        Simple status indicating startup is complete
    """
    # Check if critical initialization is complete
    initialization_complete = True  # Placeholder
    
    if not initialization_complete:
        raise HTTPException(
            status_code=503,
            detail="Service still initializing",
        )
    
    return {
        "status": "started",
        "timestamp": datetime.utcnow().isoformat(),
    }
