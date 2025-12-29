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

from api import vault, queue, ask, audit, va
from api.docs import setup_docs
from api.routes.health import router as health_router
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
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None,  # Disable default docs, we use custom
    redoc_url=None,  # Disable default redoc, we use custom
)

# Set up custom OpenAPI documentation
setup_docs(app)

# CORS configuration - allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API routers
app.include_router(health_router, prefix="/api/v1", tags=["health"])
app.include_router(va.router, prefix="/api/v1", tags=["va-automation"])
# app.include_router(vault.router, prefix="/api/v1/vault", tags=["vault"])
# app.include_router(queue.router, prefix="/api/v1/queue", tags=["queue"])
# app.include_router(ask.router, prefix="/api/v1/ask", tags=["rag"])
# app.include_router(audit.router, prefix="/api/v1/audit", tags=["audit"])

# Phase 02: Chat & Search
from api.chat import router as chat_router
app.include_router(chat_router, prefix="/api/v1", tags=["chat"])


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "AEI Core",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "openapi": "/openapi.json",
        "health": "/api/v1/health",
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
