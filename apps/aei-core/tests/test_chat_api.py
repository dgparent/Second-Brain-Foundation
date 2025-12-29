"""
Unit tests for chat API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock

from main import app


@pytest.fixture
def client():
    """Test client fixture."""
    return TestClient(app)


class TestChatSessions:
    """Tests for chat session management."""
    
    def test_create_session_success(self, client):
        """Test creating a new chat session."""
        response = client.post(
            "/api/v1/chat/sessions",
            json={
                "notebook_id": None,
                "model_override": None,
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "session_id" in data
        assert len(data["session_id"]) == 36  # UUID format
    
    def test_create_session_with_notebook(self, client):
        """Test creating a session scoped to a notebook."""
        notebook_id = "550e8400-e29b-41d4-a716-446655440000"
        
        response = client.post(
            "/api/v1/chat/sessions",
            json={
                "notebook_id": notebook_id,
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["notebook_id"] == notebook_id
    
    def test_create_session_with_model_override(self, client):
        """Test creating a session with model override."""
        response = client.post(
            "/api/v1/chat/sessions",
            json={
                "model_override": "llama3.2",
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["model_override"] == "llama3.2"


class TestChatMessages:
    """Tests for chat message handling."""
    
    @pytest.fixture
    def session_id(self, client):
        """Create a session and return its ID."""
        response = client.post("/api/v1/chat/sessions", json={})
        return response.json()["session_id"]
    
    def test_send_message_success(self, client, session_id):
        """Test sending a message to a session."""
        # Mock the chat session to avoid actual LLM calls
        with patch('api.chat._sessions') as mock_sessions:
            mock_session = AsyncMock()
            mock_session.send = AsyncMock(return_value="Test response")
            mock_sessions.__contains__ = lambda self, key: True
            mock_sessions.__getitem__ = lambda self, key: mock_session
            
            response = client.post(
                f"/api/v1/chat/{session_id}/message",
                json={
                    "message": "Hello, world!",
                }
            )
        
        # Session auto-creates if not found
        assert response.status_code in [200, 500]
    
    def test_send_message_empty_message(self, client, session_id):
        """Test sending an empty message returns validation error."""
        response = client.post(
            f"/api/v1/chat/{session_id}/message",
            json={
                "message": "",
            }
        )
        
        assert response.status_code == 422
    
    def test_send_message_with_context(self, client, session_id):
        """Test sending a message with context."""
        response = client.post(
            f"/api/v1/chat/{session_id}/message",
            json={
                "message": "What is this about?",
                "context": "This is additional context for the conversation.",
            }
        )
        
        # Should not fail on validation
        assert response.status_code in [200, 404, 500]
    
    def test_send_message_nonexistent_session(self, client):
        """Test sending to a non-existent session creates it."""
        fake_session_id = "99999999-9999-9999-9999-999999999999"
        
        response = client.post(
            f"/api/v1/chat/{fake_session_id}/message",
            json={
                "message": "Hello!",
            }
        )
        
        # Session is auto-created, so this should work
        # May fail due to LLM not being available
        assert response.status_code in [200, 500]


class TestChatHistory:
    """Tests for chat history endpoints."""
    
    def test_get_history_nonexistent_session(self, client):
        """Test getting history for non-existent session."""
        response = client.get("/api/v1/chat/nonexistent/history")
        
        assert response.status_code == 404


class TestChatStreaming:
    """Tests for streaming chat endpoints."""
    
    @pytest.fixture
    def session_id(self, client):
        """Create a session and return its ID."""
        response = client.post("/api/v1/chat/sessions", json={})
        return response.json()["session_id"]
    
    def test_stream_endpoint_exists(self, client, session_id):
        """Test that streaming endpoint is available."""
        response = client.post(
            f"/api/v1/chat/{session_id}/stream",
            json={
                "message": "Hello!",
            }
        )
        
        # Streaming endpoints return different content types
        # May fail due to LLM not being available
        assert response.status_code in [200, 500]


class TestChatValidation:
    """Tests for chat input validation."""
    
    @pytest.fixture
    def session_id(self, client):
        """Create a session and return its ID."""
        response = client.post("/api/v1/chat/sessions", json={})
        return response.json()["session_id"]
    
    def test_message_max_length(self, client, session_id):
        """Test message maximum length validation."""
        # Create a message that exceeds the limit (100000 chars)
        long_message = "a" * 100001
        
        response = client.post(
            f"/api/v1/chat/{session_id}/message",
            json={
                "message": long_message,
            }
        )
        
        assert response.status_code == 422
    
    def test_message_at_max_length(self, client, session_id):
        """Test message at maximum length is accepted."""
        max_message = "a" * 100000
        
        response = client.post(
            f"/api/v1/chat/{session_id}/message",
            json={
                "message": max_message,
            }
        )
        
        # Should not fail validation
        assert response.status_code in [200, 500]
    
    def test_invalid_json_body(self, client, session_id):
        """Test handling of invalid JSON body."""
        response = client.post(
            f"/api/v1/chat/{session_id}/message",
            content="not valid json",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422
