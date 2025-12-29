/**
 * Mind Map Layout Utilities
 * 
 * Auto-layout algorithms for mind maps and knowledge graphs using dagre.
 */
import dagre from 'dagre';
import { Node, Edge } from 'reactflow';
import {
  LayoutOptions,
  LayoutDirection,
  MindMapNodeData,
  GraphNodeData,
} from '@/components/visualization/types';

// =============================================================================
// Node Dimension Helpers
// =============================================================================

function getMindMapNodeDimensions(type: string): { width: number; height: number } {
  switch (type) {
    case 'root':
      return { width: 200, height: 60 };
    case 'topic':
      return { width: 160, height: 44 };
    case 'subtopic':
      return { width: 140, height: 36 };
    default:
      return { width: 120, height: 28 };
  }
}

function getGraphNodeDimensions(type: string): { width: number; height: number } {
  switch (type) {
    case 'person':
    case 'organization':
      return { width: 140, height: 50 };
    case 'concept':
    case 'topic':
      return { width: 160, height: 60 };
    case 'event':
      return { width: 150, height: 50 };
    case 'location':
      return { width: 130, height: 45 };
    default:
      return { width: 120, height: 40 };
  }
}

// =============================================================================
// Dagre Layout
// =============================================================================

export function layoutMindMap<T extends Node<MindMapNodeData>>(
  nodes: T[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: T[]; edges: Edge[] } {
  const {
    direction = 'LR',
    nodeSpacing = 50,
    rankSpacing = 100,
  } = options;

  if (nodes.length === 0) {
    return { nodes, edges };
  }

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to dagre
  nodes.forEach((node) => {
    const dimensions = getMindMapNodeDimensions(node.data?.type || 'detail');
    dagreGraph.setNode(node.id, dimensions);
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run layout algorithm
  dagre.layout(dagreGraph);

  // Apply positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export function layoutKnowledgeGraph<T extends Node<GraphNodeData>>(
  nodes: T[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: T[]; edges: Edge[] } {
  const {
    direction = 'TB',
    nodeSpacing = 80,
    rankSpacing = 120,
  } = options;

  if (nodes.length === 0) {
    return { nodes, edges };
  }

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: 60,
    marginy: 60,
  });

  nodes.forEach((node) => {
    const dimensions = getGraphNodeDimensions(node.data?.type || 'concept');
    dagreGraph.setNode(node.id, dimensions);
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

// =============================================================================
// Radial Layout
// =============================================================================

export function layoutRadial<T extends Node>(
  nodes: T[],
  edges: Edge[],
  centerNodeId: string,
  radiusStep: number = 200
): { nodes: T[]; edges: Edge[] } {
  const centerNode = nodes.find((n) => n.id === centerNodeId);
  if (!centerNode || nodes.length === 0) {
    return { nodes, edges };
  }

  const levels = buildLevelMap(nodes, edges, centerNodeId);
  const layoutedNodes: T[] = [];

  // Place center node
  layoutedNodes.push({
    ...centerNode,
    position: { x: 0, y: 0 },
  });

  // Place nodes in concentric circles
  levels.forEach((levelNodes, level) => {
    if (level === 0) return;

    const radius = level * radiusStep;
    const angleStep = (2 * Math.PI) / levelNodes.length;

    levelNodes.forEach((node, i) => {
      const angle = i * angleStep - Math.PI / 2;
      layoutedNodes.push({
        ...node,
        position: {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        },
      });
    });
  });

  return { nodes: layoutedNodes, edges };
}

function buildLevelMap<T extends Node>(
  nodes: T[],
  edges: Edge[],
  rootId: string
): Map<number, T[]> {
  const levels = new Map<number, T[]>();
  const visited = new Set<string>();
  const queue: { nodeId: string; level: number }[] = [{ nodeId: rootId, level: 0 }];

  while (queue.length > 0) {
    const { nodeId, level } = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      if (!levels.has(level)) levels.set(level, []);
      levels.get(level)!.push(node);
    }

    // Find children (nodes connected via edges where this node is source)
    edges
      .filter((e) => e.source === nodeId)
      .forEach((e) => {
        if (!visited.has(e.target)) {
          queue.push({ nodeId: e.target, level: level + 1 });
        }
      });
  }

  // Add any unvisited nodes to the outermost level
  const maxLevel = Math.max(...levels.keys(), 0);
  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      if (!levels.has(maxLevel + 1)) levels.set(maxLevel + 1, []);
      levels.get(maxLevel + 1)!.push(node);
    }
  });

  return levels;
}

// =============================================================================
// Force-Directed Layout
// =============================================================================

interface ForceNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function layoutForceDirected<T extends Node>(
  nodes: T[],
  edges: Edge[],
  options: {
    strength?: number;
    distance?: number;
    iterations?: number;
    width?: number;
    height?: number;
  } = {}
): { nodes: T[]; edges: Edge[] } {
  const {
    strength = -300,
    distance = 100,
    iterations = 300,
    width = 800,
    height = 600,
  } = options;

  if (nodes.length === 0) {
    return { nodes, edges };
  }

  // Initialize positions randomly
  const forceNodes: ForceNode[] = nodes.map((node, i) => ({
    id: node.id,
    x: Math.cos((2 * Math.PI * i) / nodes.length) * 100 + width / 2,
    y: Math.sin((2 * Math.PI * i) / nodes.length) * 100 + height / 2,
    vx: 0,
    vy: 0,
  }));

  const nodeMap = new Map(forceNodes.map((n) => [n.id, n]));

  // Run force simulation
  for (let i = 0; i < iterations; i++) {
    const alpha = 1 - i / iterations;

    // Apply repulsion between all nodes
    for (let j = 0; j < forceNodes.length; j++) {
      for (let k = j + 1; k < forceNodes.length; k++) {
        const a = forceNodes[j];
        const b = forceNodes[k];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (strength * alpha) / (dist * dist);

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Apply attraction along edges
    edges.forEach((edge) => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) return;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = ((dist - distance) * alpha * 0.1);

      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    });

    // Apply velocities with damping
    forceNodes.forEach((node) => {
      node.x += node.vx * 0.1;
      node.y += node.vy * 0.1;
      node.vx *= 0.9;
      node.vy *= 0.9;

      // Keep within bounds
      node.x = Math.max(50, Math.min(width - 50, node.x));
      node.y = Math.max(50, Math.min(height - 50, node.y));
    });
  }

  // Apply final positions
  const layoutedNodes = nodes.map((node) => {
    const forceNode = nodeMap.get(node.id)!;
    return {
      ...node,
      position: {
        x: forceNode.x - 60,
        y: forceNode.y - 25,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

// =============================================================================
// Utility Functions
// =============================================================================

export function getLayoutedElements<T extends Node>(
  nodes: T[],
  edges: Edge[],
  layoutType: 'dagre' | 'radial' | 'force' = 'dagre',
  options?: LayoutOptions & { centerNodeId?: string }
): { nodes: T[]; edges: Edge[] } {
  switch (layoutType) {
    case 'radial':
      const rootId = options?.centerNodeId || nodes[0]?.id;
      return layoutRadial(nodes, edges, rootId);
    case 'force':
      return layoutForceDirected(nodes, edges);
    default:
      return layoutMindMap(nodes, edges, options);
  }
}

export function calculateViewportCenter(
  nodes: Node[]
): { x: number; y: number } {
  if (nodes.length === 0) return { x: 0, y: 0 };

  const sumX = nodes.reduce((sum, n) => sum + (n.position?.x || 0), 0);
  const sumY = nodes.reduce((sum, n) => sum + (n.position?.y || 0), 0);

  return {
    x: sumX / nodes.length,
    y: sumY / nodes.length,
  };
}
