"""
Chat workflow graph for AEI Core.

Implements a LangGraph-based chat system with:
- Conversation memory via checkpointing
- Context injection from notebooks
- Multi-tenant isolation
- Streaming support
"""

import logging
from typing import Any, Dict, Optional

from langchain_core.messages import AIMessage, SystemMessage, HumanMessage
from langchain_core.runnables import RunnableConfig
from langgraph.graph import END, START, StateGraph

from .base import ChatState
from .checkpointer import PostgresCheckpointer, InMemoryCheckpointer
from .utils import provision_langchain_model_sync
from prompts import render_prompt
from utils import clean_thinking_content

logger = logging.getLogger(__name__)


def call_model_with_messages(state: ChatState, config: RunnableConfig) -> Dict[str, Any]:
    """
    Main chat node that calls the LLM with context.
    
    This is the core processing node that:
    1. Renders the system prompt with context
    2. Provisions the appropriate model
    3. Invokes the model with the conversation
    4. Cleans thinking tags from the response
    
    Args:
        state: Current chat state with messages, context, etc.
        config: Runtime configuration with thread_id, model_id, etc.
        
    Returns:
        Dict with updated messages
    """
    # Render system prompt with context
    system_prompt = render_prompt(
        "chat",
        context=state.get("context"),
        notebook=state.get("notebook_id"),
        model_info=None,  # TODO: Add model info
    )
    
    # Build message payload
    messages = state.get("messages", [])
    payload = [SystemMessage(content=system_prompt)] + list(messages)
    
    # Get model (override or default)
    model_id = config.get("configurable", {}).get("model_id") or state.get("model_override")
    
    # Provision model based on content size and preferences
    model = provision_langchain_model_sync(
        str(payload),
        model_id,
        "chat",
        max_tokens=8192,
    )
    
    logger.debug(f"Chat invoking model with {len(payload)} messages")
    
    # Invoke model
    ai_message = model.invoke(payload)
    
    # Clean thinking content from AI response
    content = ai_message.content if isinstance(ai_message.content, str) else str(ai_message.content)
    cleaned_content = clean_thinking_content(content)
    
    # Create cleaned message
    cleaned_message = AIMessage(content=cleaned_content)
    
    return {"messages": [cleaned_message]}


def create_chat_graph(
    checkpointer: Optional[PostgresCheckpointer] = None,
    tenant_id: Optional[str] = None
) -> StateGraph:
    """
    Create and compile the chat graph with checkpointing.
    
    Args:
        checkpointer: Optional checkpointer for persistence
        tenant_id: Tenant ID for in-memory checkpointer if no checkpointer provided
        
    Returns:
        Compiled StateGraph ready for invocation
    """
    # Create the graph
    builder = StateGraph(ChatState)
    
    # Add nodes
    builder.add_node("agent", call_model_with_messages)
    
    # Add edges
    builder.add_edge(START, "agent")
    builder.add_edge("agent", END)
    
    # Use provided checkpointer or create in-memory one
    if checkpointer is None and tenant_id:
        checkpointer = InMemoryCheckpointer(tenant_id)
    
    # Compile with checkpointer
    return builder.compile(checkpointer=checkpointer)


class ChatSession:
    """
    High-level interface for chat sessions.
    
    Manages conversation state and provides methods for:
    - Sending messages
    - Streaming responses
    - Managing context
    
    Usage:
        session = ChatSession(tenant_id="abc", thread_id="xyz")
        response = await session.send("Hello!")
        
        async for chunk in session.stream("Tell me more"):
            print(chunk, end="")
    """
    
    def __init__(
        self,
        tenant_id: str,
        thread_id: str,
        checkpointer: Optional[PostgresCheckpointer] = None,
        notebook_id: Optional[str] = None,
        model_override: Optional[str] = None,
    ):
        """
        Initialize a chat session.
        
        Args:
            tenant_id: Tenant identifier for isolation
            thread_id: Unique thread/conversation identifier
            checkpointer: Optional persistent checkpointer
            notebook_id: Optional notebook for context scoping
            model_override: Optional model to use instead of default
        """
        self.tenant_id = tenant_id
        self.thread_id = thread_id
        self.notebook_id = notebook_id
        self.model_override = model_override
        
        # Create checkpointer if not provided
        if checkpointer:
            self.checkpointer = checkpointer
        else:
            self.checkpointer = InMemoryCheckpointer(tenant_id)
        
        # Create the graph
        self.graph = create_chat_graph(self.checkpointer, tenant_id)
    
    def _get_config(self, model_id: Optional[str] = None) -> Dict[str, Any]:
        """Get the config dict for graph invocation."""
        return {
            "configurable": {
                "thread_id": self.thread_id,
                "model_id": model_id or self.model_override,
            }
        }
    
    async def send(
        self,
        message: str,
        context: Optional[str] = None,
        model_id: Optional[str] = None,
    ) -> str:
        """
        Send a message and get a response.
        
        Args:
            message: User message text
            context: Optional context to include
            model_id: Optional model override for this message
            
        Returns:
            Assistant response text
        """
        state = {
            "messages": [HumanMessage(content=message)],
            "notebook_id": self.notebook_id,
            "context": context,
            "model_override": model_id or self.model_override,
            "tenant_id": self.tenant_id,
        }
        
        result = await self.graph.ainvoke(state, config=self._get_config(model_id))
        
        # Get the last AI message
        messages = result.get("messages", [])
        if messages:
            last_message = messages[-1]
            return last_message.content if hasattr(last_message, 'content') else str(last_message)
        
        return ""
    
    async def stream(
        self,
        message: str,
        context: Optional[str] = None,
        model_id: Optional[str] = None,
    ):
        """
        Send a message and stream the response.
        
        Args:
            message: User message text
            context: Optional context to include
            model_id: Optional model override
            
        Yields:
            Response chunks as they arrive
        """
        state = {
            "messages": [HumanMessage(content=message)],
            "notebook_id": self.notebook_id,
            "context": context,
            "model_override": model_id or self.model_override,
            "tenant_id": self.tenant_id,
        }
        
        async for event in self.graph.astream_events(
            state,
            config=self._get_config(model_id),
            version="v2"
        ):
            if event["event"] == "on_chat_model_stream":
                chunk = event.get("data", {}).get("chunk")
                if chunk and hasattr(chunk, "content") and chunk.content:
                    yield chunk.content
    
    async def get_history(self, limit: int = 50) -> list:
        """
        Get conversation history.
        
        Args:
            limit: Maximum number of messages to return
            
        Returns:
            List of message dicts
        """
        checkpoint = await self.checkpointer.aget(self._get_config())
        if not checkpoint:
            return []
        
        messages = checkpoint.checkpoint.get("channel_values", {}).get("messages", [])
        
        # Convert to dicts
        history = []
        for msg in messages[-limit:]:
            if hasattr(msg, 'type'):
                history.append({
                    "role": msg.type,
                    "content": msg.content if hasattr(msg, 'content') else str(msg),
                })
            else:
                history.append({"role": "unknown", "content": str(msg)})
        
        return history
    
    async def clear_history(self) -> None:
        """Clear conversation history for this thread."""
        await self.checkpointer.adelete(self._get_config())


# Convenience function for one-off chat
async def chat_once(
    message: str,
    tenant_id: str,
    context: Optional[str] = None,
    model_id: Optional[str] = None,
) -> str:
    """
    Send a single message without session persistence.
    
    Args:
        message: User message
        tenant_id: Tenant identifier
        context: Optional context
        model_id: Optional model override
        
    Returns:
        Assistant response
    """
    session = ChatSession(
        tenant_id=tenant_id,
        thread_id=f"oneoff-{id(message)}",
    )
    return await session.send(message, context=context, model_id=model_id)
