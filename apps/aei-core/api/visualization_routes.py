"""
Visualization API Routes

API endpoints for generating mind maps and knowledge graphs.
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

from ..services.mind_map_generator import MindMapGenerator
from ..services.entity_extractor import EntityExtractor
from ..services.llm_router import LLMRouter
from ..db.content_repository import ContentRepository

router = APIRouter(prefix="/visualization", tags=["visualization"])


# =============================================================================
# Request/Response Models
# =============================================================================

class GenerateMindMapRequest(BaseModel):
    """Request to generate a mind map."""
    content_id: Optional[str] = Field(None, description="ID of processed content")
    text: Optional[str] = Field(None, description="Raw text to analyze")
    title: str = Field("Mind Map", description="Title for the mind map")
    max_depth: int = Field(4, ge=2, le=6, description="Maximum hierarchy depth")
    max_nodes: int = Field(50, ge=10, le=100, description="Maximum number of nodes")


class GenerateKnowledgeGraphRequest(BaseModel):
    """Request to generate a knowledge graph."""
    content_id: Optional[str] = Field(None, description="ID of processed content")
    text: Optional[str] = Field(None, description="Raw text to analyze")
    title: str = Field("Knowledge Graph", description="Title for the graph")
    entity_types: Optional[list[str]] = Field(None, description="Types to extract")
    min_confidence: float = Field(0.5, ge=0.0, le=1.0, description="Minimum confidence")
    max_entities: int = Field(50, ge=10, le=100, description="Maximum entities")


class MergeGraphsRequest(BaseModel):
    """Request to merge multiple knowledge graphs."""
    graph_ids: list[str] = Field(..., description="IDs of graphs to merge")
    deduplicate: bool = Field(True, description="Whether to merge duplicates")


class MindMapResponse(BaseModel):
    """Mind map response."""
    id: str
    title: str
    description: str
    source_id: Optional[str] = None
    nodes: list[dict]
    edges: list[dict]
    metadata: dict


class KnowledgeGraphResponse(BaseModel):
    """Knowledge graph response."""
    id: str
    title: str
    source_id: Optional[str] = None
    entities: list[dict]
    relations: list[dict]
    metadata: dict


# =============================================================================
# Dependencies
# =============================================================================

async def get_llm_router() -> LLMRouter:
    """Get LLM router instance."""
    # In production, this would be injected from app state
    return LLMRouter()


async def get_content_repository() -> ContentRepository:
    """Get content repository instance."""
    # In production, this would be injected from app state
    return ContentRepository()


# =============================================================================
# Mind Map Endpoints
# =============================================================================

@router.post("/mind-map", response_model=MindMapResponse)
async def generate_mind_map(
    request: GenerateMindMapRequest,
    llm_router: LLMRouter = Depends(get_llm_router),
    content_repo: ContentRepository = Depends(get_content_repository),
):
    """
    Generate a mind map from content or text.
    
    Either content_id or text must be provided.
    """
    generator = MindMapGenerator(llm_router)
    
    if request.content_id:
        # Generate from stored content
        content = await content_repo.get_by_id(request.content_id)
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        result = await generator.generate_from_content(
            content=content,
            max_depth=request.max_depth,
            max_nodes=request.max_nodes,
        )
    elif request.text:
        # Generate from raw text
        result = await generator.generate_from_text(
            text=request.text,
            title=request.title,
            max_depth=request.max_depth,
            max_nodes=request.max_nodes,
        )
    else:
        raise HTTPException(
            status_code=400,
            detail="Either content_id or text must be provided"
        )
    
    return MindMapResponse(
        id=result["id"],
        title=result["title"],
        description=result.get("description", ""),
        source_id=result.get("sourceId"),
        nodes=result["nodes"],
        edges=result["edges"],
        metadata=result.get("metadata", {}),
    )


@router.get("/mind-map/{mind_map_id}", response_model=MindMapResponse)
async def get_mind_map(
    mind_map_id: str,
    content_repo: ContentRepository = Depends(get_content_repository),
):
    """
    Retrieve a previously generated mind map.
    """
    # In production, this would fetch from a mind map store
    raise HTTPException(status_code=501, detail="Mind map storage not implemented")


@router.get("/content/{content_id}/mind-map", response_model=MindMapResponse)
async def get_content_mind_map(
    content_id: str,
    regenerate: bool = False,
    llm_router: LLMRouter = Depends(get_llm_router),
    content_repo: ContentRepository = Depends(get_content_repository),
):
    """
    Get or generate a mind map for specific content.
    """
    content = await content_repo.get_by_id(content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Check for cached mind map (in production)
    # cached = await mind_map_repo.get_by_content_id(content_id)
    # if cached and not regenerate:
    #     return cached
    
    generator = MindMapGenerator(llm_router)
    result = await generator.generate_from_content(content)
    
    return MindMapResponse(
        id=result["id"],
        title=result["title"],
        description=result.get("description", ""),
        source_id=content_id,
        nodes=result["nodes"],
        edges=result["edges"],
        metadata=result.get("metadata", {}),
    )


# =============================================================================
# Knowledge Graph Endpoints
# =============================================================================

@router.post("/knowledge-graph", response_model=KnowledgeGraphResponse)
async def generate_knowledge_graph(
    request: GenerateKnowledgeGraphRequest,
    llm_router: LLMRouter = Depends(get_llm_router),
    content_repo: ContentRepository = Depends(get_content_repository),
):
    """
    Generate a knowledge graph from content or text.
    
    Either content_id or text must be provided.
    """
    extractor = EntityExtractor(llm_router)
    
    if request.content_id:
        content = await content_repo.get_by_id(request.content_id)
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        result = await extractor.extract_from_content(
            content=content,
            entity_types=request.entity_types,
            min_confidence=request.min_confidence,
            max_entities=request.max_entities,
        )
    elif request.text:
        result = await extractor.extract_from_text(
            text=request.text,
            title=request.title,
            entity_types=request.entity_types,
            min_confidence=request.min_confidence,
            max_entities=request.max_entities,
        )
    else:
        raise HTTPException(
            status_code=400,
            detail="Either content_id or text must be provided"
        )
    
    return KnowledgeGraphResponse(
        id=result["id"],
        title=result["title"],
        source_id=result.get("sourceId"),
        entities=result["entities"],
        relations=result["relations"],
        metadata=result.get("metadata", {}),
    )


@router.get("/knowledge-graph/{graph_id}", response_model=KnowledgeGraphResponse)
async def get_knowledge_graph(
    graph_id: str,
    content_repo: ContentRepository = Depends(get_content_repository),
):
    """
    Retrieve a previously generated knowledge graph.
    """
    raise HTTPException(status_code=501, detail="Graph storage not implemented")


@router.get("/content/{content_id}/knowledge-graph", response_model=KnowledgeGraphResponse)
async def get_content_knowledge_graph(
    content_id: str,
    regenerate: bool = False,
    entity_types: Optional[str] = None,
    llm_router: LLMRouter = Depends(get_llm_router),
    content_repo: ContentRepository = Depends(get_content_repository),
):
    """
    Get or generate a knowledge graph for specific content.
    """
    content = await content_repo.get_by_id(content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Parse entity types from query param
    types_list = entity_types.split(",") if entity_types else None
    
    extractor = EntityExtractor(llm_router)
    result = await extractor.extract_from_content(
        content=content,
        entity_types=types_list,
    )
    
    return KnowledgeGraphResponse(
        id=result["id"],
        title=result["title"],
        source_id=content_id,
        entities=result["entities"],
        relations=result["relations"],
        metadata=result.get("metadata", {}),
    )


@router.post("/knowledge-graph/merge", response_model=KnowledgeGraphResponse)
async def merge_knowledge_graphs(
    request: MergeGraphsRequest,
    llm_router: LLMRouter = Depends(get_llm_router),
):
    """
    Merge multiple knowledge graphs into one.
    """
    # In production, this would fetch graphs from storage
    raise HTTPException(status_code=501, detail="Graph merging not implemented")


# =============================================================================
# Entity Endpoints
# =============================================================================

@router.get("/entities/types")
async def get_entity_types():
    """
    Get available entity types.
    """
    return {
        "types": [
            {"id": "person", "label": "Person", "description": "People, characters, authors"},
            {"id": "organization", "label": "Organization", "description": "Companies, institutions"},
            {"id": "concept", "label": "Concept", "description": "Ideas, theories, methodologies"},
            {"id": "event", "label": "Event", "description": "Historical events, incidents"},
            {"id": "location", "label": "Location", "description": "Places, regions, addresses"},
            {"id": "document", "label": "Document", "description": "Books, papers, articles"},
            {"id": "topic", "label": "Topic", "description": "Subject areas, themes"},
        ]
    }


@router.get("/relations/types")
async def get_relation_types():
    """
    Get available relationship types.
    """
    return {
        "types": [
            {"id": "mentions", "label": "Mentions", "directional": True},
            {"id": "related_to", "label": "Related To", "directional": False},
            {"id": "part_of", "label": "Part Of", "directional": True},
            {"id": "caused_by", "label": "Caused By", "directional": True},
            {"id": "leads_to", "label": "Leads To", "directional": True},
            {"id": "associated_with", "label": "Associated With", "directional": False},
            {"id": "contrasts_with", "label": "Contrasts With", "directional": False},
            {"id": "supports", "label": "Supports", "directional": True},
            {"id": "opposes", "label": "Opposes", "directional": True},
        ]
    }
