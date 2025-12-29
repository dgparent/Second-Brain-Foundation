"""
Entity Extractor Service

Extracts named entities and their relationships from content using LLM.
Builds knowledge graph structures for visualization.
"""
import json
import logging
from typing import Optional
from uuid import uuid4

from ..models.content import ProcessedContent
from ..services.llm_router import LLMRouter

logger = logging.getLogger(__name__)


# Entity type definitions
ENTITY_TYPES = [
    "person",
    "organization", 
    "concept",
    "event",
    "location",
    "document",
    "topic",
]

# Relationship type definitions
RELATION_TYPES = [
    "mentions",
    "related_to",
    "part_of",
    "caused_by",
    "leads_to",
    "associated_with",
    "contrasts_with",
    "supports",
    "opposes",
]


class GraphEntity:
    """Represents an entity in the knowledge graph."""
    
    def __init__(
        self,
        id: str,
        name: str,
        type: str,
        description: str = "",
        properties: Optional[dict] = None,
        confidence: float = 1.0,
        importance: float = 0.5,
        source_ref: Optional[str] = None,
    ):
        self.id = id
        self.name = name
        self.type = type
        self.description = description
        self.properties = properties or {}
        self.confidence = confidence
        self.importance = importance
        self.source_ref = source_ref
    
    def to_dict(self) -> dict:
        """Convert to dictionary format."""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "description": self.description,
            "properties": self.properties,
            "confidence": self.confidence,
            "importance": self.importance,
            "sourceRef": self.source_ref,
        }


class GraphRelation:
    """Represents a relationship between entities."""
    
    def __init__(
        self,
        id: str,
        source_id: str,
        target_id: str,
        type: str,
        label: str = "",
        weight: float = 0.5,
        properties: Optional[dict] = None,
    ):
        self.id = id
        self.source_id = source_id
        self.target_id = target_id
        self.type = type
        self.label = label
        self.weight = weight
        self.properties = properties or {}
    
    def to_dict(self) -> dict:
        """Convert to dictionary format."""
        return {
            "id": self.id,
            "sourceId": self.source_id,
            "targetId": self.target_id,
            "type": self.type,
            "label": self.label,
            "weight": self.weight,
            "properties": self.properties,
        }


class EntityExtractor:
    """
    Extracts entities and relationships from content.
    
    Uses LLM to identify named entities and their relationships,
    building a knowledge graph structure.
    """
    
    EXTRACTION_PROMPT = """Analyze the following content and extract entities and their relationships.

Content:
{content}

Extract entities of these types:
- person: People, characters, authors
- organization: Companies, institutions, groups
- concept: Abstract ideas, theories, methodologies
- event: Historical events, incidents, occurrences
- location: Places, regions, addresses
- document: Books, papers, articles referenced
- topic: Subject areas, themes, categories

For relationships, identify how entities connect:
- mentions: Entity A mentions Entity B
- related_to: General relationship
- part_of: Entity A is part of Entity B
- caused_by: Entity A was caused by Entity B
- leads_to: Entity A leads to Entity B
- associated_with: Entity A is associated with Entity B
- contrasts_with: Entity A contrasts with Entity B
- supports: Entity A supports Entity B
- opposes: Entity A opposes Entity B

Return the knowledge graph as JSON with this exact structure:
{{
    "entities": [
        {{
            "id": "unique-id",
            "name": "Entity Name",
            "type": "person|organization|concept|event|location|document|topic",
            "description": "Brief description",
            "confidence": 0.0-1.0,
            "importance": 0.0-1.0,
            "properties": {{"key": "value"}}
        }}
    ],
    "relations": [
        {{
            "id": "unique-id",
            "sourceId": "entity-id-1",
            "targetId": "entity-id-2",
            "type": "relationship-type",
            "label": "Optional label",
            "weight": 0.0-1.0
        }}
    ]
}}

Guidelines:
- Extract 10-30 most important entities
- Include 15-50 meaningful relationships
- Confidence reflects certainty of extraction (1.0 = definite, 0.5 = probable)
- Importance reflects significance in the content (1.0 = central, 0.0 = peripheral)
- Weight reflects strength of relationship (1.0 = strong, 0.0 = weak)
- Ensure all relationship sourceId/targetId reference valid entity ids

Return ONLY valid JSON, no additional text."""

    def __init__(self, llm_router: LLMRouter):
        """Initialize with LLM router."""
        self.llm_router = llm_router
    
    async def extract_from_content(
        self,
        content: ProcessedContent,
        entity_types: Optional[list[str]] = None,
        min_confidence: float = 0.5,
        max_entities: int = 50,
    ) -> dict:
        """
        Extract knowledge graph from processed content.
        
        Args:
            content: Processed content with chunks
            entity_types: Types of entities to extract (None = all)
            min_confidence: Minimum confidence threshold
            max_entities: Maximum number of entities
            
        Returns:
            Knowledge graph data structure
        """
        try:
            # Combine content for analysis
            combined_text = self._prepare_content(content)
            
            # Extract entities via LLM
            prompt = self.EXTRACTION_PROMPT.format(content=combined_text[:10000])
            
            response = await self.llm_router.generate(
                prompt=prompt,
                model="gpt-4o-mini",
                max_tokens=4000,
                temperature=0.2,
            )
            
            # Parse response
            graph_data = self._parse_response(response)
            
            # Build and filter graph
            entities, relations = self._build_graph(
                graph_data,
                entity_types,
                min_confidence,
                max_entities,
            )
            
            return {
                "id": str(uuid4()),
                "title": content.metadata.get("title", "Knowledge Graph") if content.metadata else "Knowledge Graph",
                "sourceId": content.id,
                "entities": [e.to_dict() for e in entities],
                "relations": [r.to_dict() for r in relations],
                "metadata": {
                    "generatedAt": content.processed_at.isoformat() if content.processed_at else None,
                    "entityCount": len(entities),
                    "relationCount": len(relations),
                    "entityTypes": list(set(e.type for e in entities)),
                },
            }
            
        except Exception as e:
            logger.error(f"Entity extraction failed: {e}")
            raise
    
    async def extract_from_text(
        self,
        text: str,
        title: str = "Knowledge Graph",
        entity_types: Optional[list[str]] = None,
        min_confidence: float = 0.5,
        max_entities: int = 50,
    ) -> dict:
        """
        Extract knowledge graph from raw text.
        
        Args:
            text: Raw text content
            title: Title for the graph
            entity_types: Types of entities to extract
            min_confidence: Minimum confidence threshold
            max_entities: Maximum number of entities
            
        Returns:
            Knowledge graph data structure
        """
        try:
            prompt = self.EXTRACTION_PROMPT.format(content=text[:10000])
            
            response = await self.llm_router.generate(
                prompt=prompt,
                model="gpt-4o-mini",
                max_tokens=4000,
                temperature=0.2,
            )
            
            graph_data = self._parse_response(response)
            entities, relations = self._build_graph(
                graph_data,
                entity_types,
                min_confidence,
                max_entities,
            )
            
            return {
                "id": str(uuid4()),
                "title": title,
                "entities": [e.to_dict() for e in entities],
                "relations": [r.to_dict() for r in relations],
                "metadata": {
                    "entityCount": len(entities),
                    "relationCount": len(relations),
                    "entityTypes": list(set(e.type for e in entities)),
                },
            }
            
        except Exception as e:
            logger.error(f"Entity extraction from text failed: {e}")
            raise
    
    async def merge_graphs(
        self,
        graphs: list[dict],
        deduplicate: bool = True,
    ) -> dict:
        """
        Merge multiple knowledge graphs into one.
        
        Args:
            graphs: List of knowledge graph data structures
            deduplicate: Whether to merge duplicate entities
            
        Returns:
            Merged knowledge graph
        """
        all_entities = []
        all_relations = []
        entity_map = {}  # For deduplication
        
        for graph in graphs:
            for entity_data in graph.get("entities", []):
                entity_key = f"{entity_data['name'].lower()}:{entity_data['type']}"
                
                if deduplicate and entity_key in entity_map:
                    # Update existing entity with higher confidence
                    existing = entity_map[entity_key]
                    if entity_data.get("confidence", 0) > existing.confidence:
                        existing.confidence = entity_data["confidence"]
                        existing.importance = max(
                            existing.importance,
                            entity_data.get("importance", 0.5)
                        )
                else:
                    entity = GraphEntity(
                        id=entity_data["id"],
                        name=entity_data["name"],
                        type=entity_data["type"],
                        description=entity_data.get("description", ""),
                        properties=entity_data.get("properties", {}),
                        confidence=entity_data.get("confidence", 1.0),
                        importance=entity_data.get("importance", 0.5),
                    )
                    all_entities.append(entity)
                    entity_map[entity_key] = entity
            
            for relation_data in graph.get("relations", []):
                relation = GraphRelation(
                    id=relation_data["id"],
                    source_id=relation_data["sourceId"],
                    target_id=relation_data["targetId"],
                    type=relation_data["type"],
                    label=relation_data.get("label", ""),
                    weight=relation_data.get("weight", 0.5),
                )
                all_relations.append(relation)
        
        # Filter relations to only include valid entity references
        valid_entity_ids = set(e.id for e in all_entities)
        valid_relations = [
            r for r in all_relations
            if r.source_id in valid_entity_ids and r.target_id in valid_entity_ids
        ]
        
        return {
            "id": str(uuid4()),
            "title": "Merged Knowledge Graph",
            "entities": [e.to_dict() for e in all_entities],
            "relations": [r.to_dict() for r in valid_relations],
            "metadata": {
                "sourceGraphCount": len(graphs),
                "entityCount": len(all_entities),
                "relationCount": len(valid_relations),
            },
        }
    
    def _prepare_content(self, content: ProcessedContent) -> str:
        """Prepare content text for LLM processing."""
        parts = []
        
        if content.metadata:
            if content.metadata.get("title"):
                parts.append(f"Title: {content.metadata['title']}")
            if content.metadata.get("summary"):
                parts.append(f"Summary: {content.metadata['summary']}")
        
        if content.chunks:
            for chunk in content.chunks[:25]:
                parts.append(chunk.content)
        
        return "\n\n".join(parts)
    
    def _parse_response(self, response: str) -> dict:
        """Parse LLM response into graph data."""
        try:
            response = response.strip()
            
            # Handle markdown code blocks
            if response.startswith("```"):
                lines = response.split("\n")
                json_lines = []
                in_json = False
                for line in lines:
                    if line.startswith("```json"):
                        in_json = True
                        continue
                    if line.startswith("```"):
                        in_json = False
                        continue
                    if in_json:
                        json_lines.append(line)
                response = "\n".join(json_lines)
            
            return json.loads(response)
            
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse entity JSON: {e}")
            return {"entities": [], "relations": []}
    
    def _build_graph(
        self,
        data: dict,
        entity_types: Optional[list[str]],
        min_confidence: float,
        max_entities: int,
    ) -> tuple[list[GraphEntity], list[GraphRelation]]:
        """Build entity and relation objects from parsed data."""
        entities = []
        relations = []
        entity_ids = set()
        
        # Process entities
        raw_entities = data.get("entities", [])
        for entity_data in raw_entities[:max_entities * 2]:  # Buffer for filtering
            # Filter by type
            if entity_types and entity_data.get("type") not in entity_types:
                continue
            
            # Filter by confidence
            confidence = entity_data.get("confidence", 1.0)
            if confidence < min_confidence:
                continue
            
            # Validate type
            entity_type = entity_data.get("type", "concept")
            if entity_type not in ENTITY_TYPES:
                entity_type = "concept"
            
            entity = GraphEntity(
                id=entity_data.get("id", str(uuid4())),
                name=entity_data.get("name", "Unknown"),
                type=entity_type,
                description=entity_data.get("description", ""),
                properties=entity_data.get("properties", {}),
                confidence=confidence,
                importance=entity_data.get("importance", 0.5),
            )
            
            entities.append(entity)
            entity_ids.add(entity.id)
            
            if len(entities) >= max_entities:
                break
        
        # Process relations
        raw_relations = data.get("relations", [])
        for relation_data in raw_relations:
            source_id = relation_data.get("sourceId")
            target_id = relation_data.get("targetId")
            
            # Only include relations between valid entities
            if source_id not in entity_ids or target_id not in entity_ids:
                continue
            
            # Validate type
            relation_type = relation_data.get("type", "related_to")
            if relation_type not in RELATION_TYPES:
                relation_type = "related_to"
            
            relation = GraphRelation(
                id=relation_data.get("id", str(uuid4())),
                source_id=source_id,
                target_id=target_id,
                type=relation_type,
                label=relation_data.get("label", ""),
                weight=relation_data.get("weight", 0.5),
                properties=relation_data.get("properties", {}),
            )
            
            relations.append(relation)
        
        return entities, relations
