/**
 * Visualization Store
 * 
 * Zustand store for mind map and knowledge graph state.
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  MindMapData,
  KnowledgeGraphData,
  EntityType,
  LayoutDirection,
} from '@/components/visualization/types';

// =============================================================================
// Types
// =============================================================================

interface VisualizationState {
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
  layoutType: 'dagre' | 'radial' | 'force';
  showMinimap: boolean;
  showControls: boolean;
}

interface VisualizationActions {
  // Mind map actions
  setCurrentMindMap: (map: MindMapData | null) => void;
  addMindMap: (map: MindMapData) => void;
  removeMindMap: (id: string) => void;
  toggleNodeExpanded: (nodeId: string) => void;
  expandAllNodes: () => void;
  collapseAllNodes: () => void;
  setExpandedNodes: (nodes: Set<string>) => void;

  // Knowledge graph actions
  setCurrentGraph: (graph: KnowledgeGraphData | null) => void;
  addGraph: (graph: KnowledgeGraphData) => void;
  removeGraph: (id: string) => void;
  setSelectedEntity: (entityId: string | null) => void;
  toggleEntityTypeFilter: (type: EntityType) => void;
  setEntityTypeFilter: (types: EntityType[]) => void;
  clearEntityTypeFilter: () => void;

  // Common actions
  setSelectedNode: (nodeId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLayoutDirection: (direction: LayoutDirection) => void;
  setLayoutType: (type: 'dagre' | 'radial' | 'force') => void;
  toggleMinimap: () => void;
  toggleControls: () => void;

  // Reset
  reset: () => void;
}

// =============================================================================
// Initial State
// =============================================================================

const initialState: VisualizationState = {
  currentMindMap: null,
  mindMaps: [],
  expandedNodes: new Set<string>(),

  currentGraph: null,
  graphs: [],
  selectedEntity: null,
  entityTypeFilter: [],

  selectedNode: null,
  isLoading: false,
  error: null,
  layoutDirection: 'LR',
  layoutType: 'dagre',
  showMinimap: true,
  showControls: true,
};

// =============================================================================
// Store
// =============================================================================

export const useVisualizationStore = create<VisualizationState & VisualizationActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Mind map actions
        setCurrentMindMap: (map) => set({ currentMindMap: map }),

        addMindMap: (map) =>
          set((state) => ({
            mindMaps: [...state.mindMaps.filter((m) => m.id !== map.id), map],
          })),

        removeMindMap: (id) =>
          set((state) => ({
            mindMaps: state.mindMaps.filter((m) => m.id !== id),
            currentMindMap:
              state.currentMindMap?.id === id ? null : state.currentMindMap,
          })),

        toggleNodeExpanded: (nodeId) =>
          set((state) => {
            const newExpanded = new Set(state.expandedNodes);
            if (newExpanded.has(nodeId)) {
              newExpanded.delete(nodeId);
            } else {
              newExpanded.add(nodeId);
            }
            return { expandedNodes: newExpanded };
          }),

        expandAllNodes: () =>
          set((state) => {
            if (!state.currentMindMap) return state;
            const allNodeIds = new Set(
              state.currentMindMap.nodes.map((n) => n.id)
            );
            return { expandedNodes: allNodeIds };
          }),

        collapseAllNodes: () => set({ expandedNodes: new Set<string>() }),

        setExpandedNodes: (nodes) => set({ expandedNodes: nodes }),

        // Knowledge graph actions
        setCurrentGraph: (graph) => set({ currentGraph: graph }),

        addGraph: (graph) =>
          set((state) => ({
            graphs: [...state.graphs.filter((g) => g.id !== graph.id), graph],
          })),

        removeGraph: (id) =>
          set((state) => ({
            graphs: state.graphs.filter((g) => g.id !== id),
            currentGraph:
              state.currentGraph?.id === id ? null : state.currentGraph,
          })),

        setSelectedEntity: (entityId) => set({ selectedEntity: entityId }),

        toggleEntityTypeFilter: (type) =>
          set((state) => {
            const newFilter = state.entityTypeFilter.includes(type)
              ? state.entityTypeFilter.filter((t) => t !== type)
              : [...state.entityTypeFilter, type];
            return { entityTypeFilter: newFilter };
          }),

        setEntityTypeFilter: (types) => set({ entityTypeFilter: types }),

        clearEntityTypeFilter: () => set({ entityTypeFilter: [] }),

        // Common actions
        setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        setLayoutDirection: (direction) => set({ layoutDirection: direction }),

        setLayoutType: (type) => set({ layoutType: type }),

        toggleMinimap: () =>
          set((state) => ({ showMinimap: !state.showMinimap })),

        toggleControls: () =>
          set((state) => ({ showControls: !state.showControls })),

        // Reset
        reset: () => set(initialState),
      }),
      {
        name: 'visualization-store',
        partialize: (state) => ({
          layoutDirection: state.layoutDirection,
          layoutType: state.layoutType,
          showMinimap: state.showMinimap,
          showControls: state.showControls,
          entityTypeFilter: state.entityTypeFilter,
        }),
      }
    ),
    { name: 'VisualizationStore' }
  )
);

// =============================================================================
// Selectors
// =============================================================================

export const selectCurrentMindMap = (state: VisualizationState) =>
  state.currentMindMap;

export const selectCurrentGraph = (state: VisualizationState) =>
  state.currentGraph;

export const selectExpandedNodes = (state: VisualizationState) =>
  state.expandedNodes;

export const selectEntityTypeFilter = (state: VisualizationState) =>
  state.entityTypeFilter;

export const selectIsLoading = (state: VisualizationState) => state.isLoading;

export const selectError = (state: VisualizationState) => state.error;

export default useVisualizationStore;
