"""
Visualization Services Tests

Tests for mind map generator and entity extractor services.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from apps.aei_core.services.mind_map_generator import (
    MindMapGenerator,
    MindMapNode,
    MindMapEdge,
)
from apps.aei_core.services.entity_extractor import (
    EntityExtractor,
    GraphEntity,
    GraphRelation,
    ENTITY_TYPES,
    RELATION_TYPES,
)


# =============================================================================
# MindMapNode Tests
# =============================================================================

class TestMindMapNode:
    """Tests for MindMapNode class."""
    
    def test_create_node(self):
        """Test creating a mind map node."""
        node = MindMapNode(
            id="node-1",
            label="Test Node",
            type="topic",
            description="A test node",
            parent_id="root",
        )
        
        assert node.id == "node-1"
        assert node.label == "Test Node"
        assert node.type == "topic"
        assert node.description == "A test node"
        assert node.parent_id == "root"
        assert node.children == []
        assert node.metadata == {}
    
    def test_to_dict(self):
        """Test converting node to dictionary."""
        node = MindMapNode(
            id="node-1",
            label="Test Node",
            type="subtopic",
            description="Description",
            parent_id="parent",
            children=["child-1", "child-2"],
            metadata={"key": "value"},
        )
        
        result = node.to_dict()
        
        assert result["id"] == "node-1"
        assert result["label"] == "Test Node"
        assert result["type"] == "subtopic"
        assert result["description"] == "Description"
        assert result["parentId"] == "parent"
        assert result["childCount"] == 2
        assert result["isExpanded"] is True
        assert result["metadata"] == {"key": "value"}


# =============================================================================
# MindMapEdge Tests
# =============================================================================

class TestMindMapEdge:
    """Tests for MindMapEdge class."""
    
    def test_create_edge(self):
        """Test creating a mind map edge."""
        edge = MindMapEdge(
            id="edge-1",
            source="node-1",
            target="node-2",
            label="connects",
            style="dashed",
        )
        
        assert edge.id == "edge-1"
        assert edge.source == "node-1"
        assert edge.target == "node-2"
        assert edge.label == "connects"
        assert edge.style == "dashed"
    
    def test_to_dict(self):
        """Test converting edge to dictionary."""
        edge = MindMapEdge(
            id="edge-1",
            source="node-1",
            target="node-2",
        )
        
        result = edge.to_dict()
        
        assert result["id"] == "edge-1"
        assert result["source"] == "node-1"
        assert result["target"] == "node-2"
        assert result["label"] == ""
        assert result["style"] == "solid"


# =============================================================================
# MindMapGenerator Tests
# =============================================================================

class TestMindMapGenerator:
    """Tests for MindMapGenerator service."""
    
    @pytest.fixture
    def mock_llm_router(self):
        """Create a mock LLM router."""
        router = MagicMock()
        router.generate = AsyncMock()
        return router
    
    @pytest.fixture
    def generator(self, mock_llm_router):
        """Create a MindMapGenerator instance."""
        return MindMapGenerator(mock_llm_router)
    
    @pytest.mark.asyncio
    async def test_generate_from_text(self, generator, mock_llm_router):
        """Test generating mind map from text."""
        mock_llm_router.generate.return_value = '''
        {
            "title": "Test Mind Map",
            "description": "A test map",
            "nodes": [
                {"id": "root", "label": "Main Topic", "type": "root", "parentId": null},
                {"id": "topic-1", "label": "Topic 1", "type": "topic", "parentId": "root"}
            ]
        }
        '''
        
        result = await generator.generate_from_text(
            text="Sample text for analysis",
            title="Test Map",
        )
        
        assert result["title"] == "Test Mind Map"
        assert len(result["nodes"]) == 2
        assert len(result["edges"]) == 1
        mock_llm_router.generate.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_generate_handles_markdown_response(self, generator, mock_llm_router):
        """Test handling of markdown-wrapped JSON response."""
        mock_llm_router.generate.return_value = '''```json
        {
            "title": "Test",
            "nodes": [
                {"id": "root", "label": "Root", "type": "root", "parentId": null}
            ]
        }
        ```'''
        
        result = await generator.generate_from_text(text="Test")
        
        assert result["title"] == "Test"
        assert len(result["nodes"]) == 1
    
    @pytest.mark.asyncio
    async def test_generate_handles_invalid_json(self, generator, mock_llm_router):
        """Test handling of invalid JSON response."""
        mock_llm_router.generate.return_value = "Invalid JSON response"
        
        result = await generator.generate_from_text(text="Test")
        
        # Should return minimal valid structure
        assert "nodes" in result
        assert len(result["nodes"]) >= 1
    
    def test_calculate_depth(self, generator):
        """Test depth calculation for nodes."""
        nodes = [
            {"id": "root", "parentId": None},
            {"id": "child", "parentId": "root"},
            {"id": "grandchild", "parentId": "child"},
        ]
        
        assert generator._calculate_depth(nodes[0], nodes) == 0
        assert generator._calculate_depth(nodes[1], nodes) == 1
        assert generator._calculate_depth(nodes[2], nodes) == 2


# =============================================================================
# GraphEntity Tests
# =============================================================================

class TestGraphEntity:
    """Tests for GraphEntity class."""
    
    def test_create_entity(self):
        """Test creating a graph entity."""
        entity = GraphEntity(
            id="entity-1",
            name="Test Entity",
            type="person",
            description="A test entity",
            properties={"role": "developer"},
            confidence=0.95,
            importance=0.8,
        )
        
        assert entity.id == "entity-1"
        assert entity.name == "Test Entity"
        assert entity.type == "person"
        assert entity.confidence == 0.95
        assert entity.importance == 0.8
        assert entity.properties["role"] == "developer"
    
    def test_to_dict(self):
        """Test converting entity to dictionary."""
        entity = GraphEntity(
            id="entity-1",
            name="Test Entity",
            type="concept",
            confidence=0.9,
        )
        
        result = entity.to_dict()
        
        assert result["id"] == "entity-1"
        assert result["name"] == "Test Entity"
        assert result["type"] == "concept"
        assert result["confidence"] == 0.9


# =============================================================================
# GraphRelation Tests
# =============================================================================

class TestGraphRelation:
    """Tests for GraphRelation class."""
    
    def test_create_relation(self):
        """Test creating a graph relation."""
        relation = GraphRelation(
            id="rel-1",
            source_id="entity-1",
            target_id="entity-2",
            type="related_to",
            label="works with",
            weight=0.8,
        )
        
        assert relation.id == "rel-1"
        assert relation.source_id == "entity-1"
        assert relation.target_id == "entity-2"
        assert relation.type == "related_to"
        assert relation.weight == 0.8
    
    def test_to_dict(self):
        """Test converting relation to dictionary."""
        relation = GraphRelation(
            id="rel-1",
            source_id="entity-1",
            target_id="entity-2",
            type="part_of",
        )
        
        result = relation.to_dict()
        
        assert result["id"] == "rel-1"
        assert result["sourceId"] == "entity-1"
        assert result["targetId"] == "entity-2"
        assert result["type"] == "part_of"


# =============================================================================
# EntityExtractor Tests
# =============================================================================

class TestEntityExtractor:
    """Tests for EntityExtractor service."""
    
    @pytest.fixture
    def mock_llm_router(self):
        """Create a mock LLM router."""
        router = MagicMock()
        router.generate = AsyncMock()
        return router
    
    @pytest.fixture
    def extractor(self, mock_llm_router):
        """Create an EntityExtractor instance."""
        return EntityExtractor(mock_llm_router)
    
    @pytest.mark.asyncio
    async def test_extract_from_text(self, extractor, mock_llm_router):
        """Test extracting entities from text."""
        mock_llm_router.generate.return_value = '''
        {
            "entities": [
                {"id": "e1", "name": "John Doe", "type": "person", "confidence": 0.9},
                {"id": "e2", "name": "Acme Corp", "type": "organization", "confidence": 0.95}
            ],
            "relations": [
                {"id": "r1", "sourceId": "e1", "targetId": "e2", "type": "associated_with"}
            ]
        }
        '''
        
        result = await extractor.extract_from_text(
            text="John Doe works at Acme Corp.",
            title="Test Graph",
        )
        
        assert len(result["entities"]) == 2
        assert len(result["relations"]) == 1
        assert result["entities"][0]["name"] == "John Doe"
        assert result["entities"][1]["type"] == "organization"
    
    @pytest.mark.asyncio
    async def test_extract_filters_by_entity_type(self, extractor, mock_llm_router):
        """Test filtering extracted entities by type."""
        mock_llm_router.generate.return_value = '''
        {
            "entities": [
                {"id": "e1", "name": "Person", "type": "person", "confidence": 0.9},
                {"id": "e2", "name": "Company", "type": "organization", "confidence": 0.9},
                {"id": "e3", "name": "Idea", "type": "concept", "confidence": 0.9}
            ],
            "relations": []
        }
        '''
        
        result = await extractor.extract_from_text(
            text="Test text",
            entity_types=["person", "organization"],
        )
        
        # Should only include person and organization
        types = [e["type"] for e in result["entities"]]
        assert "person" in types
        assert "organization" in types
        assert "concept" not in types
    
    @pytest.mark.asyncio
    async def test_extract_filters_by_confidence(self, extractor, mock_llm_router):
        """Test filtering entities by confidence threshold."""
        mock_llm_router.generate.return_value = '''
        {
            "entities": [
                {"id": "e1", "name": "High Conf", "type": "concept", "confidence": 0.9},
                {"id": "e2", "name": "Low Conf", "type": "concept", "confidence": 0.3}
            ],
            "relations": []
        }
        '''
        
        result = await extractor.extract_from_text(
            text="Test text",
            min_confidence=0.5,
        )
        
        # Should only include high confidence entity
        assert len(result["entities"]) == 1
        assert result["entities"][0]["name"] == "High Conf"
    
    @pytest.mark.asyncio
    async def test_merge_graphs(self, extractor):
        """Test merging multiple knowledge graphs."""
        graph1 = {
            "entities": [
                {"id": "e1", "name": "Entity A", "type": "concept", "confidence": 0.8}
            ],
            "relations": [],
        }
        graph2 = {
            "entities": [
                {"id": "e2", "name": "Entity B", "type": "concept", "confidence": 0.9}
            ],
            "relations": [],
        }
        
        result = await extractor.merge_graphs([graph1, graph2])
        
        assert len(result["entities"]) == 2
        assert result["metadata"]["sourceGraphCount"] == 2
    
    @pytest.mark.asyncio
    async def test_merge_graphs_deduplicates(self, extractor):
        """Test that merging deduplicates entities."""
        graph1 = {
            "entities": [
                {"id": "e1", "name": "Same Entity", "type": "concept", "confidence": 0.7}
            ],
            "relations": [],
        }
        graph2 = {
            "entities": [
                {"id": "e2", "name": "Same Entity", "type": "concept", "confidence": 0.9}
            ],
            "relations": [],
        }
        
        result = await extractor.merge_graphs([graph1, graph2], deduplicate=True)
        
        # Should only have one entity with higher confidence
        assert len(result["entities"]) == 1
        assert result["entities"][0]["confidence"] == 0.9


# =============================================================================
# Entity Types Tests
# =============================================================================

class TestEntityTypes:
    """Tests for entity and relation type definitions."""
    
    def test_entity_types_defined(self):
        """Test that all expected entity types are defined."""
        expected = ["person", "organization", "concept", "event", "location", "document", "topic"]
        
        for entity_type in expected:
            assert entity_type in ENTITY_TYPES
    
    def test_relation_types_defined(self):
        """Test that all expected relation types are defined."""
        expected = [
            "mentions", "related_to", "part_of", "caused_by", 
            "leads_to", "associated_with", "contrasts_with", 
            "supports", "opposes"
        ]
        
        for relation_type in expected:
            assert relation_type in RELATION_TYPES
