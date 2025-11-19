"""
FastAPI application entry point for AEI Core.

Provides REST and WebSocket endpoints for:
- Vault management
- Entity extraction and organization
- RAG-based querying
- Human-in-the-loop approval queue
- Audit logging
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from api import vault, queue, ask, audit
from services.watcher import FileWatcher


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Starts file watcher on startup, stops on shutdown.
    """
    # Startup
    print("🚀 Starting AEI Core...")
    # TODO: Initialize database connection
    # TODO: Start file watcher
    # TODO: Load LLM models
    
    yield
    
    # Shutdown
    print("🛑 Shutting down AEI Core...")
    # TODO: Stop file watcher
    # TODO: Close database connections


app = FastAPI(
    title="AEI Core API",
    description="AI-Enabled Interface for Second Brain Foundation",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration - allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoints
@app.get("/healthz")
async def health_check():
    """Liveness probe - is the service running?"""
    return {"status": "healthy", "service": "aei-core"}


@app.get("/readyz")
async def readiness_check():
    """Readiness probe - is the service ready to handle requests?"""
    # TODO: Check database connection
    # TODO: Check Ollama availability
    # TODO: Check vault path exists
    return {
        "status": "ready",
        "checks": {
            "database": "connected",
            "llm": "available",
            "vault": "mounted",
        }
    }


# API routers (to be implemented)
# app.include_router(vault.router, prefix="/api/v1/vault", tags=["vault"])
# app.include_router(queue.router, prefix="/api/v1/queue", tags=["queue"])
# app.include_router(ask.router, prefix="/api/v1/ask", tags=["rag"])
# app.include_router(audit.router, prefix="/api/v1/audit", tags=["audit"])


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "AEI Core",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/healthz",
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
