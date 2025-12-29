"""
Mind Map Generator Service

Generates hierarchical mind map structures from content using LLM.
Transforms documents into interactive visual mind maps.
"""
import json
import logging
from typing import Optional
from uuid import uuid4

from ..models.content import ProcessedContent, ContentChunk
from ..services.llm_router import LLMRouter

logger = logging.getLogger(__name__)


class MindMapNode:
    """Represents a node in the mind map."""
    
    def __init__(
        self,
        id: str,
        label: str,
        type: str = "topic",
        description: str = "",
        parent_id: Optional[str] = None,
        children: Optional[list] = None,
        metadata: Optional[dict] = None,
    ):
        self.id = id
        self.label = label
        self.type = type  # root, topic, subtopic, detail
        self.description = description
        self.parent_id = parent_id
        self.children = children or []
        self.metadata = metadata or {}
    
    def to_dict(self) -> dict:
        """Convert to dictionary format."""
        return {
            "id": self.id,
            "label": self.label,
            "type": self.type,
            "description": self.description,
            "parentId": self.parent_id,
            "childCount": len(self.children),
            "isExpanded": True,
            "metadata": self.metadata,
        }


class MindMapEdge:
    """Represents an edge in the mind map."""
    
    def __init__(
        self,
        id: str,
        source: str,
        target: str,
        label: str = "",
        style: str = "solid",
    ):
        self.id = id
        self.source = source
        self.target = target
        self.label = label
        self.style = style
    
    def to_dict(self) -> dict:
        """Convert to dictionary format."""
        return {
            "id": self.id,
            "source": self.source,
            "target": self.target,
            "label": self.label,
            "style": self.style,
        }


class MindMapGenerator:
    """
    Generates mind maps from processed content.
    
    Uses LLM to analyze content structure and create
    hierarchical topic relationships.
    """
    
    GENERATION_PROMPT = """Analyze the following content and generate a hierarchical mind map structure.

Content:
{content}

Generate a mind map with the following structure:
1. A central root node representing the main topic
2. Primary topic nodes (3-7) for main themes/sections
3. Subtopic nodes for supporting ideas under each topic
4. Detail nodes for specific facts, examples, or data points

Return the mind map as JSON with this exact structure:
{{
    "title": "Main Topic Title",
    "description": "Brief description of the content",
    "nodes": [
        {{
            "id": "unique-id",
            "label": "Node Label",
            "type": "root|topic|subtopic|detail",
            "description": "Brief description",
            "parentId": "parent-node-id or null for root"
        }}
    ]
}}

Guidelines:
- Keep labels concise (2-5 words)
- Descriptions should be 1-2 sentences max
- Ensure logical hierarchy (root -> topic -> subtopic -> detail)
- Include at least 10-20 nodes for comprehensive coverage
- All nodes except root must have a parentId

Return ONLY valid JSON, no additional text."""

    def __init__(self, llm_router: LLMRouter):
        """Initialize with LLM router."""
        self.llm_router = llm_router
    
    async def generate_from_content(
        self,
        content: ProcessedContent,
        max_depth: int = 4,
        max_nodes: int = 50,
    ) -> dict:
        """
        Generate a mind map from processed content.
        
        Args:
            content: Processed content with chunks
            max_depth: Maximum hierarchy depth
            max_nodes: Maximum number of nodes
            
        Returns:
            Mind map data structure
        """
        try:
            # Combine content chunks for analysis
            combined_text = self._prepare_content(content)
            
            # Generate mind map structure via LLM
            prompt = self.GENERATION_PROMPT.format(content=combined_text[:8000])
            
            response = await self.llm_router.generate(
                prompt=prompt,
                model="gpt-4o-mini",
                max_tokens=4000,
                temperature=0.3,
            )
            
            # Parse LLM response
            mind_map_data = self._parse_response(response)
            
            # Build node and edge structures
            nodes, edges = self._build_graph(mind_map_data, max_depth, max_nodes)
            
            return {
                "id": str(uuid4()),
                "title": mind_map_data.get("title", content.metadata.get("title", "Mind Map")),
                "description": mind_map_data.get("description", ""),
                "sourceId": content.id,
                "nodes": [n.to_dict() for n in nodes],
                "edges": [e.to_dict() for e in edges],
                "metadata": {
                    "generatedAt": content.processed_at.isoformat() if content.processed_at else None,
                    "nodeCount": len(nodes),
                    "maxDepth": max_depth,
                },
            }
            
        except Exception as e:
            logger.error(f"Mind map generation failed: {e}")
            raise
    
    async def generate_from_text(
        self,
        text: str,
        title: str = "Mind Map",
        max_depth: int = 4,
        max_nodes: int = 50,
    ) -> dict:
        """
        Generate a mind map from raw text.
        
        Args:
            text: Raw text content
            title: Title for the mind map
            max_depth: Maximum hierarchy depth
            max_nodes: Maximum number of nodes
            
        Returns:
            Mind map data structure
        """
        try:
            prompt = self.GENERATION_PROMPT.format(content=text[:8000])
            
            response = await self.llm_router.generate(
                prompt=prompt,
                model="gpt-4o-mini",
                max_tokens=4000,
                temperature=0.3,
            )
            
            mind_map_data = self._parse_response(response)
            nodes, edges = self._build_graph(mind_map_data, max_depth, max_nodes)
            
            return {
                "id": str(uuid4()),
                "title": mind_map_data.get("title", title),
                "description": mind_map_data.get("description", ""),
                "nodes": [n.to_dict() for n in nodes],
                "edges": [e.to_dict() for e in edges],
                "metadata": {
                    "nodeCount": len(nodes),
                    "maxDepth": max_depth,
                },
            }
            
        except Exception as e:
            logger.error(f"Mind map generation from text failed: {e}")
            raise
    
    def _prepare_content(self, content: ProcessedContent) -> str:
        """Prepare content text for LLM processing."""
        parts = []
        
        # Add title if available
        if content.metadata and content.metadata.get("title"):
            parts.append(f"Title: {content.metadata['title']}")
        
        # Add summary if available
        if content.metadata and content.metadata.get("summary"):
            parts.append(f"Summary: {content.metadata['summary']}")
        
        # Add chunk content
        if content.chunks:
            for chunk in content.chunks[:20]:  # Limit chunks
                parts.append(chunk.content)
        
        return "\n\n".join(parts)
    
    def _parse_response(self, response: str) -> dict:
        """Parse LLM response into mind map data."""
        try:
            # Try to extract JSON from response
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
            logger.warning(f"Failed to parse mind map JSON: {e}")
            # Return minimal structure
            return {
                "title": "Mind Map",
                "description": "",
                "nodes": [
                    {"id": "root", "label": "Main Topic", "type": "root", "parentId": None}
                ],
            }
    
    def _build_graph(
        self,
        data: dict,
        max_depth: int,
        max_nodes: int,
    ) -> tuple[list[MindMapNode], list[MindMapEdge]]:
        """Build node and edge objects from parsed data."""
        nodes = []
        edges = []
        node_map = {}
        
        raw_nodes = data.get("nodes", [])
        
        for i, node_data in enumerate(raw_nodes[:max_nodes]):
            node_id = node_data.get("id", f"node-{i}")
            parent_id = node_data.get("parentId")
            
            # Calculate depth
            depth = self._calculate_depth(node_data, raw_nodes)
            if depth > max_depth:
                continue
            
            node = MindMapNode(
                id=node_id,
                label=node_data.get("label", f"Node {i}"),
                type=node_data.get("type", "topic"),
                description=node_data.get("description", ""),
                parent_id=parent_id,
                metadata=node_data.get("metadata", {}),
            )
            
            nodes.append(node)
            node_map[node_id] = node
            
            # Create edge to parent
            if parent_id and parent_id in node_map:
                edge = MindMapEdge(
                    id=f"edge-{parent_id}-{node_id}",
                    source=parent_id,
                    target=node_id,
                )
                edges.append(edge)
                
                # Update parent's children list
                node_map[parent_id].children.append(node_id)
        
        return nodes, edges
    
    def _calculate_depth(self, node_data: dict, all_nodes: list) -> int:
        """Calculate the depth of a node in the hierarchy."""
        depth = 0
        current_parent = node_data.get("parentId")
        visited = set()
        
        while current_parent:
            if current_parent in visited:
                break  # Prevent cycles
            visited.add(current_parent)
            depth += 1
            
            # Find parent node
            parent_node = next(
                (n for n in all_nodes if n.get("id") == current_parent),
                None
            )
            if parent_node:
                current_parent = parent_node.get("parentId")
            else:
                break
        
        return depth
