/**
 * KnowledgeGraphViz.ts
 * Knowledge graph visualization using D3.js force-directed layout
 */

import * as d3 from 'd3';

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  metadata?: any;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export class KnowledgeGraphViz {
  private container: HTMLElement;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private simulation: d3.Simulation<GraphNode, GraphLink> | null = null;
  private width: number = 800;
  private height: number = 600;
  private data: GraphData = { nodes: [], links: [] };
  private selectedNode: GraphNode | null = null;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container element #${containerId} not found`);
    }
    this.container = element;
  }

  /**
   * Load graph data from API
   */
  async loadData(): Promise<void> {
    try {
      // Load all entities
      const entities = await window.sbfAPI.entities.getAll();
      
      // Limit to 1000 nodes for performance
      const limitedEntities = entities.slice(0, 1000);
      
      // Convert entities to nodes
      this.data.nodes = limitedEntities.map((entity: any) => ({
        id: entity.id,
        type: entity.type,
        label: entity.metadata?.title || entity.type,
        metadata: entity.metadata
      }));

      // Mock relationships for now (TODO: Use actual relationships API)
      this.data.links = this.generateMockLinks(this.data.nodes);

    } catch (error) {
      console.error('Failed to load graph data:', error);
      throw error;
    }
  }

  /**
   * Generate mock links between nodes (temporary until relationships API is available)
   */
  private generateMockLinks(nodes: GraphNode[]): GraphLink[] {
    const links: GraphLink[] = [];
    const maxLinks = Math.min(nodes.length * 2, 500); // Limit links for performance

    for (let i = 0; i < maxLinks; i++) {
      const source = nodes[Math.floor(Math.random() * nodes.length)];
      const target = nodes[Math.floor(Math.random() * nodes.length)];
      
      if (source.id !== target.id) {
        links.push({
          source: source.id,
          target: target.id,
          type: 'related'
        });
      }
    }

    return links;
  }

  /**
   * Initialize the SVG canvas
   */
  private initializeSVG(): void {
    // Clear existing SVG
    this.container.innerHTML = '';

    // Get container dimensions
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = rect.height || 600;

    // Create SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('class', 'knowledge-graph-svg');

    // Add zoom behavior
    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        if (this.svg) {
          this.svg.select('g').attr('transform', event.transform);
        }
      });

    this.svg.call(this.zoom);

    // Create container group for zoom/pan
    this.svg.append('g').attr('class', 'graph-container');
  }

  /**
   * Initialize force simulation
   */
  private initializeSimulation(): void {
    this.simulation = d3.forceSimulation<GraphNode, GraphLink>(this.data.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(this.data.links)
        .id((d: GraphNode) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius(30));
  }

  /**
   * Render the graph
   */
  render(): void {
    if (!this.svg) {
      this.initializeSVG();
    }

    if (!this.simulation) {
      this.initializeSimulation();
    }

    const g = this.svg!.select<SVGGElement>('g.graph-container');

    // Render links
    const links = g.selectAll<SVGLineElement, GraphLink>('.link')
      .data(this.data.links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', '#444')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.6);

    // Render nodes
    const nodes = g.selectAll<SVGCircleElement, GraphNode>('.node')
      .data(this.data.nodes)
      .join('circle')
      .attr('class', 'node')
      .attr('r', 8)
      .attr('fill', (d) => this.getNodeColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(this.drag() as any);

    // Add node labels
    const labels = g.selectAll<SVGTextElement, GraphNode>('.label')
      .data(this.data.nodes)
      .join('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('dy', -12)
      .attr('font-size', '10px')
      .attr('fill', '#E0E0E0')
      .attr('pointer-events', 'none')
      .text((d) => d.label.length > 20 ? d.label.substring(0, 20) + '...' : d.label);

    // Add node click handler
    nodes.on('click', (event, d) => {
      event.stopPropagation();
      this.selectNode(d);
    });

    // Add canvas click handler to deselect
    this.svg!.on('click', () => {
      this.selectNode(null);
    });

    // Update positions on simulation tick
    this.simulation!.on('tick', () => {
      links
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodes
        .attr('cx', (d) => d.x!)
        .attr('cy', (d) => d.y!);

      labels
        .attr('x', (d) => d.x!)
        .attr('y', (d) => d.y!);
    });

    this.applyStyles();
  }

  /**
   * Get color for node type
   */
  private getNodeColor(type: string): string {
    const colors: Record<string, string> = {
      task: '#4CAF50',
      note: '#2196F3',
      budget: '#FF9800',
      workout: '#E91E63',
      meal: '#9C27B0',
      medication: '#00BCD4',
      default: '#607D8B'
    };
    return colors[type] || colors.default;
  }

  /**
   * Create drag behavior
   */
  private drag(): d3.DragBehavior<SVGCircleElement, GraphNode, GraphNode> {
    return d3.drag<SVGCircleElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active && this.simulation) {
          this.simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active && this.simulation) {
          this.simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
      });
  }

  /**
   * Select a node
   */
  private selectNode(node: GraphNode | null): void {
    this.selectedNode = node;

    // Update node styling
    this.svg!.selectAll<SVGCircleElement, GraphNode>('.node')
      .attr('stroke', (d) => d.id === node?.id ? '#FFD700' : '#fff')
      .attr('stroke-width', (d) => d.id === node?.id ? 4 : 2)
      .attr('r', (d) => d.id === node?.id ? 12 : 8);

    // Show node details
    if (node) {
      this.showNodeDetails(node);
    } else {
      this.hideNodeDetails();
    }
  }

  /**
   * Show node details panel
   */
  private showNodeDetails(node: GraphNode): void {
    let panel = document.getElementById('node-details-panel');
    
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'node-details-panel';
      panel.className = 'node-details-panel';
      this.container.appendChild(panel);
    }

    panel.innerHTML = `
      <div class="panel-header">
        <h3>${node.label}</h3>
        <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="panel-content">
        <div class="detail-row">
          <span class="label">Type:</span>
          <span class="value">${node.type}</span>
        </div>
        <div class="detail-row">
          <span class="label">ID:</span>
          <span class="value">${node.id}</span>
        </div>
        ${node.metadata ? `
          <div class="detail-row">
            <span class="label">Metadata:</span>
            <pre class="value">${JSON.stringify(node.metadata, null, 2)}</pre>
          </div>
        ` : ''}
      </div>
    `;
    
    panel.style.display = 'block';
  }

  /**
   * Hide node details panel
   */
  private hideNodeDetails(): void {
    const panel = document.getElementById('node-details-panel');
    if (panel) {
      panel.style.display = 'none';
    }
  }

  /**
   * Filter nodes by type
   */
  filterByType(type: string | null): void {
    if (!this.svg) return;

    this.svg.selectAll<SVGCircleElement, GraphNode>('.node')
      .attr('opacity', (d) => !type || d.type === type ? 1 : 0.2);

    this.svg.selectAll<SVGTextElement, GraphNode>('.label')
      .attr('opacity', (d) => !type || d.type === type ? 1 : 0.2);
  }

  /**
   * Search for nodes
   */
  search(query: string): void {
    if (!this.svg || !query) {
      this.filterByType(null);
      return;
    }

    const lowerQuery = query.toLowerCase();
    this.svg.selectAll<SVGCircleElement, GraphNode>('.node')
      .attr('opacity', (d) => 
        d.label.toLowerCase().includes(lowerQuery) ||
        d.id.toLowerCase().includes(lowerQuery) ? 1 : 0.2);

    this.svg.selectAll<SVGTextElement, GraphNode>('.label')
      .attr('opacity', (d) => 
        d.label.toLowerCase().includes(lowerQuery) ||
        d.id.toLowerCase().includes(lowerQuery) ? 1 : 0.2);
  }

  /**
   * Reset zoom
   */
  resetZoom(): void {
    if (!this.svg || !this.zoom) return;
    
    this.svg.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);
  }

  /**
   * Apply styles
   */
  private applyStyles(): void {
    const styleId = 'knowledge-graph-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .knowledge-graph-svg {
        background: #1a1a1a;
        border-radius: 8px;
      }

      .node {
        transition: all 0.3s;
      }

      .node:hover {
        r: 12;
        stroke-width: 3;
      }

      .label {
        font-family: 'Segoe UI', system-ui, sans-serif;
        user-select: none;
      }

      .node-details-panel {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 300px;
        background: #2a2a2a;
        border: 1px solid #3a3a3a;
        border-radius: 8px;
        padding: 1rem;
        color: #E0E0E0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        z-index: 1000;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #3a3a3a;
      }

      .panel-header h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }

      .close-btn {
        background: none;
        border: none;
        color: #999;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        line-height: 24px;
      }

      .close-btn:hover {
        color: #fff;
      }

      .detail-row {
        margin-bottom: 0.75rem;
      }

      .detail-row .label {
        display: block;
        font-size: 0.75rem;
        color: #999;
        margin-bottom: 0.25rem;
      }

      .detail-row .value {
        display: block;
        font-size: 0.875rem;
      }

      .detail-row pre {
        background: #1a1a1a;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        overflow-x: auto;
        margin: 0;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Initialize and render the graph
   */
  async initialize(): Promise<void> {
    await this.loadData();
    this.render();
  }

  /**
   * Destroy the graph and clean up
   */
  destroy(): void {
    if (this.simulation) {
      this.simulation.stop();
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
