import { Router } from 'express';
import { MemoryController } from '../controllers/memory.controller';
import { requireAuth, tenantContextMiddleware } from '../middleware/tenant-context';

const router: Router = Router();
const memoryController = new MemoryController();

// All memory endpoints require authentication and tenant context
router.use(tenantContextMiddleware);
router.use(requireAuth);

/**
 * GET /api/v1/memory/graph
 * Get the knowledge graph for the current tenant
 */
router.get('/graph', memoryController.getGraph);

/**
 * GET /api/v1/memory/stats
 * Get statistics about the memory engine
 */
router.get('/stats', memoryController.getStats);

export default router;
