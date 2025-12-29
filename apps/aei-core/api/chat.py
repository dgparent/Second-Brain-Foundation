"""
Chat API endpoints for AEI Core.

Provides REST endpoints for:
- Creating chat sessions
- Sending messages (sync and streaming)
- Managing conversation history
"""

import json
import logging
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from graphs.chat import ChatSession, chat_once
from graphs.checkpointer import InMemoryCheckpointer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


# Request/Response Models
class CreateSessionRequest(BaseModel):
    """Request to create a new chat session."""
    notebook_id: Optional[str] = Field(None, description="Notebook to scope context to")
    model_override: Optional[str] = Field(None, description="Model to use for this session")


class CreateSessionResponse(BaseModel):
    """Response with new session details."""
    session_id: str
    notebook_id: Optional[str]
    model_override: Optional[str]


class ChatMessageRequest(BaseModel):
    """Request to send a chat message."""
    message: str = Field(..., min_length=1, max_length=100000)
    context: Optional[str] = Field(None, description="Optional context to include")
    model_override: Optional[str] = Field(None, description="Override model for this message")
    context_config: Optional[dict] = Field(None, description="Context building configuration")


class ChatMessageResponse(BaseModel):
    """Response with assistant message."""
    message: str
    session_id: str
    message_id: Optional[str] = None


class ChatHistoryItem(BaseModel):
    """Single message in chat history."""
    role: str
    content: str


class ChatHistoryResponse(BaseModel):
    """Response with chat history."""
    session_id: str
    messages: list[ChatHistoryItem]
    total_count: int


# In-memory session storage (for development)
# TODO: Replace with proper session management via database
_sessions: dict[str, ChatSession] = {}


def get_tenant_id() -> str:
    """
    Get tenant ID from request context.
    
    TODO: Implement proper tenant extraction from auth token.
    """
    # For development, use a default tenant
    return "00000000-0000-0000-0000-000000000001"


def get_session(session_id: str, tenant_id: str = Depends(get_tenant_id)) -> ChatSession:
    """
    Get or create a chat session.
    
    Args:
        session_id: The session identifier
        tenant_id: The tenant identifier
        
    Returns:
        ChatSession instance
        
    Raises:
        HTTPException: If session not found
    """
    session_key = f"{tenant_id}:{session_id}"
    
    if session_key not in _sessions:
        raise HTTPException(status_code=404, detail=f"Session not found: {session_id}")
    
    return _sessions[session_key]


@router.post("/sessions", response_model=CreateSessionResponse)
async def create_session(
    request: CreateSessionRequest,
    tenant_id: str = Depends(get_tenant_id),
):
    """
    Create a new chat session.
    
    A session maintains conversation history and can be scoped to a notebook.
    """
    session_id = str(uuid.uuid4())
    session_key = f"{tenant_id}:{session_id}"
    
    # Create checkpointer for this tenant
    checkpointer = InMemoryCheckpointer(tenant_id)
    
    # Create session
    session = ChatSession(
        tenant_id=tenant_id,
        thread_id=session_id,
        checkpointer=checkpointer,
        notebook_id=request.notebook_id,
        model_override=request.model_override,
    )
    
    _sessions[session_key] = session
    
    logger.info(f"Created chat session: {session_id} for tenant: {tenant_id}")
    
    return CreateSessionResponse(
        session_id=session_id,
        notebook_id=request.notebook_id,
        model_override=request.model_override,
    )


@router.post("/{session_id}/message", response_model=ChatMessageResponse)
async def send_message(
    session_id: str,
    request: ChatMessageRequest,
    tenant_id: str = Depends(get_tenant_id),
):
    """
    Send a message and get a response (non-streaming).
    
    The response includes the full assistant message.
    """
    session_key = f"{tenant_id}:{session_id}"
    
    # Get or create session
    if session_key not in _sessions:
        # Auto-create session if it doesn't exist
        checkpointer = InMemoryCheckpointer(tenant_id)
        session = ChatSession(
            tenant_id=tenant_id,
            thread_id=session_id,
            checkpointer=checkpointer,
        )
        _sessions[session_key] = session
    else:
        session = _sessions[session_key]
    
    try:
        response = await session.send(
            message=request.message,
            context=request.context,
            model_id=request.model_override,
        )
        
        return ChatMessageResponse(
            message=response,
            session_id=session_id,
        )
    except Exception as e:
        logger.error(f"Chat error in session {session_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{session_id}/stream")
async def stream_message(
    session_id: str,
    request: ChatMessageRequest,
    tenant_id: str = Depends(get_tenant_id),
):
    """
    Send a message and stream the response via Server-Sent Events.
    
    Events:
        - token: A chunk of the response
        - done: Stream complete with finish reason
        - error: An error occurred
    """
    session_key = f"{tenant_id}:{session_id}"
    
    # Get or create session
    if session_key not in _sessions:
        checkpointer = InMemoryCheckpointer(tenant_id)
        session = ChatSession(
            tenant_id=tenant_id,
            thread_id=session_id,
            checkpointer=checkpointer,
        )
        _sessions[session_key] = session
    else:
        session = _sessions[session_key]
    
    async def event_generator():
        try:
            async for chunk in session.stream(
                message=request.message,
                context=request.context,
                model_id=request.model_override,
            ):
                yield {
                    "event": "token",
                    "data": json.dumps({"content": chunk}),
                }
            
            yield {
                "event": "done",
                "data": json.dumps({"finish_reason": "stop"}),
            }
        except Exception as e:
            logger.error(f"Stream error in session {session_id}: {e}")
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)}),
            }
    
    return EventSourceResponse(event_generator())


@router.get("/{session_id}/history", response_model=ChatHistoryResponse)
async def get_history(
    session_id: str,
    limit: int = Query(50, ge=1, le=500),
    tenant_id: str = Depends(get_tenant_id),
):
    """
    Get conversation history for a session.
    
    Returns the most recent messages up to the limit.
    """
    session_key = f"{tenant_id}:{session_id}"
    
    if session_key not in _sessions:
        raise HTTPException(status_code=404, detail=f"Session not found: {session_id}")
    
    session = _sessions[session_key]
    
    try:
        history = await session.get_history(limit=limit)
        
        return ChatHistoryResponse(
            session_id=session_id,
            messages=[ChatHistoryItem(**msg) for msg in history],
            total_count=len(history),
        )
    except Exception as e:
        logger.error(f"Error getting history for session {session_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{session_id}/history")
async def clear_history(
    session_id: str,
    tenant_id: str = Depends(get_tenant_id),
):
    """
    Clear conversation history for a session.
    
    The session remains active but starts fresh.
    """
    session_key = f"{tenant_id}:{session_id}"
    
    if session_key not in _sessions:
        raise HTTPException(status_code=404, detail=f"Session not found: {session_id}")
    
    session = _sessions[session_key]
    
    try:
        await session.clear_history()
        return {"status": "cleared", "session_id": session_id}
    except Exception as e:
        logger.error(f"Error clearing history for session {session_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{session_id}")
async def delete_session(
    session_id: str,
    tenant_id: str = Depends(get_tenant_id),
):
    """
    Delete a chat session entirely.
    
    Removes all history and session state.
    """
    session_key = f"{tenant_id}:{session_id}"
    
    if session_key not in _sessions:
        raise HTTPException(status_code=404, detail=f"Session not found: {session_id}")
    
    # Clear history first
    session = _sessions[session_key]
    await session.clear_history()
    
    # Remove from sessions
    del _sessions[session_key]
    
    logger.info(f"Deleted chat session: {session_id}")
    
    return {"status": "deleted", "session_id": session_id}


@router.post("/quick", response_model=ChatMessageResponse)
async def quick_chat(
    request: ChatMessageRequest,
    tenant_id: str = Depends(get_tenant_id),
):
    """
    Send a one-off message without creating a session.
    
    Useful for simple queries that don't need conversation history.
    """
    try:
        response = await chat_once(
            message=request.message,
            tenant_id=tenant_id,
            context=request.context,
            model_id=request.model_override,
        )
        
        return ChatMessageResponse(
            message=response,
            session_id="oneoff",
        )
    except Exception as e:
        logger.error(f"Quick chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
