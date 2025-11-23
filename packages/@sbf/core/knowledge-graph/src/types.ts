/**
 * Knowledge Graph Types
 */

export interface GraphMetrics {
  centrality: number;
  connections: number;
  importance: number;
}

export interface GraphAnalysis {
  clusters: string[][];
  hubs: string[];
  orphans: string[];
}
