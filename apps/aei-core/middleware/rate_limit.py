"""
Rate limiting middleware for AEI Core.

Implements token bucket rate limiting using Redis
for distributed rate limiting across multiple instances.
"""

import time
import logging
from typing import Optional, Dict, Callable
from dataclasses import dataclass
from enum import Enum

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response, JSONResponse

try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    redis = None

from services.cache import get_redis

logger = logging.getLogger(__name__)


class RateLimitCategory(Enum):
    """Rate limit categories for different endpoint types."""
    CHAT = "chat"
    TRANSFORM = "transform"
    SEARCH = "search"
    INGEST = "ingest"
    DEFAULT = "default"


@dataclass
class RateLimitConfig:
    """Configuration for rate limiting."""
    requests: int  # Number of requests allowed
    window: int  # Time window in seconds
    
    @property
    def key_suffix(self) -> str:
        return f"{self.requests}_{self.window}"


# Rate limit configurations by category
RATE_LIMITS: Dict[RateLimitCategory, RateLimitConfig] = {
    RateLimitCategory.CHAT: RateLimitConfig(requests=10, window=60),  # 10/min
    RateLimitCategory.TRANSFORM: RateLimitConfig(requests=30, window=60),  # 30/min
    RateLimitCategory.SEARCH: RateLimitConfig(requests=60, window=60),  # 60/min
    RateLimitCategory.INGEST: RateLimitConfig(requests=20, window=60),  # 20/min
    RateLimitCategory.DEFAULT: RateLimitConfig(requests=100, window=60),  # 100/min
}


# Endpoint category mapping
ENDPOINT_CATEGORIES: Dict[str, RateLimitCategory] = {
    "/api/v1/chat": RateLimitCategory.CHAT,
    "/api/v1/transform": RateLimitCategory.TRANSFORM,
    "/api/v1/search": RateLimitCategory.SEARCH,
    "/api/v1/sources/ingest": RateLimitCategory.INGEST,
    "/api/v1/notebooks": RateLimitCategory.DEFAULT,
}


class RateLimiter:
    """
    Token bucket rate limiter using Redis.
    
    Uses sorted sets for sliding window rate limiting.
    """
    
    def __init__(self, redis_client: Optional['redis.Redis'] = None):
        """
        Initialize the rate limiter.
        
        Args:
            redis_client: Redis client for distributed rate limiting
        """
        self._redis = redis_client
        self._local_cache: Dict[str, list] = {}  # Fallback for no Redis
    
    async def is_allowed(
        self,
        key: str,
        config: RateLimitConfig,
    ) -> tuple[bool, dict]:
        """
        Check if a request is allowed under rate limits.
        
        Args:
            key: Rate limit key (e.g., "user:123:chat")
            config: Rate limit configuration
            
        Returns:
            Tuple of (is_allowed, rate_limit_info)
        """
        now = time.time()
        window_start = now - config.window
        
        if self._redis:
            return await self._check_redis(key, config, now, window_start)
        else:
            return self._check_local(key, config, now, window_start)
    
    async def _check_redis(
        self,
        key: str,
        config: RateLimitConfig,
        now: float,
        window_start: float,
    ) -> tuple[bool, dict]:
        """Check rate limit using Redis sorted set."""
        try:
            # Use a pipeline for atomic operations
            pipe = self._redis.pipeline()
            
            # Remove expired entries
            pipe.zremrangebyscore(key, 0, window_start)
            
            # Count current requests in window
            pipe.zcard(key)
            
            # Execute pipeline
            results = await pipe.execute()
            current_count = results[1]
            
            # Calculate remaining
            remaining = max(0, config.requests - current_count)
            reset_time = int(now + config.window)
            
            rate_info = {
                "limit": config.requests,
                "remaining": remaining,
                "reset": reset_time,
                "window": config.window,
            }
            
            if current_count < config.requests:
                # Add this request
                await self._redis.zadd(key, {str(now): now})
                await self._redis.expire(key, config.window + 1)
                return True, rate_info
            else:
                return False, rate_info
                
        except Exception as e:
            logger.error(f"Redis rate limit error: {e}")
            # Fail open - allow request if Redis fails
            return True, {"limit": config.requests, "remaining": 1, "reset": 0}
    
    def _check_local(
        self,
        key: str,
        config: RateLimitConfig,
        now: float,
        window_start: float,
    ) -> tuple[bool, dict]:
        """Check rate limit using local memory (single-instance fallback)."""
        if key not in self._local_cache:
            self._local_cache[key] = []
        
        # Remove expired entries
        self._local_cache[key] = [
            t for t in self._local_cache[key] if t > window_start
        ]
        
        current_count = len(self._local_cache[key])
        remaining = max(0, config.requests - current_count)
        reset_time = int(now + config.window)
        
        rate_info = {
            "limit": config.requests,
            "remaining": remaining,
            "reset": reset_time,
            "window": config.window,
        }
        
        if current_count < config.requests:
            self._local_cache[key].append(now)
            return True, rate_info
        else:
            return False, rate_info
    
    async def reset(self, key: str) -> None:
        """Reset rate limit for a key."""
        if self._redis:
            await self._redis.delete(key)
        elif key in self._local_cache:
            del self._local_cache[key]


def get_client_identifier(request: Request) -> str:
    """
    Extract client identifier from request.
    
    Uses (in order of preference):
    1. User ID from auth token
    2. API key
    3. Client IP address
    
    Args:
        request: FastAPI request object
        
    Returns:
        Client identifier string
    """
    # Check for authenticated user
    user_id = request.state.__dict__.get("user_id")
    if user_id:
        return f"user:{user_id}"
    
    # Check for API key
    api_key = request.headers.get("X-API-Key")
    if api_key:
        return f"api:{api_key[:8]}"  # Use prefix only
    
    # Fall back to IP address
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        ip = forwarded.split(",")[0].strip()
    else:
        ip = request.client.host if request.client else "unknown"
    
    return f"ip:{ip}"


def get_endpoint_category(path: str) -> RateLimitCategory:
    """
    Determine rate limit category for an endpoint.
    
    Args:
        path: Request path
        
    Returns:
        Rate limit category
    """
    for prefix, category in ENDPOINT_CATEGORIES.items():
        if path.startswith(prefix):
            return category
    return RateLimitCategory.DEFAULT


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    FastAPI middleware for rate limiting.
    
    Applies rate limits based on endpoint category and client identifier.
    """
    
    def __init__(self, app, redis_client: Optional['redis.Redis'] = None):
        """
        Initialize the middleware.
        
        Args:
            app: FastAPI application
            redis_client: Optional Redis client for distributed limiting
        """
        super().__init__(app)
        self._limiter = RateLimiter(redis_client)
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """Process request through rate limiter."""
        # Skip rate limiting for health checks
        if request.url.path.startswith("/api/v1/health"):
            return await call_next(request)
        
        # Skip rate limiting for docs
        if request.url.path in ["/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Get client identifier and category
        client_id = get_client_identifier(request)
        category = get_endpoint_category(request.url.path)
        config = RATE_LIMITS[category]
        
        # Build rate limit key
        rate_key = f"rate:{client_id}:{category.value}"
        
        # Check rate limit
        allowed, rate_info = await self._limiter.is_allowed(rate_key, config)
        
        # Add rate limit headers to response
        if allowed:
            response = await call_next(request)
        else:
            response = JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Rate limit exceeded",
                    "error_code": "RATE_LIMIT_EXCEEDED",
                    "retry_after": rate_info["reset"] - int(time.time()),
                }
            )
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(rate_info["limit"])
        response.headers["X-RateLimit-Remaining"] = str(rate_info["remaining"])
        response.headers["X-RateLimit-Reset"] = str(rate_info["reset"])
        
        if not allowed:
            response.headers["Retry-After"] = str(
                max(1, rate_info["reset"] - int(time.time()))
            )
        
        return response


# Decorator for route-level rate limiting
def rate_limit(
    category: RateLimitCategory = RateLimitCategory.DEFAULT,
    requests: Optional[int] = None,
    window: Optional[int] = None,
):
    """
    Decorator for applying rate limits to specific routes.
    
    Args:
        category: Rate limit category
        requests: Override number of requests (optional)
        window: Override time window (optional)
        
    Returns:
        Decorator function
    """
    config = RATE_LIMITS[category]
    if requests is not None:
        config = RateLimitConfig(requests=requests, window=config.window)
    if window is not None:
        config = RateLimitConfig(requests=config.requests, window=window)
    
    def decorator(func: Callable):
        async def wrapper(request: Request, *args, **kwargs):
            # Get limiter from app state or create new one
            limiter = getattr(request.app.state, "rate_limiter", RateLimiter())
            
            client_id = get_client_identifier(request)
            rate_key = f"rate:{client_id}:{func.__name__}"
            
            allowed, rate_info = await limiter.is_allowed(rate_key, config)
            
            if not allowed:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded",
                    headers={
                        "X-RateLimit-Limit": str(rate_info["limit"]),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(rate_info["reset"]),
                        "Retry-After": str(max(1, rate_info["reset"] - int(time.time()))),
                    }
                )
            
            return await func(request, *args, **kwargs)
        
        return wrapper
    return decorator
