/**
 * Visualization Types
 * 
 * Type definitions for mind maps and knowledge graphs.
 */
import { Node, Edge } from 'reactflow';

// =============================================================================
// Mind Map Types
// =============================================================================

export type MindMapNodeType = 'root' | 'topic' | 'subtopic' | 'detail';

export interface MindMapNodeData {
  label: string;
  type: MindMapNodeType;
  color?: string;
  icon?: string;
  description?: string;
  sourceId?: string;
  isExpanded?: boolean;
  childCount?: number;
}

export interface MindMapEdgeData {
  style?: 'solid' | 'dashed' | 'dotted';
  strength?: number;
  label?: string;
}

export type MindMapNode = Node<MindMapNodeData>;
export type MindMapEdge = Edge<MindMapEdgeData>;

export interface MindMapData {
  id: string;
  title: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  createdAt: Date;
  updatedAt?: Date;
  sourceIds: string[];
  notebookId?: string;
}

// =============================================================================
// Knowledge Graph Types
// =============================================================================

export type EntityType =
  | 'person'
  | 'organization'
  | 'concept'
  | 'event'
  | 'location'
  | 'document'
  | 'topic';

export interface GraphEntity {
  id: string;
  label: string;
  type: EntityType;
  description?: string;
  properties?: Record<string, unknown>;
  sourceIds?: string[];
}

export interface GraphRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: string; // 'mentions', 'related_to', 'authored_by', etc.
  weight?: number;
  label?: string;
}

export interface GraphNodeData {
  label: string;
  type: EntityType;
  description?: string;
  properties?: Record<string, unknown>;
  sourceIds?: string[];
  isSelected?: boolean;
}

export interface GraphEdgeData {
  type: string;
  label?: string;
  weight?: number;
}

export type GraphNode = Node<GraphNodeData>;
export type GraphEdge = Edge<GraphEdgeData>;

export interface KnowledgeGraphData {
  id: string;
  title: string;
  entities: GraphEntity[];
  relations: GraphRelation[];
  sourceIds: string[];
  createdAt: Date;
  updatedAt?: Date;
}

// =============================================================================
// Layout Types
// =============================================================================

export type LayoutDirection = 'LR' | 'TB' | 'RL' | 'BT';

export interface LayoutOptions {
  direction?: LayoutDirection;
  nodeSpacing?: number;
  rankSpacing?: number;
}

export interface RadialLayoutOptions {
  centerNodeId: string;
  radiusStep?: number;
}

export interface ForceLayoutOptions {
  strength?: number;
  distance?: number;
  iterations?: number;
}

// =============================================================================
// Export Types
// =============================================================================

export type ExportFormat = 'png' | 'svg' | 'pdf' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  scale?: number;
  backgroundColor?: string;
  includeTitle?: boolean;
}

// =============================================================================
// Store Types
// =============================================================================

export interface VisualizationState {
  // Mind map state
  currentMindMap: MindMapData | null;
  mindMaps: MindMapData[];
  expandedNodes: Set<string>;
  
  // Knowledge graph state
  currentGraph: KnowledgeGraphData | null;
  graphs: KnowledgeGraphData[];
  selectedEntity: string | null;
  entityTypeFilter: EntityType[];
  
  // Common state
  selectedNode: string | null;
  isLoading: boolean;
  error: string | null;
  layoutDirection: LayoutDirection;
  showMinimap: boolean;
  showControls: boolean;
}

// =============================================================================
// API Types
// =============================================================================

export interface GenerateMindMapRequest {
  notebookId: string;
  sourceIds: string[];
  title?: string;
}

export interface GenerateGraphRequest {
  notebookId: string;
  sourceIds: string[];
  title?: string;
  mergeEntities?: boolean;
}

export interface MindMapResponse {
  id: string;
  title: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  sourceIds: string[];
  createdAt: string;
}

export interface GraphResponse {
  id: string;
  title: string;
  entities: GraphEntity[];
  relations: GraphRelation[];
  sourceIds: string[];
  createdAt: string;
}
