'use client';

/**
 * MindMap Component
 * 
 * Main container for interactive mind map visualization using React Flow.
 * Supports hierarchical layouts, expand/collapse, and multiple export formats.
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
  addEdge,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '@/lib/utils';
import { MindMapNode } from './MindMapNode';
import { MindMapEdge } from './MindMapEdge';
import { MindMapControls } from './MindMapControls';
import { layoutMindMap, layoutRadial, type LayoutDirection } from '@/lib/visualization/layout';
import {
  getVisibleNodes,
  getVisibleEdges,
  convertToReactFlowFormat,
  exportToJson,
} from '@/lib/visualization/mind-map-utils';
import type { MindMapData, MindMapNode as MindMapNodeType, MindMapEdge as MindMapEdgeType } from './types';
import { useVisualizationStore } from '@/stores/visualization-store';

// =============================================================================
// Types
// =============================================================================

export interface MindMapProps {
  /** Mind map data to display */
  data: MindMapData;
  /** Optional CSS class name */
  className?: string;
  /** Whether the mind map is read-only */
  readOnly?: boolean;
  /** Whether to show the minimap */
  showMinimap?: boolean;
  /** Whether to show the controls panel */
  showControls?: boolean;
  /** Callback when a node is clicked */
  onNodeClick?: (node: MindMapNodeType) => void;
  /** Callback when a node is double-clicked */
  onNodeDoubleClick?: (node: MindMapNodeType) => void;
  /** Callback when export is requested */
  onExport?: (format: 'png' | 'svg' | 'pdf' | 'json', data?: string) => void;
  /** Initial layout direction */
  initialLayout?: LayoutDirection;
}

// =============================================================================
// Custom Node & Edge Types
// =============================================================================

const nodeTypes: NodeTypes = {
  mindMapNode: MindMapNode,
};

const edgeTypes: EdgeTypes = {
  mindMapEdge: MindMapEdge,
};

// =============================================================================
// Inner Component (needs ReactFlow context)
// =============================================================================

function MindMapInner({
  data,
  className,
  readOnly = false,
  showMinimap: showMinimapProp = true,
  showControls: showControlsProp = true,
  onNodeClick,
  onNodeDoubleClick,
  onExport,
  initialLayout = 'LR',
}: MindMapProps) {
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { fitView, getNodes, getEdges } = useReactFlow();

  // Store state
  const {
    expandedNodes,
    toggleNodeExpanded,
    expandAllNodes,
    collapseAllNodes,
    layoutDirection,
    layoutType,
    setLayoutDirection,
    setLayoutType,
    showMinimap: storeShowMinimap,
    showControls: storeShowControls,
    toggleMinimap,
    toggleControls,
  } = useVisualizationStore();

  // Use props if provided, otherwise use store
  const showMinimap = showMinimapProp && storeShowMinimap;
  const showControls = showControlsProp && storeShowControls;

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // ==========================================================================
  // Layout & Data Processing
  // ==========================================================================

  // Process and layout nodes/edges when data or layout changes
  useEffect(() => {
    if (!data || !data.nodes.length) return;

    // Get visible nodes based on expanded state
    const visibleNodes = getVisibleNodes(data.nodes, expandedNodes);
    const visibleEdges = getVisibleEdges(data.edges, visibleNodes);

    // Convert to React Flow format
    const { nodes: rfNodes, edges: rfEdges } = convertToReactFlowFormat(
      visibleNodes,
      visibleEdges
    );

    // Apply layout
    let layoutedElements;
    if (layoutType === 'radial') {
      layoutedElements = layoutRadial(rfNodes, rfEdges, {
        centerX: 400,
        centerY: 300,
        radiusStep: 150,
      });
    } else {
      layoutedElements = layoutMindMap(rfNodes as Node[], rfEdges as Edge[], {
        direction: layoutDirection,
        nodeSpacing: 80,
        rankSpacing: 200,
      });
    }

    setNodes(layoutedElements.nodes);
    setEdges(layoutedElements.edges);

    // Fit view after layout
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 50);
  }, [data, expandedNodes, layoutDirection, layoutType, fitView, setNodes, setEdges]);

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const mindMapNode = data.nodes.find((n) => n.id === node.id);
      if (mindMapNode) {
        onNodeClick?.(mindMapNode);
      }
    },
    [data.nodes, onNodeClick]
  );

  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Toggle expand/collapse on double click
      toggleNodeExpanded(node.id);

      const mindMapNode = data.nodes.find((n) => n.id === node.id);
      if (mindMapNode) {
        onNodeDoubleClick?.(mindMapNode);
      }
    },
    [data.nodes, onNodeDoubleClick, toggleNodeExpanded]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (readOnly) return;
      setEdges((eds) => addEdge(connection, eds));
    },
    [readOnly, setEdges]
  );

  const handleInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

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

  const handleCenter = useCallback(() => {
    // Find root node and center on it
    const rootNode = nodes.find(
      (n) => n.data?.type === 'root' || n.data?.isRoot
    );
    if (rootNode && reactFlowInstance.current) {
      reactFlowInstance.current.setCenter(
        rootNode.position.x + 100,
        rootNode.position.y + 30,
        { duration: 300, zoom: 1 }
      );
    } else {
      handleFitView();
    }
  }, [nodes, handleFitView]);

  const handleLayoutChange = useCallback(
    (direction: LayoutDirection) => {
      setLayoutDirection(direction);
    },
    [setLayoutDirection]
  );

  const handleLayoutTypeChange = useCallback(
    (type: 'dagre' | 'radial' | 'force') => {
      setLayoutType(type);
    },
    [setLayoutType]
  );

  const handleExport = useCallback(
    async (format: 'png' | 'svg' | 'pdf' | 'json') => {
      if (format === 'json') {
        const jsonData = exportToJson(data);
        onExport?.(format, jsonData);
        return;
      }

      // For image formats, we need to use the React Flow export functionality
      // This would typically be handled by the parent component
      onExport?.(format);
    },
    [data, onExport]
  );

  // ==========================================================================
  // Minimap Node Color
  // ==========================================================================

  const minimapNodeColor = useCallback((node: Node) => {
    switch (node.data?.type) {
      case 'root':
        return '#6366f1'; // indigo
      case 'topic':
        return '#3b82f6'; // blue
      case 'subtopic':
        return '#14b8a6'; // teal
      case 'detail':
        return '#6b7280'; // gray
      default:
        return '#94a3b8'; // slate
    }
  }, []);

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-full w-full bg-background rounded-lg border',
        className
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onInit={handleInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'mindMapEdge',
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--border)"
        />

        {showControls && (
          <Panel position="top-left">
            <MindMapControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onFitView={handleFitView}
              onCenter={handleCenter}
              onLayoutChange={handleLayoutChange}
              onLayoutTypeChange={handleLayoutTypeChange}
              onExport={handleExport}
              onExpandAll={expandAllNodes}
              onCollapseAll={collapseAllNodes}
              layoutDirection={layoutDirection}
              layoutType={layoutType}
            />
          </Panel>
        )}

        {showMinimap && (
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
          showInteractive={!readOnly}
          className="!bg-background !border !shadow-sm"
        />
      </ReactFlow>
    </div>
  );
}

// =============================================================================
// Main Component (with Provider)
// =============================================================================

export function MindMap(props: MindMapProps) {
  return (
    <ReactFlowProvider>
      <MindMapInner {...props} />
    </ReactFlowProvider>
  );
}

export default MindMap;
