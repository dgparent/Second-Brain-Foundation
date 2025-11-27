import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { requireAuth, tenantContextMiddleware } from '../middleware/tenant-context';

const router: Router = Router();
const syncController = new SyncController();

// All sync endpoints require authentication and tenant context
router.use(tenantContextMiddleware);
router.use(requireAuth);

/**
 * POST /api/sync/push
 * Push local changes to cloud
 * 
 * Body: {
 *   items: SyncItem[]
 * }
 */
router.post('/push', syncController.push);

/**
 * GET /api/sync/pull  
 * Pull cloud changes to local
 * 
 * Query params:
 *   - since: timestamp | version
 *   - limit: number (default 100)
 */
router.get('/pull', syncController.pull);

/**
 * GET /api/sync/status
 * Get sync status for tenant
 */
router.get('/status', syncController.getStatus);

export default router;
