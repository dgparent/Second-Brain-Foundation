/**
 * Mind Map Utilities
 * 
 * Helper functions for mind map operations.
 */
import type {
  MindMapNode,
  MindMapEdge,
  MindMapData,
  MindMapNodeData,
  MindMapNodeType,
} from '@/components/visualization/types';

// =============================================================================
// Node Creation
// =============================================================================

let nodeCounter = 0;

export function createMindMapNode(
  label: string,
  type: MindMapNodeType = 'detail',
  parentId?: string,
  options: Partial<MindMapNodeData> = {}
): MindMapNode {
  const id = `node_${++nodeCounter}_${Date.now()}`;
  
  return {
    id,
    type: 'mindMapNode',
    position: { x: 0, y: 0 },
    data: {
      label,
      type,
      isExpanded: type === 'root' || type === 'topic',
      childCount: 0,
      ...options,
    },
  };
}

export function createMindMapEdge(
  sourceId: string,
  targetId: string,
  options: Partial<MindMapEdge> = {}
): MindMapEdge {
  return {
    id: `edge_${sourceId}_${targetId}`,
    source: sourceId,
    target: targetId,
    type: 'mindMapEdge',
    ...options,
  };
}

// =============================================================================
// Node Hierarchy
// =============================================================================

export function getNodeChildren(
  nodeId: string,
  edges: MindMapEdge[]
): string[] {
  return edges
    .filter((edge) => edge.source === nodeId)
    .map((edge) => edge.target);
}

export function getNodeParent(
  nodeId: string,
  edges: MindMapEdge[]
): string | null {
  const parentEdge = edges.find((edge) => edge.target === nodeId);
  return parentEdge?.source || null;
}

export function getNodeDescendants(
  nodeId: string,
  edges: MindMapEdge[]
): string[] {
  const descendants: string[] = [];
  const queue = [nodeId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const children = getNodeChildren(currentId, edges);
    descendants.push(...children);
    queue.push(...children);
  }

  return descendants;
}

export function getNodeAncestors(
  nodeId: string,
  edges: MindMapEdge[]
): string[] {
  const ancestors: string[] = [];
  let currentId: string | null = nodeId;

  while (currentId) {
    const parentId = getNodeParent(currentId, edges);
    if (parentId) {
      ancestors.push(parentId);
    }
    currentId = parentId;
  }

  return ancestors;
}

export function getRootNode(
  nodes: MindMapNode[]
): MindMapNode | null {
  return nodes.find((node) => node.data.type === 'root') || null;
}

// =============================================================================
// Node Manipulation
// =============================================================================

export function updateNodeChildCount(
  nodes: MindMapNode[],
  edges: MindMapEdge[]
): MindMapNode[] {
  return nodes.map((node) => {
    const childCount = getNodeChildren(node.id, edges).length;
    return {
      ...node,
      data: {
        ...node.data,
        childCount,
      },
    };
  });
}

export function toggleNodeExpanded(
  nodeId: string,
  nodes: MindMapNode[]
): MindMapNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return {
        ...node,
        data: {
          ...node.data,
          isExpanded: !node.data.isExpanded,
        },
      };
    }
    return node;
  });
}

export function expandNode(
  nodeId: string,
  nodes: MindMapNode[]
): MindMapNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return {
        ...node,
        data: {
          ...node.data,
          isExpanded: true,
        },
      };
    }
    return node;
  });
}

export function collapseNode(
  nodeId: string,
  nodes: MindMapNode[]
): MindMapNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return {
        ...node,
        data: {
          ...node.data,
          isExpanded: false,
        },
      };
    }
    return node;
  });
}

// =============================================================================
// Visibility
// =============================================================================

export function getVisibleNodes(
  nodes: MindMapNode[],
  edges: MindMapEdge[],
  expandedNodes: Set<string>
): MindMapNode[] {
  const rootNode = getRootNode(nodes);
  if (!rootNode) return nodes;

  const visibleIds = new Set<string>();
  const queue = [rootNode.id];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    visibleIds.add(currentId);

    // If node is expanded, add its children to queue
    if (expandedNodes.has(currentId)) {
      const children = getNodeChildren(currentId, edges);
      queue.push(...children);
    }
  }

  return nodes.filter((node) => visibleIds.has(node.id));
}

export function getVisibleEdges(
  edges: MindMapEdge[],
  visibleNodeIds: Set<string>
): MindMapEdge[] {
  return edges.filter(
    (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  );
}

// =============================================================================
// Data Conversion
// =============================================================================

export interface RawMindMapNode {
  id: string;
  label: string;
  type: MindMapNodeType;
  parentId?: string | null;
  description?: string;
}

export function convertToReactFlowFormat(
  rawNodes: RawMindMapNode[]
): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  const nodes: MindMapNode[] = rawNodes.map((raw) => ({
    id: raw.id,
    type: 'mindMapNode',
    position: { x: 0, y: 0 },
    data: {
      label: raw.label,
      type: raw.type,
      description: raw.description,
      isExpanded: raw.type === 'root' || raw.type === 'topic',
      childCount: 0,
    },
  }));

  const edges: MindMapEdge[] = rawNodes
    .filter((raw) => raw.parentId)
    .map((raw) => ({
      id: `edge_${raw.parentId}_${raw.id}`,
      source: raw.parentId!,
      target: raw.id,
      type: 'mindMapEdge',
    }));

  // Update child counts
  const nodesWithCounts = updateNodeChildCount(nodes, edges);

  return { nodes: nodesWithCounts, edges };
}

export function exportToJson(data: MindMapData): string {
  return JSON.stringify(data, null, 2);
}

// =============================================================================
// Node Colors
// =============================================================================

export const NODE_COLORS: Record<MindMapNodeType, {
  bg: string;
  text: string;
  border: string;
}> = {
  root: {
    bg: 'bg-indigo-600',
    text: 'text-white',
    border: 'border-indigo-700',
  },
  topic: {
    bg: 'bg-blue-500',
    text: 'text-white',
    border: 'border-blue-600',
  },
  subtopic: {
    bg: 'bg-teal-400',
    text: 'text-white',
    border: 'border-teal-500',
  },
  detail: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
  },
};

export const NODE_SIZES: Record<MindMapNodeType, string> = {
  root: 'px-6 py-3 text-lg font-bold',
  topic: 'px-4 py-2 text-base font-semibold',
  subtopic: 'px-3 py-1.5 text-sm font-medium',
  detail: 'px-2 py-1 text-xs',
};

// =============================================================================
// Validation
// =============================================================================

export function validateMindMapData(data: unknown): data is MindMapData {
  if (!data || typeof data !== 'object') return false;
  
  const d = data as Record<string, unknown>;
  
  return (
    typeof d.id === 'string' &&
    typeof d.title === 'string' &&
    Array.isArray(d.nodes) &&
    Array.isArray(d.edges)
  );
}

export function findCycles(
  edges: MindMapEdge[]
): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  const adjacency = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (!adjacency.has(edge.source)) {
      adjacency.set(edge.source, []);
    }
    adjacency.get(edge.source)!.push(edge.target);
  });

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        // Found cycle
        const cycleStart = path.indexOf(neighbor);
        cycles.push(path.slice(cycleStart));
        return true;
      }
    }

    path.pop();
    recursionStack.delete(nodeId);
    return false;
  }

  // Get all unique node IDs
  const nodeIds = new Set<string>();
  edges.forEach((edge) => {
    nodeIds.add(edge.source);
    nodeIds.add(edge.target);
  });

  nodeIds.forEach((nodeId) => {
    if (!visited.has(nodeId)) {
      dfs(nodeId);
    }
  });

  return cycles;
}
