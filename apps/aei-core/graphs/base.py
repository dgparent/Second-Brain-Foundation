"""
Base state types for LangGraph workflows.

These TypedDicts define the state shape for all graph workflows in SBF.
All states include tenant_id for multi-tenancy support.
"""

from typing import Annotated, Any, Dict, List, Optional, TypedDict
from typing_extensions import NotRequired
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage


class GraphConfig(TypedDict, total=False):
    """
    Configuration passed to graph invocations.
    
    Attributes:
        thread_id: Unique identifier for the conversation thread
        checkpoint_id: Specific checkpoint to resume from
        model_id: Override the default model for this invocation
        tenant_id: Tenant identifier for multi-tenancy
        user_id: User identifier for audit/permissions
    """
    thread_id: str
    checkpoint_id: NotRequired[str]
    model_id: NotRequired[str]
    tenant_id: str
    user_id: NotRequired[str]


class BaseGraphState(TypedDict, total=False):
    """
    Base state that all graph states extend.
    
    Provides:
        - tenant_id: Required for multi-tenant isolation
        - metadata: Optional dict for extensibility
        - error: Optional error message if graph fails
    """
    tenant_id: str
    metadata: NotRequired[Dict[str, Any]]
    error: NotRequired[str]


class ChatState(TypedDict):
    """
    State for chat conversations with memory.
    
    Attributes:
        messages: Conversation history with add_messages reducer
        notebook_id: Optional notebook for context scoping
        context: Pre-built context string from ContextBuilder
        context_config: Configuration for context building (sources, recency, etc)
        model_override: Override the default chat model
        tenant_id: Required for multi-tenant isolation
    """
    messages: Annotated[List[BaseMessage], add_messages]
    notebook_id: NotRequired[Optional[str]]
    context: NotRequired[Optional[str]]
    context_config: NotRequired[Optional[Dict[str, Any]]]
    model_override: NotRequired[Optional[str]]
    tenant_id: str


class RAGState(TypedDict):
    """
    State for RAG (Retrieval-Augmented Generation) workflows.
    
    Extends ChatState with retrieval-specific fields.
    
    Attributes:
        messages: Conversation history
        query: The current user query being processed
        retrieved_chunks: Chunks retrieved from vector/text search
        reranked_chunks: Chunks after reranking (if applicable)
        context: Final assembled context for the LLM
        sources: Source attribution for citations
        notebook_id: Optional notebook scope for retrieval
        search_filters: Filters for retrieval (date range, entity types)
        tenant_id: Required for multi-tenant isolation
    """
    messages: Annotated[List[BaseMessage], add_messages]
    query: str
    retrieved_chunks: NotRequired[List[Dict[str, Any]]]
    reranked_chunks: NotRequired[List[Dict[str, Any]]]
    context: NotRequired[Optional[str]]
    sources: NotRequired[List[Dict[str, str]]]
    notebook_id: NotRequired[Optional[str]]
    search_filters: NotRequired[Optional[Dict[str, Any]]]
    model_override: NotRequired[Optional[str]]
    tenant_id: str


class TransformationState(TypedDict):
    """
    State for content transformation workflows.
    
    Used for summarization, extraction, formatting, etc.
    
    Attributes:
        input_content: The source content to transform
        input_type: Type of input (text, markdown, html, etc)
        transformation_type: What transformation to apply
        output_content: The transformed result
        output_format: Desired output format
        options: Transformation-specific options
        tenant_id: Required for multi-tenant isolation
    """
    input_content: str
    input_type: NotRequired[str]
    transformation_type: str
    output_content: NotRequired[Optional[str]]
    output_format: NotRequired[str]
    options: NotRequired[Dict[str, Any]]
    model_override: NotRequired[Optional[str]]
    tenant_id: str


class SourceIngestionState(TypedDict):
    """
    State for source ingestion workflows.
    
    Handles extraction → chunking → embedding pipeline.
    
    Attributes:
        source_url: URL or path to the source
        source_type: Type of source (web, pdf, youtube, audio)
        raw_content: Extracted raw content
        chunks: Content split into chunks
        embeddings: Vector embeddings for chunks
        metadata: Extracted metadata (title, author, date)
        notebook_id: Notebook to add source to
        tenant_id: Required for multi-tenant isolation
    """
    source_url: str
    source_type: NotRequired[str]
    raw_content: NotRequired[Optional[str]]
    chunks: NotRequired[List[Dict[str, Any]]]
    embeddings: NotRequired[List[List[float]]]
    metadata: NotRequired[Dict[str, Any]]
    notebook_id: NotRequired[Optional[str]]
    sensitivity: NotRequired[str]  # public, personal, confidential, secret
    tenant_id: str
