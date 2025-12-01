import { Router } from 'express';
import entitiesRoutes from './entities.routes';
import tasksRoutes from './tasks.routes';
import tenantsRoutes from './tenants.routes';
import ragRoutes from './rag.routes';
import automationsRoutes from './automations.routes';
import voiceRoutes from './voice.routes';
import iotRoutes from './iot.routes';
import analyticsRoutes from './analytics.routes';
import syncRoutes from './sync.routes';
import memoryRoutes from './memory.routes';

const router: Router = Router();

// Sync routes (Phase 2)
router.use('/sync', syncRoutes);

// Memory Engine routes (Phase 4)
router.use('/memory', memoryRoutes);

// Core entity routes
router.use('/entities', entitiesRoutes);
router.use('/tasks', tasksRoutes);

// Multi-tenant routes
router.use('/tenants', tenantsRoutes);

// AI & RAG routes
router.use('/rag', ragRoutes);

// Automation routes
router.use('/automations', automationsRoutes);

// Multi-channel routes
router.use('/voice', voiceRoutes);
router.use('/iot', iotRoutes);

// Analytics routes
router.use('/analytics', analyticsRoutes);

export default router;
