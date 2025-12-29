/**
 * Visualization Component Tests
 * 
 * Tests for mind map and knowledge graph components.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactFlowProvider } from 'reactflow';

// Mock ReactFlow to avoid canvas issues in tests
vi.mock('reactflow', async () => {
  const actual = await vi.importActual('reactflow');
  return {
    ...actual,
    ReactFlow: vi.fn(({ children }) => (
      <div data-testid="react-flow">{children}</div>
    )),
    MiniMap: vi.fn(() => <div data-testid="minimap" />),
    Controls: vi.fn(() => <div data-testid="controls" />),
    Background: vi.fn(() => <div data-testid="background" />),
    Panel: vi.fn(({ children }) => <div data-testid="panel">{children}</div>),
    useReactFlow: vi.fn(() => ({
      fitView: vi.fn(),
      setCenter: vi.fn(),
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
    })),
    useNodesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
    useEdgesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
  };
});

// Import components after mocking
import { MindMapNode } from '@/components/visualization/MindMapNode';
import { MindMapEdge } from '@/components/visualization/MindMapEdge';
import { MindMapControls } from '@/components/visualization/MindMapControls';
import { GraphNode } from '@/components/visualization/GraphNode';
import { GraphEdge } from '@/components/visualization/GraphEdge';
import { GraphControls } from '@/components/visualization/GraphControls';
import { EntityDetailPanel } from '@/components/visualization/EntityDetailPanel';
import type { MindMapNodeData, GraphNodeData, GraphEntity, GraphRelation } from '@/components/visualization/types';

// =============================================================================
// MindMapNode Tests
// =============================================================================

describe('MindMapNode', () => {
  const defaultNodeProps = {
    id: 'test-node',
    type: 'mindMapNode',
    selected: false,
    zIndex: 1,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false,
  };

  it('renders root node correctly', () => {
    const data: MindMapNodeData = {
      label: 'Root Topic',
      type: 'root',
      description: 'Main topic',
      childCount: 3,
      isExpanded: true,
    };

    render(
      <ReactFlowProvider>
        <svg>
          <MindMapNode {...defaultNodeProps} data={data} />
        </svg>
      </ReactFlowProvider>
    );

    expect(screen.getByText('Root Topic')).toBeInTheDocument();
  });

  it('renders topic node correctly', () => {
    const data: MindMapNodeData = {
      label: 'Sub Topic',
      type: 'topic',
      description: 'Supporting topic',
      childCount: 2,
      isExpanded: true,
      parentId: 'root',
    };

    render(
      <ReactFlowProvider>
        <svg>
          <MindMapNode {...defaultNodeProps} data={data} />
        </svg>
      </ReactFlowProvider>
    );

    expect(screen.getByText('Sub Topic')).toBeInTheDocument();
  });

  it('shows child count badge when collapsed', () => {
    const data: MindMapNodeData = {
      label: 'Collapsed Node',
      type: 'topic',
      childCount: 5,
      isExpanded: false,
    };

    render(
      <ReactFlowProvider>
        <svg>
          <MindMapNode {...defaultNodeProps} data={data} />
        </svg>
      </ReactFlowProvider>
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

// =============================================================================
// MindMapControls Tests
// =============================================================================

describe('MindMapControls', () => {
  const defaultProps = {
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onFitView: vi.fn(),
    onCenter: vi.fn(),
    onLayoutChange: vi.fn(),
    onLayoutTypeChange: vi.fn(),
    onExport: vi.fn(),
    onExpandAll: vi.fn(),
    onCollapseAll: vi.fn(),
    layoutDirection: 'LR' as const,
    layoutType: 'dagre' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders control buttons', () => {
    render(<MindMapControls {...defaultProps} />);

    // Check for zoom buttons (by their accessible role or icon)
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('calls onZoomIn when zoom in button clicked', async () => {
    const user = userEvent.setup();
    render(<MindMapControls {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    const zoomInButton = buttons[0]; // First button is zoom in
    await user.click(zoomInButton);

    expect(defaultProps.onZoomIn).toHaveBeenCalled();
  });

  it('calls onZoomOut when zoom out button clicked', async () => {
    const user = userEvent.setup();
    render(<MindMapControls {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    const zoomOutButton = buttons[1]; // Second button is zoom out
    await user.click(zoomOutButton);

    expect(defaultProps.onZoomOut).toHaveBeenCalled();
  });
});

// =============================================================================
// GraphNode Tests
// =============================================================================

describe('GraphNode', () => {
  const defaultNodeProps = {
    id: 'test-entity',
    type: 'graphNode',
    selected: false,
    zIndex: 1,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false,
  };

  it('renders person entity correctly', () => {
    const data: GraphNodeData = {
      label: 'John Doe',
      entityType: 'person',
      description: 'A person entity',
      confidence: 0.95,
      importance: 0.8,
      relationshipCount: 5,
    };

    render(
      <ReactFlowProvider>
        <svg>
          <GraphNode {...defaultNodeProps} data={data} />
        </svg>
      </ReactFlowProvider>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders organization entity correctly', () => {
    const data: GraphNodeData = {
      label: 'Acme Corp',
      entityType: 'organization',
      description: 'A company',
      confidence: 1.0,
      importance: 0.9,
    };

    render(
      <ReactFlowProvider>
        <svg>
          <GraphNode {...defaultNodeProps} data={data} />
        </svg>
      </ReactFlowProvider>
    );

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('shows confidence percentage', () => {
    const data: GraphNodeData = {
      label: 'Concept',
      entityType: 'concept',
      confidence: 0.75,
    };

    render(
      <ReactFlowProvider>
        <svg>
          <GraphNode {...defaultNodeProps} data={data} />
        </svg>
      </ReactFlowProvider>
    );

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows relationship count badge', () => {
    const data: GraphNodeData = {
      label: 'Entity',
      entityType: 'topic',
      relationshipCount: 10,
    };

    render(
      <ReactFlowProvider>
        <svg>
          <GraphNode {...defaultNodeProps} data={data} />
        </svg>
      </ReactFlowProvider>
    );

    expect(screen.getByText('10')).toBeInTheDocument();
  });
});

// =============================================================================
// GraphControls Tests
// =============================================================================

describe('GraphControls', () => {
  const defaultProps = {
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onFitView: vi.fn(),
    onRecenter: vi.fn(),
    onLayoutChange: vi.fn(),
    onExport: vi.fn(),
    onFilterChange: vi.fn(),
    currentLayout: 'dagre' as const,
    activeFilters: [] as string[],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders control buttons', () => {
    render(<GraphControls {...defaultProps} />);

    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('shows active filter count', () => {
    render(
      <GraphControls
        {...defaultProps}
        activeFilters={['person', 'organization']}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

// =============================================================================
// EntityDetailPanel Tests
// =============================================================================

describe('EntityDetailPanel', () => {
  const mockEntity: GraphEntity = {
    id: 'entity-1',
    name: 'Test Entity',
    type: 'person',
    description: 'A test entity description',
    properties: {
      role: 'Developer',
      location: 'San Francisco',
    },
    confidence: 0.95,
    importance: 0.8,
  };

  const mockRelations: GraphRelation[] = [
    {
      id: 'rel-1',
      sourceId: 'entity-1',
      targetId: 'entity-2',
      type: 'related_to',
      label: 'works with',
    },
    {
      id: 'rel-2',
      sourceId: 'entity-3',
      targetId: 'entity-1',
      type: 'part_of',
      label: 'member of',
    },
  ];

  const mockEntities: GraphEntity[] = [
    mockEntity,
    { id: 'entity-2', name: 'Related Entity', type: 'organization' },
    { id: 'entity-3', name: 'Parent Entity', type: 'organization' },
  ];

  const defaultProps = {
    entity: mockEntity,
    relations: mockRelations,
    allEntities: mockEntities,
    onClose: vi.fn(),
    onEntityClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders entity name and type', () => {
    render(<EntityDetailPanel {...defaultProps} />);

    expect(screen.getByText('Test Entity')).toBeInTheDocument();
    expect(screen.getByText('Person')).toBeInTheDocument();
  });

  it('renders entity description', () => {
    render(<EntityDetailPanel {...defaultProps} />);

    expect(screen.getByText('A test entity description')).toBeInTheDocument();
  });

  it('renders entity properties', () => {
    render(<EntityDetailPanel {...defaultProps} />);

    expect(screen.getByText('role')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
  });

  it('renders outgoing relations', () => {
    render(<EntityDetailPanel {...defaultProps} />);

    expect(screen.getByText('Outgoing Relations (1)')).toBeInTheDocument();
    expect(screen.getByText('Related Entity')).toBeInTheDocument();
  });

  it('renders incoming relations', () => {
    render(<EntityDetailPanel {...defaultProps} />);

    expect(screen.getByText('Incoming Relations (1)')).toBeInTheDocument();
    expect(screen.getByText('Parent Entity')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    render(<EntityDetailPanel {...defaultProps} />);

    const closeButton = screen.getAllByRole('button')[0];
    await user.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onEntityClick when related entity clicked', async () => {
    const user = userEvent.setup();
    render(<EntityDetailPanel {...defaultProps} />);

    const relatedEntityButton = screen.getByText('Related Entity').closest('button');
    if (relatedEntityButton) {
      await user.click(relatedEntityButton);
      expect(defaultProps.onEntityClick).toHaveBeenCalledWith('entity-2');
    }
  });

  it('shows confidence bar', () => {
    render(<EntityDetailPanel {...defaultProps} />);

    expect(screen.getByText('Confidence')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('returns null when entity is null', () => {
    const { container } = render(
      <EntityDetailPanel {...defaultProps} entity={null} />
    );

    expect(container.firstChild).toBeNull();
  });
});

// =============================================================================
// Layout Utilities Tests
// =============================================================================

describe('Layout Utilities', () => {
  // These would test the layout functions
  // Importing directly from the module would be done in actual tests
});

// =============================================================================
// Mind Map Utils Tests
// =============================================================================

describe('Mind Map Utils', () => {
  // Import the utilities
  // These would test helper functions like getNodeChildren, toggleNodeExpanded, etc.
});
