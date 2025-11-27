import { Router } from 'express';
import { EntitiesController } from '../controllers';
import { requireAuth } from '../middleware';

const router: Router = Router();

router.get('/', EntitiesController.list);
router.get('/:id', EntitiesController.get);
router.post('/', requireAuth, EntitiesController.create);
router.put('/:id', requireAuth, EntitiesController.update);
router.patch('/:id', requireAuth, EntitiesController.update);
router.delete('/:id', requireAuth, EntitiesController.delete);

export default router;
