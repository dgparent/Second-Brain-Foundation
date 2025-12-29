/**
 * Visualization API Hooks
 * 
 * React Query hooks for mind map and knowledge graph generation.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  MindMapData,
  KnowledgeGraphData,
  EntityType,
} from '@/components/visualization/types';

// =============================================================================
// Types
// =============================================================================

interface GenerateMindMapRequest {
  contentId?: string;
  text?: string;
  title?: string;
  maxDepth?: number;
  maxNodes?: number;
}

interface GenerateKnowledgeGraphRequest {
  contentId?: string;
  text?: string;
  title?: string;
  entityTypes?: EntityType[];
  minConfidence?: number;
  maxEntities?: number;
}

interface MindMapResponse {
  id: string;
  title: string;
  description: string;
  sourceId?: string;
  nodes: MindMapData['nodes'];
  edges: MindMapData['edges'];
  metadata: Record<string, unknown>;
}

interface KnowledgeGraphResponse {
  id: string;
  title: string;
  sourceId?: string;
  entities: KnowledgeGraphData['entities'];
  relations: KnowledgeGraphData['relations'];
  metadata: Record<string, unknown>;
}

// =============================================================================
// API Functions
// =============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function generateMindMapApi(
  request: GenerateMindMapRequest
): Promise<MindMapResponse> {
  const response = await fetch(`${API_BASE}/visualization/mind-map`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content_id: request.contentId,
      text: request.text,
      title: request.title || 'Mind Map',
      max_depth: request.maxDepth || 4,
      max_nodes: request.maxNodes || 50,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to generate mind map');
  }

  return response.json();
}

async function getMindMapApi(id: string): Promise<MindMapResponse> {
  const response = await fetch(`${API_BASE}/visualization/mind-map/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch mind map');
  }

  return response.json();
}

async function getContentMindMapApi(
  contentId: string,
  regenerate = false
): Promise<MindMapResponse> {
  const params = new URLSearchParams();
  if (regenerate) params.set('regenerate', 'true');

  const response = await fetch(
    `${API_BASE}/visualization/content/${contentId}/mind-map?${params}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch content mind map');
  }

  return response.json();
}

async function generateKnowledgeGraphApi(
  request: GenerateKnowledgeGraphRequest
): Promise<KnowledgeGraphResponse> {
  const response = await fetch(`${API_BASE}/visualization/knowledge-graph`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content_id: request.contentId,
      text: request.text,
      title: request.title || 'Knowledge Graph',
      entity_types: request.entityTypes,
      min_confidence: request.minConfidence || 0.5,
      max_entities: request.maxEntities || 50,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to generate knowledge graph');
  }

  return response.json();
}

async function getKnowledgeGraphApi(id: string): Promise<KnowledgeGraphResponse> {
  const response = await fetch(`${API_BASE}/visualization/knowledge-graph/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch knowledge graph');
  }

  return response.json();
}

async function getContentKnowledgeGraphApi(
  contentId: string,
  entityTypes?: EntityType[],
  regenerate = false
): Promise<KnowledgeGraphResponse> {
  const params = new URLSearchParams();
  if (regenerate) params.set('regenerate', 'true');
  if (entityTypes?.length) params.set('entity_types', entityTypes.join(','));

  const response = await fetch(
    `${API_BASE}/visualization/content/${contentId}/knowledge-graph?${params}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch content knowledge graph');
  }

  return response.json();
}

// =============================================================================
// Query Keys
// =============================================================================

export const visualizationKeys = {
  all: ['visualization'] as const,
  mindMaps: () => [...visualizationKeys.all, 'mind-map'] as const,
  mindMap: (id: string) => [...visualizationKeys.mindMaps(), id] as const,
  contentMindMap: (contentId: string) =>
    [...visualizationKeys.mindMaps(), 'content', contentId] as const,
  knowledgeGraphs: () => [...visualizationKeys.all, 'knowledge-graph'] as const,
  knowledgeGraph: (id: string) =>
    [...visualizationKeys.knowledgeGraphs(), id] as const,
  contentKnowledgeGraph: (contentId: string) =>
    [...visualizationKeys.knowledgeGraphs(), 'content', contentId] as const,
};

// =============================================================================
// Mind Map Hooks
// =============================================================================

/**
 * Hook to generate a mind map from content or text.
 */
export function useGenerateMindMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateMindMapApi,
    onSuccess: (data) => {
      // Cache the generated mind map
      queryClient.setQueryData(visualizationKeys.mindMap(data.id), data);

      // If it has a source, cache under content as well
      if (data.sourceId) {
        queryClient.setQueryData(
          visualizationKeys.contentMindMap(data.sourceId),
          data
        );
      }
    },
  });
}

/**
 * Hook to fetch an existing mind map.
 */
export function useMindMap(id: string | undefined) {
  return useQuery({
    queryKey: visualizationKeys.mindMap(id!),
    queryFn: () => getMindMapApi(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to get or generate a mind map for content.
 */
export function useContentMindMap(
  contentId: string | undefined,
  options?: { regenerate?: boolean }
) {
  return useQuery({
    queryKey: visualizationKeys.contentMindMap(contentId!),
    queryFn: () => getContentMindMapApi(contentId!, options?.regenerate),
    enabled: !!contentId,
    staleTime: 1000 * 60 * 30,
  });
}

// =============================================================================
// Knowledge Graph Hooks
// =============================================================================

/**
 * Hook to generate a knowledge graph from content or text.
 */
export function useGenerateKnowledgeGraph() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateKnowledgeGraphApi,
    onSuccess: (data) => {
      queryClient.setQueryData(visualizationKeys.knowledgeGraph(data.id), data);

      if (data.sourceId) {
        queryClient.setQueryData(
          visualizationKeys.contentKnowledgeGraph(data.sourceId),
          data
        );
      }
    },
  });
}

/**
 * Hook to fetch an existing knowledge graph.
 */
export function useKnowledgeGraph(id: string | undefined) {
  return useQuery({
    queryKey: visualizationKeys.knowledgeGraph(id!),
    queryFn: () => getKnowledgeGraphApi(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Hook to get or generate a knowledge graph for content.
 */
export function useContentKnowledgeGraph(
  contentId: string | undefined,
  options?: { entityTypes?: EntityType[]; regenerate?: boolean }
) {
  return useQuery({
    queryKey: visualizationKeys.contentKnowledgeGraph(contentId!),
    queryFn: () =>
      getContentKnowledgeGraphApi(
        contentId!,
        options?.entityTypes,
        options?.regenerate
      ),
    enabled: !!contentId,
    staleTime: 1000 * 60 * 30,
  });
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Transform API response to component-compatible format.
 */
export function transformMindMapResponse(response: MindMapResponse): MindMapData {
  return {
    id: response.id,
    title: response.title,
    description: response.description,
    nodes: response.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      type: node.type as 'root' | 'topic' | 'subtopic' | 'detail',
      description: node.description,
      parentId: node.parentId,
      childCount: node.childCount || 0,
      isExpanded: node.isExpanded ?? true,
      metadata: node.metadata,
    })),
    edges: response.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      style: edge.style as 'solid' | 'dashed' | 'dotted' | undefined,
    })),
    metadata: response.metadata as Record<string, unknown>,
  };
}

/**
 * Transform API response to component-compatible format.
 */
export function transformKnowledgeGraphResponse(
  response: KnowledgeGraphResponse
): KnowledgeGraphData {
  return {
    id: response.id,
    title: response.title,
    entities: response.entities.map((entity) => ({
      id: entity.id,
      name: entity.name,
      type: entity.type as EntityType,
      description: entity.description,
      properties: entity.properties,
      confidence: entity.confidence,
      importance: entity.importance,
      sourceRef: entity.sourceRef,
    })),
    relations: response.relations.map((relation) => ({
      id: relation.id,
      sourceId: relation.sourceId,
      targetId: relation.targetId,
      type: relation.type,
      label: relation.label,
      weight: relation.weight,
      properties: relation.properties,
    })),
    metadata: response.metadata as Record<string, unknown>,
  };
}
