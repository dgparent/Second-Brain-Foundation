"""
OpenAPI/Swagger documentation configuration for AEI Core.

Provides customized API documentation with comprehensive schemas,
examples, and descriptions for all endpoints.
"""

from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from fastapi.openapi.utils import get_openapi
from fastapi.responses import HTMLResponse
from typing import Any


def custom_openapi(app: FastAPI) -> dict[str, Any]:
    """
    Generate custom OpenAPI schema with enhanced documentation.
    
    Provides comprehensive API documentation including:
    - Detailed endpoint descriptions
    - Request/response examples
    - Authentication requirements
    - Error response schemas
    
    Args:
        app: FastAPI application instance
        
    Returns:
        OpenAPI schema dictionary
    """
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="AEI Core API",
        version="1.0.0",
        description="""
# AEI Core - AI-Enabled Interface API

The AEI Core API provides a comprehensive interface for managing knowledge bases,
chat interactions, content transformation, and AI-powered insights.

## Core Features

### 🧠 Knowledge Management
- Create and organize notebooks
- Ingest content from multiple sources
- Extract entities and relationships

### 💬 Chat & Conversations  
- Natural language interactions with context
- Streaming responses via SSE
- Conversation history management

### 🔄 Content Transformation
- Convert between formats (markdown, audio, etc.)
- AI-powered summarization
- Content enhancement

### 🔍 Semantic Search
- Vector-based similarity search
- Full-text search with ranking
- Knowledge graph traversal

## Authentication

All API endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <your-api-token>
```

## Rate Limits

| Endpoint Category | Limit |
|-------------------|-------|
| Chat | 10 requests/minute |
| Transform | 30 requests/minute |
| Search | 60 requests/minute |
| Ingest | 20 requests/minute |

## Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Error description",
  "error_code": "ERROR_CODE",
  "request_id": "uuid"
}
```

## SDKs & Client Libraries

- **TypeScript/JavaScript**: `@sbf/api-client`
- **Python**: `sbf-client` (coming soon)
        """,
        routes=app.routes,
        tags=[
            {
                "name": "chat",
                "description": "Chat session management and messaging endpoints",
            },
            {
                "name": "notebooks",
                "description": "Notebook CRUD operations and organization",
            },
            {
                "name": "sources",
                "description": "Source ingestion and content management",
            },
            {
                "name": "search",
                "description": "Search and retrieval operations",
            },
            {
                "name": "transform",
                "description": "Content transformation and format conversion",
            },
            {
                "name": "va-automation",
                "description": "Voice automation and podcast generation",
            },
            {
                "name": "health",
                "description": "Health check and monitoring endpoints",
            },
        ],
    )
    
    # Add security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT token obtained from the auth service",
        },
        "apiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key",
            "description": "API key for service-to-service communication",
        },
    }
    
    # Apply security globally
    openapi_schema["security"] = [
        {"bearerAuth": []},
        {"apiKeyAuth": []},
    ]
    
    # Add common response schemas
    openapi_schema["components"]["schemas"]["Error"] = {
        "type": "object",
        "properties": {
            "detail": {
                "type": "string",
                "description": "Human-readable error message",
            },
            "error_code": {
                "type": "string",
                "description": "Machine-readable error code",
            },
            "request_id": {
                "type": "string",
                "format": "uuid",
                "description": "Unique request identifier for debugging",
            },
        },
        "required": ["detail"],
        "example": {
            "detail": "Resource not found",
            "error_code": "NOT_FOUND",
            "request_id": "550e8400-e29b-41d4-a716-446655440000",
        },
    }
    
    openapi_schema["components"]["schemas"]["PaginatedResponse"] = {
        "type": "object",
        "properties": {
            "items": {
                "type": "array",
                "description": "List of items in the current page",
            },
            "total": {
                "type": "integer",
                "description": "Total number of items",
            },
            "page": {
                "type": "integer",
                "description": "Current page number (1-indexed)",
            },
            "page_size": {
                "type": "integer",
                "description": "Number of items per page",
            },
            "has_more": {
                "type": "boolean",
                "description": "Whether more pages exist",
            },
        },
    }
    
    openapi_schema["components"]["schemas"]["HealthStatus"] = {
        "type": "object",
        "properties": {
            "status": {
                "type": "string",
                "enum": ["healthy", "degraded", "unhealthy"],
            },
            "timestamp": {
                "type": "string",
                "format": "date-time",
            },
            "checks": {
                "type": "object",
                "additionalProperties": {
                    "type": "string",
                },
            },
        },
    }
    
    # Add server information
    openapi_schema["servers"] = [
        {
            "url": "http://localhost:8000",
            "description": "Local development server",
        },
        {
            "url": "https://api.secondbrain.foundation",
            "description": "Production server",
        },
        {
            "url": "https://staging-api.secondbrain.foundation",
            "description": "Staging server",
        },
    ]
    
    # Add external documentation link
    openapi_schema["externalDocs"] = {
        "description": "Full API documentation and guides",
        "url": "https://docs.secondbrain.foundation/api",
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


def setup_docs(app: FastAPI) -> None:
    """
    Configure custom documentation endpoints for the FastAPI application.
    
    Sets up:
    - Custom OpenAPI schema
    - Swagger UI at /docs
    - ReDoc at /redoc
    - Raw OpenAPI JSON at /openapi.json
    
    Args:
        app: FastAPI application instance
    """
    # Set custom OpenAPI function
    app.openapi = lambda: custom_openapi(app)
    
    @app.get("/docs", include_in_schema=False)
    async def custom_swagger_ui() -> HTMLResponse:
        """Serve Swagger UI with custom styling."""
        return get_swagger_ui_html(
            openapi_url="/openapi.json",
            title=f"{app.title} - Swagger UI",
            swagger_favicon_url="https://fastapi.tiangolo.com/img/favicon.png",
            swagger_ui_parameters={
                "deepLinking": True,
                "persistAuthorization": True,
                "displayRequestDuration": True,
                "filter": True,
                "tryItOutEnabled": True,
            },
        )
    
    @app.get("/redoc", include_in_schema=False)
    async def custom_redoc() -> HTMLResponse:
        """Serve ReDoc with custom styling."""
        return get_redoc_html(
            openapi_url="/openapi.json",
            title=f"{app.title} - ReDoc",
            redoc_favicon_url="https://fastapi.tiangolo.com/img/favicon.png",
        )


# API endpoint documentation helpers
CHAT_EXAMPLES = {
    "create_session": {
        "summary": "Create chat session for notebook",
        "value": {
            "notebook_id": "550e8400-e29b-41d4-a716-446655440000",
            "model_override": "llama3.2",
        },
    },
    "send_message": {
        "summary": "Send a question about the notebook",
        "value": {
            "message": "What are the key concepts discussed in my notes?",
            "context_config": {
                "include_related": True,
                "max_sources": 5,
            },
        },
    },
}

NOTEBOOK_EXAMPLES = {
    "create": {
        "summary": "Create a research notebook",
        "value": {
            "name": "AI Research",
            "description": "Notes on machine learning papers",
            "icon": "🔬",
            "color": "#4CAF50",
        },
    },
}

SOURCE_EXAMPLES = {
    "ingest_url": {
        "summary": "Ingest a web article",
        "value": {
            "url": "https://example.com/article",
            "notebook_id": "550e8400-e29b-41d4-a716-446655440000",
            "extract_entities": True,
        },
    },
    "ingest_file": {
        "summary": "Ingest uploaded file",
        "value": {
            "filename": "research-paper.pdf",
            "content_type": "application/pdf",
            "notebook_id": "550e8400-e29b-41d4-a716-446655440000",
        },
    },
}

SEARCH_EXAMPLES = {
    "semantic": {
        "summary": "Semantic search across all notebooks",
        "value": {
            "query": "machine learning optimization techniques",
            "notebook_ids": None,
            "limit": 10,
            "min_score": 0.7,
        },
    },
    "hybrid": {
        "summary": "Hybrid search with filters",
        "value": {
            "query": "neural network architectures",
            "notebook_ids": ["550e8400-e29b-41d4-a716-446655440000"],
            "source_types": ["article", "paper"],
            "date_from": "2024-01-01",
            "limit": 20,
        },
    },
}
