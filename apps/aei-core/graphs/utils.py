"""
Utility functions for LangGraph workflows.

Provides model provisioning, token counting, and other helpers.
"""

import asyncio
from typing import Any, Dict, Literal, Optional
from functools import lru_cache
import logging

from langchain_core.language_models.chat_models import BaseChatModel

logger = logging.getLogger(__name__)

# Model type mapping
ModelType = Literal["chat", "embedding", "transformation", "large_context", "tts", "stt"]


async def get_model_config(model_id: str) -> Dict[str, Any]:
    """
    Get model configuration from database by model_id.
    
    Args:
        model_id: The model identifier (e.g., "gpt-4o", "claude-3-opus")
        
    Returns:
        Dict with provider, model_id, capabilities, etc.
    """
    # TODO: Integrate with ModelManager from @sbf/ai-client
    # For now, return a mapping of known models
    model_configs = {
        # OpenAI
        "gpt-4o": {"provider": "openai", "model_id": "gpt-4o", "context_window": 128000},
        "gpt-4o-mini": {"provider": "openai", "model_id": "gpt-4o-mini", "context_window": 128000},
        "gpt-4-turbo": {"provider": "openai", "model_id": "gpt-4-turbo", "context_window": 128000},
        "gpt-3.5-turbo": {"provider": "openai", "model_id": "gpt-3.5-turbo", "context_window": 16385},
        # Anthropic
        "claude-3-5-sonnet-20241022": {"provider": "anthropic", "model_id": "claude-3-5-sonnet-20241022", "context_window": 200000},
        "claude-3-opus-20240229": {"provider": "anthropic", "model_id": "claude-3-opus-20240229", "context_window": 200000},
        "claude-3-sonnet-20240229": {"provider": "anthropic", "model_id": "claude-3-sonnet-20240229", "context_window": 200000},
        "claude-3-haiku-20240307": {"provider": "anthropic", "model_id": "claude-3-haiku-20240307", "context_window": 200000},
        # Google
        "gemini-1.5-pro": {"provider": "google", "model_id": "gemini-1.5-pro", "context_window": 1000000},
        "gemini-1.5-flash": {"provider": "google", "model_id": "gemini-1.5-flash", "context_window": 1000000},
        "gemini-2.0-flash-exp": {"provider": "google", "model_id": "gemini-2.0-flash-exp", "context_window": 1000000},
        # Groq (fast inference)
        "llama-3.1-70b-versatile": {"provider": "groq", "model_id": "llama-3.1-70b-versatile", "context_window": 131072},
        "llama-3.1-8b-instant": {"provider": "groq", "model_id": "llama-3.1-8b-instant", "context_window": 131072},
        "mixtral-8x7b-32768": {"provider": "groq", "model_id": "mixtral-8x7b-32768", "context_window": 32768},
        # Ollama (local)
        "llama3.2": {"provider": "ollama", "model_id": "llama3.2", "context_window": 128000, "is_local": True},
        "mistral": {"provider": "ollama", "model_id": "mistral", "context_window": 32000, "is_local": True},
        "phi3": {"provider": "ollama", "model_id": "phi3", "context_window": 128000, "is_local": True},
        "qwen2.5": {"provider": "ollama", "model_id": "qwen2.5", "context_window": 128000, "is_local": True},
    }
    
    if model_id not in model_configs:
        raise ValueError(f"Unknown model: {model_id}")
    
    return model_configs[model_id]


async def get_default_model_config(task_type: ModelType) -> Dict[str, Any]:
    """
    Get the default model configuration for a given task type.
    
    Args:
        task_type: The type of task (chat, embedding, transformation, etc)
        
    Returns:
        Dict with provider, model_id, capabilities, etc.
    """
    # Default models per task type
    # TODO: Make this configurable via environment or database
    defaults = {
        "chat": "gpt-4o-mini",
        "embedding": "text-embedding-3-small",
        "transformation": "gpt-4o-mini", 
        "large_context": "gemini-1.5-pro",
        "tts": "tts-1",
        "stt": "whisper-1",
    }
    
    model_id = defaults.get(task_type, "gpt-4o-mini")
    return await get_model_config(model_id)


def estimate_token_count(text: str) -> int:
    """
    Estimate token count for text using heuristic.
    
    Uses character and word-based estimation (roughly 4 chars per token).
    This is faster than actual tokenization and accurate enough for budgeting.
    
    Args:
        text: The text to estimate tokens for
        
    Returns:
        Estimated token count
    """
    if not text:
        return 0
    
    # Heuristic: ~4 characters per token on average
    char_estimate = len(text) / 4
    
    # Also consider word count (~1.3 tokens per word)
    word_estimate = len(text.split()) * 1.3
    
    # Take the average
    return int((char_estimate + word_estimate) / 2)


async def provision_langchain_model(
    content: str,
    model_id: Optional[str] = None,
    task_type: ModelType = "chat",
    max_tokens: int = 4096,
    streaming: bool = True,
    **kwargs
) -> BaseChatModel:
    """
    Provision a LangChain model based on model_id or default for task type.
    
    Automatically selects large context model if content exceeds thresholds.
    
    Args:
        content: The prompt content (used to estimate if large context needed)
        model_id: Specific model to use (optional)
        task_type: Type of task for default model selection
        max_tokens: Maximum tokens for response
        streaming: Whether to enable streaming
        **kwargs: Additional model parameters
        
    Returns:
        Configured LangChain chat model
    """
    tokens = estimate_token_count(content)
    
    # Auto-select large context model for huge inputs
    if tokens > 105_000 and model_id is None:
        logger.debug(f"Using large context model because content has {tokens} tokens")
        model_config = await get_default_model_config("large_context")
    elif model_id:
        model_config = await get_model_config(model_id)
    else:
        model_config = await get_default_model_config(task_type)
    
    provider = model_config["provider"]
    model_name = model_config["model_id"]
    
    logger.debug(f"Provisioning model: {provider}/{model_name} for {task_type}")
    
    if provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=model_name,
            max_tokens=max_tokens,
            streaming=streaming,
            **kwargs
        )
    elif provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=model_name,
            max_tokens=max_tokens,
            streaming=streaming,
            **kwargs
        )
    elif provider == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=model_name,
            max_tokens=max_tokens,
            **kwargs
        )
    elif provider == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(
            model=model_name,
            max_tokens=max_tokens,
            streaming=streaming,
            **kwargs
        )
    elif provider == "ollama":
        from langchain_ollama import ChatOllama
        # Get Ollama base URL from config
        from config import settings
        return ChatOllama(
            model=model_name,
            base_url=settings.ollama_base_url,
            num_predict=max_tokens,
            **kwargs
        )
    else:
        raise ValueError(f"Unsupported provider: {provider}")


def provision_langchain_model_sync(
    content: str,
    model_id: Optional[str] = None,
    task_type: ModelType = "chat",
    max_tokens: int = 4096,
    streaming: bool = True,
    **kwargs
) -> BaseChatModel:
    """
    Synchronous version of provision_langchain_model.
    
    Handles async-to-sync conversion for use in LangGraph nodes.
    """
    def run_in_new_loop():
        """Run the async function in a new event loop"""
        new_loop = asyncio.new_event_loop()
        try:
            asyncio.set_event_loop(new_loop)
            return new_loop.run_until_complete(
                provision_langchain_model(
                    content, model_id, task_type, max_tokens, streaming, **kwargs
                )
            )
        finally:
            new_loop.close()
            asyncio.set_event_loop(None)

    try:
        # Try to get the current event loop
        asyncio.get_running_loop()
        # If we're in an event loop, run in a thread with a new loop
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(run_in_new_loop)
            return future.result()
    except RuntimeError:
        # No event loop running, safe to use asyncio.run()
        return asyncio.run(
            provision_langchain_model(
                content, model_id, task_type, max_tokens, streaming, **kwargs
            )
        )


def is_local_model(model_id: str) -> bool:
    """
    Check if a model runs locally (for privacy-sensitive content).
    
    Args:
        model_id: The model identifier
        
    Returns:
        True if model runs locally (e.g., Ollama)
    """
    # TODO: Check from database model config
    local_providers = ["ollama"]
    try:
        config = asyncio.run(get_model_config(model_id))
        return config.get("is_local", False) or config.get("provider") in local_providers
    except ValueError:
        return False
