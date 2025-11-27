import { Router } from 'express';
import { TasksController } from '../controllers';
import { requireAuth } from '../middleware';

const router: Router = Router();

router.get('/', TasksController.list);
router.get('/:id', TasksController.get);
router.post('/', requireAuth, TasksController.create);
router.put('/:id', requireAuth, TasksController.update);
router.patch('/:id', requireAuth, TasksController.update);
router.patch('/:id/status', requireAuth, TasksController.updateStatus);
router.delete('/:id', requireAuth, TasksController.delete);

export default router;
