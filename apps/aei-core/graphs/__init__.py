"""
LangGraph workflow orchestration for AEI Core.

This module provides:
- Base state types for graph workflows
- Multi-tenant PostgreSQL checkpointing
- Model provisioning utilities
- Pre-built graphs for chat, RAG, and transformations
"""

from .base import (
    BaseGraphState,
    ChatState,
    RAGState,
    TransformationState,
    SourceIngestionState,
    GraphConfig,
)
from .checkpointer import PostgresCheckpointer, InMemoryCheckpointer
from .utils import (
    provision_langchain_model,
    provision_langchain_model_sync,
    get_model_config,
    get_default_model_config,
    estimate_token_count,
    is_local_model,
)
from .chat import (
    ChatSession,
    create_chat_graph,
    chat_once,
)

__all__ = [
    # State types
    "BaseGraphState",
    "ChatState",
    "RAGState",
    "TransformationState",
    "SourceIngestionState",
    "GraphConfig",
    # Checkpointing
    "PostgresCheckpointer",
    "InMemoryCheckpointer",
    # Utilities
    "provision_langchain_model",
    "provision_langchain_model_sync",
    "get_model_config",
    "get_default_model_config",
    "estimate_token_count",
    "is_local_model",
    # Chat
    "ChatSession",
    "create_chat_graph",
    "chat_once",
]
