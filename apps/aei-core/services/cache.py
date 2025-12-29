"""
Redis caching service for AEI Core.

Provides a unified caching layer with:
- Key-value caching with TTL
- Cache invalidation patterns
- Serialization/deserialization
- Connection pooling
"""

import json
import hashlib
import logging
from typing import Any, Optional, TypeVar, Callable, Union
from functools import wraps
from datetime import timedelta

try:
    import redis.asyncio as redis
    from redis.asyncio.connection import ConnectionPool
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    redis = None
    ConnectionPool = None

from config import settings

logger = logging.getLogger(__name__)

T = TypeVar('T')


class CacheConfig:
    """Cache configuration settings."""
    
    # Default TTLs by cache type
    TTL_SHORT = 60  # 1 minute
    TTL_MEDIUM = 300  # 5 minutes
    TTL_LONG = 3600  # 1 hour
    TTL_EXTENDED = 86400  # 24 hours
    
    # Cache key prefixes
    PREFIX_CHAT = "chat"
    PREFIX_SEARCH = "search"
    PREFIX_NOTEBOOK = "notebook"
    PREFIX_SOURCE = "source"
    PREFIX_EMBEDDING = "embedding"
    PREFIX_USER = "user"
    PREFIX_RATE_LIMIT = "rate"
    
    # Version prefix for cache invalidation
    VERSION = "v1"


class CacheKeyBuilder:
    """Helper class for building consistent cache keys."""
    
    @staticmethod
    def build(prefix: str, *parts: str) -> str:
        """
        Build a cache key from prefix and parts.
        
        Args:
            prefix: Cache key prefix (e.g., "chat", "search")
            *parts: Additional key parts
            
        Returns:
            Formatted cache key
        """
        key_parts = [CacheConfig.VERSION, prefix] + [str(p) for p in parts]
        return ":".join(key_parts)
    
    @staticmethod
    def hash_query(query: str) -> str:
        """
        Create a hash of a query string for cache keys.
        
        Args:
            query: Query string to hash
            
        Returns:
            MD5 hash of the query
        """
        return hashlib.md5(query.encode()).hexdigest()


class CacheService:
    """
    Redis-based caching service.
    
    Provides async caching operations with automatic serialization
    and configurable TTLs.
    """
    
    _instance: Optional['CacheService'] = None
    _pool: Optional['ConnectionPool'] = None
    
    def __init__(self, redis_url: Optional[str] = None):
        """
        Initialize the cache service.
        
        Args:
            redis_url: Redis connection URL (defaults to config)
        """
        if not REDIS_AVAILABLE:
            logger.warning("Redis not available - caching disabled")
            self._client = None
            return
            
        self._redis_url = redis_url or getattr(settings, 'redis_url', 'redis://localhost:6379/0')
        self._client: Optional[redis.Redis] = None
    
    @classmethod
    async def get_instance(cls) -> 'CacheService':
        """Get or create singleton instance."""
        if cls._instance is None:
            cls._instance = CacheService()
            await cls._instance.connect()
        return cls._instance
    
    async def connect(self) -> None:
        """Establish Redis connection."""
        if not REDIS_AVAILABLE:
            return
            
        try:
            if self._pool is None:
                self._pool = ConnectionPool.from_url(
                    self._redis_url,
                    max_connections=20,
                    decode_responses=True,
                )
            self._client = redis.Redis(connection_pool=self._pool)
            await self._client.ping()
            logger.info("Redis cache connected")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self._client = None
    
    async def disconnect(self) -> None:
        """Close Redis connection."""
        if self._client:
            await self._client.close()
            self._client = None
            logger.info("Redis cache disconnected")
    
    async def get(self, key: str) -> Optional[Any]:
        """
        Get a value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        if not self._client:
            return None
            
        try:
            value = await self._client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Cache get error for {key}: {e}")
            return None
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: int = CacheConfig.TTL_MEDIUM,
    ) -> bool:
        """
        Set a value in cache.
        
        Args:
            key: Cache key
            value: Value to cache (must be JSON serializable)
            ttl: Time-to-live in seconds
            
        Returns:
            True if successful, False otherwise
        """
        if not self._client:
            return False
            
        try:
            serialized = json.dumps(value, default=str)
            await self._client.setex(key, ttl, serialized)
            return True
        except Exception as e:
            logger.error(f"Cache set error for {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """
        Delete a key from cache.
        
        Args:
            key: Cache key to delete
            
        Returns:
            True if key was deleted
        """
        if not self._client:
            return False
            
        try:
            result = await self._client.delete(key)
            return result > 0
        except Exception as e:
            logger.error(f"Cache delete error for {key}: {e}")
            return False
    
    async def delete_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching a pattern.
        
        Args:
            pattern: Key pattern with wildcards (e.g., "v1:chat:*")
            
        Returns:
            Number of keys deleted
        """
        if not self._client:
            return 0
            
        try:
            keys = []
            async for key in self._client.scan_iter(match=pattern):
                keys.append(key)
            
            if keys:
                return await self._client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache delete pattern error for {pattern}: {e}")
            return 0
    
    async def exists(self, key: str) -> bool:
        """Check if a key exists in cache."""
        if not self._client:
            return False
            
        try:
            return await self._client.exists(key) > 0
        except Exception as e:
            logger.error(f"Cache exists error for {key}: {e}")
            return False
    
    async def get_or_set(
        self,
        key: str,
        factory: Callable[[], T],
        ttl: int = CacheConfig.TTL_MEDIUM,
    ) -> T:
        """
        Get from cache or compute and cache the value.
        
        Args:
            key: Cache key
            factory: Function to compute value if not cached
            ttl: Time-to-live in seconds
            
        Returns:
            Cached or computed value
        """
        cached = await self.get(key)
        if cached is not None:
            return cached
        
        # Compute value
        if asyncio.iscoroutinefunction(factory):
            value = await factory()
        else:
            value = factory()
        
        # Cache it
        await self.set(key, value, ttl)
        return value
    
    async def increment(self, key: str, amount: int = 1) -> int:
        """
        Increment a counter in cache.
        
        Args:
            key: Cache key
            amount: Amount to increment by
            
        Returns:
            New value after increment
        """
        if not self._client:
            return 0
            
        try:
            return await self._client.incrby(key, amount)
        except Exception as e:
            logger.error(f"Cache increment error for {key}: {e}")
            return 0
    
    async def expire(self, key: str, ttl: int) -> bool:
        """
        Set expiration on an existing key.
        
        Args:
            key: Cache key
            ttl: Time-to-live in seconds
            
        Returns:
            True if expiration was set
        """
        if not self._client:
            return False
            
        try:
            return await self._client.expire(key, ttl)
        except Exception as e:
            logger.error(f"Cache expire error for {key}: {e}")
            return False


# Import asyncio for coroutine check
import asyncio


def cached(
    prefix: str,
    ttl: int = CacheConfig.TTL_MEDIUM,
    key_builder: Optional[Callable[..., str]] = None,
):
    """
    Decorator for caching function results.
    
    Args:
        prefix: Cache key prefix
        ttl: Time-to-live in seconds
        key_builder: Optional custom key builder function
        
    Returns:
        Decorated function with caching
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> T:
            # Build cache key
            if key_builder:
                key = key_builder(*args, **kwargs)
            else:
                # Default key builder using function name and arguments
                key_parts = [func.__name__]
                key_parts.extend(str(a) for a in args[1:])  # Skip self
                key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
                key = CacheKeyBuilder.build(prefix, *key_parts)
            
            # Try to get from cache
            cache = await CacheService.get_instance()
            cached_value = await cache.get(key)
            
            if cached_value is not None:
                logger.debug(f"Cache hit: {key}")
                return cached_value
            
            logger.debug(f"Cache miss: {key}")
            
            # Compute value
            result = await func(*args, **kwargs)
            
            # Cache result
            await cache.set(key, result, ttl)
            
            return result
        
        return wrapper
    return decorator


# Cache invalidation helpers
class CacheInvalidator:
    """Helper class for cache invalidation patterns."""
    
    @staticmethod
    async def invalidate_notebook(notebook_id: str) -> None:
        """Invalidate all cache entries for a notebook."""
        cache = await CacheService.get_instance()
        pattern = CacheKeyBuilder.build(CacheConfig.PREFIX_NOTEBOOK, notebook_id, "*")
        await cache.delete_pattern(pattern)
        
        # Also invalidate related search cache
        search_pattern = CacheKeyBuilder.build(CacheConfig.PREFIX_SEARCH, "*", notebook_id, "*")
        await cache.delete_pattern(search_pattern)
    
    @staticmethod
    async def invalidate_source(source_id: str, notebook_id: str) -> None:
        """Invalidate cache entries for a source."""
        cache = await CacheService.get_instance()
        
        # Source-specific cache
        pattern = CacheKeyBuilder.build(CacheConfig.PREFIX_SOURCE, source_id, "*")
        await cache.delete_pattern(pattern)
        
        # Notebook cache (source list changed)
        await CacheInvalidator.invalidate_notebook(notebook_id)
    
    @staticmethod
    async def invalidate_user(user_id: str) -> None:
        """Invalidate all cache entries for a user."""
        cache = await CacheService.get_instance()
        pattern = CacheKeyBuilder.build(CacheConfig.PREFIX_USER, user_id, "*")
        await cache.delete_pattern(pattern)
    
    @staticmethod
    async def invalidate_chat_session(session_id: str) -> None:
        """Invalidate cache for a chat session."""
        cache = await CacheService.get_instance()
        pattern = CacheKeyBuilder.build(CacheConfig.PREFIX_CHAT, session_id, "*")
        await cache.delete_pattern(pattern)


# Dependency injection helper
_cache_service: Optional[CacheService] = None


async def get_cache() -> CacheService:
    """FastAPI dependency for cache service."""
    global _cache_service
    if _cache_service is None:
        _cache_service = await CacheService.get_instance()
    return _cache_service


async def get_redis() -> Optional['redis.Redis']:
    """FastAPI dependency for raw Redis client."""
    cache = await get_cache()
    return cache._client
