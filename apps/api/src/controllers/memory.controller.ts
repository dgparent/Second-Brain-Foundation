import { Request, Response } from 'express';
import { vaultService } from '../services/vault.service';
import { TenantContext } from '@sbf/shared';

export class MemoryController {
  
  /**
   * GET /api/v1/memory/graph
   * Returns the knowledge graph for the current tenant
   */
  getGraph = async (req: Request, res: Response) => {
    const tenantContext = (req as any).tenantContext as TenantContext;
    const engine = vaultService.getMemoryEngine(tenantContext.tenant_id);

    if (!engine) {
      return res.status(404).json({ error: 'Memory Engine not initialized for this tenant' });
    }

    const graph = engine.getGraph();
    
    if (!graph) {
        return res.json({ nodes: [], edges: [] });
    }

    const relationships = graph.getAllRelationships();
    
    // We also need nodes. MemoryEngine has entityCache.
    // We need to expose entityCache or a method to get all entities.
    // For now, let's just return edges and unique node IDs from edges.
    
    const nodeIds = new Set<string>();
    relationships.forEach(r => {
        nodeIds.add(r.source_uid);
        nodeIds.add(r.target_uid);
    });

    return res.json({
        nodes: Array.from(nodeIds).map(id => ({ id })),
        edges: relationships
    });
  }

  /**
   * GET /api/v1/memory/stats
   * Returns statistics about the memory engine
   */
  getStats = async (req: Request, res: Response) => {
    const tenantContext = (req as any).tenantContext as TenantContext;
    const engine = vaultService.getMemoryEngine(tenantContext.tenant_id);

    if (!engine) {
      return res.status(404).json({ error: 'Memory Engine not initialized for this tenant' });
    }

    // We can expose stats from MemoryEngine
    // For now, let's return basic info
    return res.json({
        status: 'active',
        tenantId: tenantContext.tenant_id,
        // We might want to add a getStats() method to MemoryEngine
    });
  }
}
