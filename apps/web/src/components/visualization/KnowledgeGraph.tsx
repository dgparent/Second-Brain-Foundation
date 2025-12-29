'use client';

/**
 * KnowledgeGraph Component
 * 
 * Main container for interactive knowledge graph visualization.
 * Displays entities and their relationships with filtering and detail view.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  NodeTypes,
  EdgeTypes,
  ReactFlowInstance,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '@/lib/utils';
import { GraphNode } from './GraphNode';
import { GraphEdge } from './GraphEdge';
import { GraphControls } from './GraphControls';
import { EntityDetailPanel } from './EntityDetailPanel';
import {
  layoutKnowledgeGraph,
  layoutRadial,
  layoutForceDirected,
} from '@/lib/visualization/layout';
import { useVisualizationStore } from '@/stores/visualization-store';
import type {
  KnowledgeGraphData,
  GraphEntity,
  GraphRelation,
  EntityType,
  GraphNodeData,
  GraphEdgeData,
} from './types';

// =============================================================================
// Types
// =============================================================================

export interface KnowledgeGraphProps {
  /** Knowledge graph data to display */
  data: KnowledgeGraphData;
  /** Optional CSS class name */
  className?: string;
  /** Whether to show the detail panel */
  showDetailPanel?: boolean;
  /** Whether to show the minimap */
  showMinimap?: boolean;
  /** Whether to show controls */
  showControls?: boolean;
  /** Callback when an entity is clicked */
  onEntityClick?: (entity: GraphEntity) => void;
  /** Callback when export is requested */
  onExport?: (format: 'png' | 'svg' | 'json', data?: string) => void;
  /** Callback to refresh data */
  onRefresh?: () => void;
}

// =============================================================================
// Custom Node & Edge Types
// =============================================================================

const nodeTypes: NodeTypes = {
  graphNode: GraphNode,
};

const edgeTypes: EdgeTypes = {
  graphEdge: GraphEdge,
};

// =============================================================================
// Helper Functions
// =============================================================================

function convertToReactFlow(
  entities: GraphEntity[],
  relations: GraphRelation[],
  entityFilter: EntityType[]
): { nodes: Node<GraphNodeData>[]; edges: Edge<GraphEdgeData>[] } {
  // Filter entities by type
  const filteredEntities =
    entityFilter.length === 0
      ? entities
      : entities.filter((e) => entityFilter.includes(e.type));

  const entityIds = new Set(filteredEntities.map((e) => e.id));

  // Convert entities to nodes
  const nodes: Node<GraphNodeData>[] = filteredEntities.map((entity) => {
    // Count relationships for this entity
    const relationshipCount = relations.filter(
      (r) =>
        (r.sourceId === entity.id && entityIds.has(r.targetId)) ||
        (r.targetId === entity.id && entityIds.has(r.sourceId))
    ).length;

    return {
      id: entity.id,
      type: 'graphNode',
      position: { x: 0, y: 0 }, // Will be set by layout
      data: {
        label: entity.name,
        entityType: entity.type,
        description: entity.description,
        properties: entity.properties,
        confidence: entity.confidence,
        importance: entity.importance,
        relationshipCount,
      },
    };
  });

  // Convert relations to edges (only for visible entities)
  const edges: Edge<GraphEdgeData>[] = relations
    .filter((r) => entityIds.has(r.sourceId) && entityIds.has(r.targetId))
    .map((relation) => ({
      id: relation.id,
      source: relation.sourceId,
      target: relation.targetId,
      type: 'graphEdge',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
      },
      data: {
        label: relation.label,
        relationType: relation.type,
        weight: relation.weight,
        isDirectional: true,
      },
    }));

  return { nodes, edges };
}

// =============================================================================
// Inner Component (needs ReactFlow context)
// =============================================================================

function KnowledgeGraphInner({
  data,
  className,
  showDetailPanel: showDetailPanelProp = true,
  showMinimap: showMinimapProp = true,
  showControls: showControlsProp = true,
  onEntityClick,
  onExport,
  onRefresh,
}: KnowledgeGraphProps) {
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  // Store state
  const {
    selectedEntity,
    setSelectedEntity,
    entityTypeFilter,
    setEntityTypeFilter,
    layoutType,
    setLayoutType,
  } = useVisualizationStore();

  // Local state
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Get selected entity data
  const selectedEntityData = useMemo(() => {
    if (!selectedEntity) return null;
    return data.entities.find((e) => e.id === selectedEntity) || null;
  }, [selectedEntity, data.entities]);

  // ==========================================================================
  // Layout & Data Processing
  // ==========================================================================

  useEffect(() => {
    if (!data || !data.entities.length) return;

    // Convert to React Flow format
    const { nodes: rfNodes, edges: rfEdges } = convertToReactFlow(
      data.entities,
      data.relations,
      entityTypeFilter
    );

    // Apply layout
    let layoutedElements;
    switch (layoutType) {
      case 'radial':
        layoutedElements = layoutRadial(rfNodes, rfEdges, {
          centerX: 400,
          centerY: 400,
          radiusStep: 200,
        });
        break;
      case 'force':
        layoutedElements = layoutForceDirected(rfNodes, rfEdges, {
          iterations: 100,
          strength: 0.5,
          distance: 150,
        });
        break;
      default:
        layoutedElements = layoutKnowledgeGraph(rfNodes as Node[], rfEdges as Edge[], {
          direction: 'TB',
          nodeSpacing: 100,
          rankSpacing: 150,
        });
    }

    setNodes(layoutedElements.nodes);
    setEdges(layoutedElements.edges);

    // Fit view after layout
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 50);
  }, [data, entityTypeFilter, layoutType, fitView, setNodes, setEdges]);

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedEntity(node.id);
      setShowDetailPanel(true);

      const entity = data.entities.find((e) => e.id === node.id);
      if (entity) {
        onEntityClick?.(entity);
      }
    },
    [data.entities, onEntityClick, setSelectedEntity]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedEntity(null);
    setShowDetailPanel(false);
  }, [setSelectedEntity]);

  const handleInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  const handleCloseDetailPanel = useCallback(() => {
    setShowDetailPanel(false);
    setSelectedEntity(null);
  }, [setSelectedEntity]);

  const handleEntityClickInPanel = useCallback(
    (entityId: string) => {
      setSelectedEntity(entityId);

      // Center on the selected node
      const node = nodes.find((n) => n.id === entityId);
      if (node && reactFlowInstance.current) {
        reactFlowInstance.current.setCenter(
          node.position.x + 50,
          node.position.y + 50,
          { duration: 500, zoom: 1 }
        );
      }
    },
    [nodes, setSelectedEntity]
  );

  // ==========================================================================
  // Control Handlers
  // ==========================================================================

  const handleZoomIn = useCallback(() => {
    reactFlowInstance.current?.zoomIn({ duration: 200 });
  }, []);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance.current?.zoomOut({ duration: 200 });
  }, []);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  const handleRecenter = useCallback(() => {
    handleFitView();
  }, [handleFitView]);

  const handleLayoutChange = useCallback(
    (layout: 'dagre' | 'radial' | 'force') => {
      setLayoutType(layout);
    },
    [setLayoutType]
  );

  const handleFilterChange = useCallback(
    (types: EntityType[]) => {
      setEntityTypeFilter(types);
    },
    [setEntityTypeFilter]
  );

  const handleExport = useCallback(
    (format: 'png' | 'svg' | 'json') => {
      if (format === 'json') {
        const jsonData = JSON.stringify(data, null, 2);
        onExport?.(format, jsonData);
        return;
      }
      onExport?.(format);
    },
    [data, onExport]
  );

  // ==========================================================================
  // Minimap Node Color
  // ==========================================================================

  const minimapNodeColor = useCallback((node: Node) => {
    const entityType = node.data?.entityType;
    switch (entityType) {
      case 'person':
        return '#3b82f6'; // blue
      case 'organization':
        return '#8b5cf6'; // violet
      case 'concept':
        return '#f59e0b'; // amber
      case 'event':
        return '#22c55e'; // green
      case 'location':
        return '#ef4444'; // red
      case 'document':
        return '#64748b'; // slate
      case 'topic':
        return '#14b8a6'; // teal
      default:
        return '#94a3b8'; // gray
    }
  }, []);

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div ref={containerRef} className={cn('relative h-full w-full flex', className)}>
      {/* Main graph area */}
      <div
        className={cn(
          'flex-1 bg-background rounded-lg border transition-all duration-300',
          showDetailPanel && showDetailPanelProp && 'mr-80'
        )}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          onInit={handleInit}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'graphEdge',
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="var(--border)"
          />

          {showControlsProp && (
            <Panel position="top-left">
              <GraphControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onFitView={handleFitView}
                onRecenter={handleRecenter}
                onLayoutChange={handleLayoutChange}
                onExport={handleExport}
                onFilterChange={handleFilterChange}
                onRefresh={onRefresh}
                currentLayout={layoutType}
                activeFilters={entityTypeFilter}
              />
            </Panel>
          )}

          {showMinimapProp && (
            <MiniMap
              nodeColor={minimapNodeColor}
              nodeStrokeWidth={3}
              pannable
              zoomable
              className="!bg-muted/50 rounded-lg border"
            />
          )}

          <Controls
            showZoom={false}
            showFitView={false}
            showInteractive
            className="!bg-background !border !shadow-sm"
          />
        </ReactFlow>
      </div>

      {/* Detail panel */}
      {showDetailPanelProp && showDetailPanel && selectedEntityData && (
        <div className="absolute right-0 top-0 bottom-0 w-80">
          <EntityDetailPanel
            entity={selectedEntityData}
            relations={data.relations}
            allEntities={data.entities}
            onClose={handleCloseDetailPanel}
            onEntityClick={handleEntityClickInPanel}
          />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Component (with Provider)
// =============================================================================

export function KnowledgeGraph(props: KnowledgeGraphProps) {
  return (
    <ReactFlowProvider>
      <KnowledgeGraphInner {...props} />
    </ReactFlowProvider>
  );
}

export default KnowledgeGraph;
