"""
Pytest configuration and shared fixtures for AEI Core tests.
"""

import asyncio
import pytest
import pytest_asyncio
from typing import AsyncGenerator, Generator
from unittest.mock import MagicMock, AsyncMock

from httpx import AsyncClient
from fastapi.testclient import TestClient

# Import application
from main import app


# Event loop configuration
@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# FastAPI test client
@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Synchronous test client for FastAPI."""
    with TestClient(app) as c:
        yield c


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Async test client for FastAPI."""
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c


# Mock LLM service
@pytest.fixture
def mock_llm() -> MagicMock:
    """Mock LLM service for testing."""
    mock = MagicMock()
    mock.generate = AsyncMock(return_value="Test LLM response")
    mock.embed = AsyncMock(return_value=[0.1] * 768)
    return mock


# Mock database session
@pytest_asyncio.fixture
async def mock_db_session() -> AsyncMock:
    """Mock database session for testing."""
    session = AsyncMock()
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.close = AsyncMock()
    return session


# Mock Redis client
@pytest.fixture
def mock_redis() -> MagicMock:
    """Mock Redis client for testing."""
    mock = MagicMock()
    mock.get = AsyncMock(return_value=None)
    mock.set = AsyncMock(return_value=True)
    mock.delete = AsyncMock(return_value=1)
    mock.exists = AsyncMock(return_value=0)
    mock.expire = AsyncMock(return_value=True)
    mock.ping = AsyncMock(return_value=True)
    return mock


# Test data fixtures
@pytest.fixture
def sample_notebook_data() -> dict:
    """Sample notebook data for testing."""
    return {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Test Notebook",
        "description": "A notebook for testing",
        "tenant_id": "00000000-0000-0000-0000-000000000001",
        "icon": "📓",
        "color": "#4CAF50",
    }


@pytest.fixture
def sample_source_data() -> dict:
    """Sample source data for testing."""
    return {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "notebook_id": "550e8400-e29b-41d4-a716-446655440000",
        "source_type": "article",
        "title": "Test Article",
        "content": "This is the content of the test article.",
        "url": "https://example.com/article",
        "tenant_id": "00000000-0000-0000-0000-000000000001",
    }


@pytest.fixture
def sample_chat_message() -> dict:
    """Sample chat message for testing."""
    return {
        "message": "What is the meaning of life?",
        "context": None,
        "model_override": None,
    }


@pytest.fixture
def sample_embedding() -> list[float]:
    """Sample embedding vector for testing."""
    return [0.1] * 768


# Test tenant
@pytest.fixture
def test_tenant_id() -> str:
    """Test tenant ID."""
    return "00000000-0000-0000-0000-000000000001"


# Test user
@pytest.fixture
def test_user_id() -> str:
    """Test user ID."""
    return "11111111-1111-1111-1111-111111111111"


# Auth header fixture
@pytest.fixture
def auth_headers(test_tenant_id: str, test_user_id: str) -> dict:
    """Authorization headers for testing."""
    return {
        "Authorization": "Bearer test-token",
        "X-Tenant-ID": test_tenant_id,
        "X-User-ID": test_user_id,
    }


# Helper to mark integration tests
def pytest_configure(config):
    """Configure pytest markers."""
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow"
    )
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )
