"""
Unit tests for health check endpoints.
"""

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    """Test client fixture."""
    return TestClient(app)


class TestHealthEndpoints:
    """Tests for health check endpoints."""
    
    def test_health_check_returns_healthy(self, client):
        """Test basic health check endpoint."""
        response = client.get("/api/v1/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
    
    def test_health_check_alternate_path(self, client):
        """Test health check at root path."""
        response = client.get("/api/v1/health/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_liveness_check(self, client):
        """Test Kubernetes liveness probe endpoint."""
        response = client.get("/api/v1/health/live")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "alive"
        assert "timestamp" in data
    
    def test_readiness_check_structure(self, client):
        """Test readiness check returns expected structure."""
        response = client.get("/api/v1/health/ready")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] in ["ready", "not_ready"]
        assert "checks" in data
        assert "all_healthy" in data
        assert "timestamp" in data
    
    def test_deep_health_check_structure(self, client):
        """Test deep health check returns detailed information."""
        response = client.get("/api/v1/health/deep")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert data["status"] in ["healthy", "degraded", "unhealthy"]
        assert "timestamp" in data
        assert "version" in data
        assert "dependencies" in data
        assert isinstance(data["dependencies"], list)
        
        # Check dependency structure
        if data["dependencies"]:
            dep = data["dependencies"][0]
            assert "name" in dep
            assert "status" in dep
    
    def test_startup_check(self, client):
        """Test startup probe endpoint."""
        response = client.get("/api/v1/health/startup")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "started"
        assert "timestamp" in data


class TestRootEndpoint:
    """Tests for root endpoint."""
    
    def test_root_returns_api_info(self, client):
        """Test root endpoint returns API information."""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["service"] == "AEI Core"
        assert "version" in data
        assert data["docs"] == "/docs"
        assert data["redoc"] == "/redoc"
        assert data["openapi"] == "/openapi.json"
        assert data["health"] == "/api/v1/health"


class TestAPIDocumentation:
    """Tests for API documentation endpoints."""
    
    def test_swagger_ui_available(self, client):
        """Test Swagger UI is accessible."""
        response = client.get("/docs")
        
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
    
    def test_redoc_available(self, client):
        """Test ReDoc is accessible."""
        response = client.get("/redoc")
        
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
    
    def test_openapi_schema_valid(self, client):
        """Test OpenAPI schema is valid."""
        response = client.get("/openapi.json")
        
        assert response.status_code == 200
        data = response.json()
        
        # Check required OpenAPI fields
        assert "openapi" in data
        assert data["openapi"].startswith("3.")
        assert "info" in data
        assert data["info"]["title"] == "AEI Core API"
        assert "paths" in data
        
        # Check custom enhancements
        assert "servers" in data
        assert "components" in data
        assert "securitySchemes" in data["components"]
    
    def test_openapi_has_security_schemes(self, client):
        """Test OpenAPI includes security schemes."""
        response = client.get("/openapi.json")
        data = response.json()
        
        security_schemes = data["components"]["securitySchemes"]
        assert "bearerAuth" in security_schemes
        assert "apiKeyAuth" in security_schemes
    
    def test_openapi_has_error_schema(self, client):
        """Test OpenAPI includes error response schema."""
        response = client.get("/openapi.json")
        data = response.json()
        
        schemas = data["components"]["schemas"]
        assert "Error" in schemas
        assert "PaginatedResponse" in schemas
        assert "HealthStatus" in schemas
