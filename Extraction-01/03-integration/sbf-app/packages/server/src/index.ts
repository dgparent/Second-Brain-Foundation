/**
 * API Server
 * 
 * Express server that provides HTTP/WebSocket API for the UI
 */

import express from 'express';
import cors from 'cors';
import { IntegrationService, IntegrationServiceConfig } from '@sbf/core';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Global service instance
let service: IntegrationService | null = null;

/**
 * Initialize service
 * POST /api/init
 */
app.post('/api/init', async (req, res) => {
  try {
    const config: IntegrationServiceConfig = req.body.config;

    service = new IntegrationService(config);
    await service.initialize();

    res.json({
      success: true,
      message: 'Integration service initialized',
    });
  } catch (error) {
    console.error('Error initializing service:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Send chat message
 * POST /api/chat
 */
app.post('/api/chat', async (req, res) => {
  try {
    if (!service) {
      return res.status(400).json({
        success: false,
        error: 'Service not initialized',
      });
    }

    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    const response = await service.sendMessage(message);

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Get queue items
 * GET /api/queue
 */
app.get('/api/queue', (req, res) => {
  try {
    if (!service) {
      return res.status(400).json({
        success: false,
        error: 'Service not initialized',
      });
    }

    const items = service.getQueueItems();

    res.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error('Error getting queue:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Approve queue item
 * POST /api/queue/:id/approve
 */
app.post('/api/queue/:id/approve', (req, res) => {
  try {
    if (!service) {
      return res.status(400).json({
        success: false,
        error: 'Service not initialized',
      });
    }

    const { id } = req.params;
    service.approveQueueItem(id);

    res.json({
      success: true,
      message: `Queue item ${id} approved`,
    });
  } catch (error) {
    console.error('Error approving queue item:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Reject queue item
 * POST /api/queue/:id/reject
 */
app.post('/api/queue/:id/reject', (req, res) => {
  try {
    if (!service) {
      return res.status(400).json({
        success: false,
        error: 'Service not initialized',
      });
    }

    const { id } = req.params;
    service.rejectQueueItem(id);

    res.json({
      success: true,
      message: `Queue item ${id} rejected`,
    });
  } catch (error) {
    console.error('Error rejecting queue item:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * List entities
 * GET /api/entities
 */
app.get('/api/entities', async (req, res) => {
  try {
    if (!service) {
      return res.status(400).json({
        success: false,
        error: 'Service not initialized',
      });
    }

    const entities = await service.listEntities();

    res.json({
      success: true,
      entities,
    });
  } catch (error) {
    console.error('Error listing entities:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Get single entity
 * GET /api/entities/:uid
 */
app.get('/api/entities/:uid', async (req, res) => {
  try {
    if (!service) {
      return res.status(400).json({
        success: false,
        error: 'Service not initialized',
      });
    }

    const { uid } = req.params;
    const entity = await service.getEntity(uid);

    if (!entity) {
      return res.status(404).json({
        success: false,
        error: 'Entity not found',
      });
    }

    res.json({
      success: true,
      entity,
    });
  } catch (error) {
    console.error('Error getting entity:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Update entity
 * PUT /api/entities/:uid
 */
app.put('/api/entities/:uid', async (req, res) => {
  try {
    if (!service) {
      return res.status(400).json({
        success: false,
        error: 'Service not initialized',
      });
    }

    const { uid } = req.params;
    const updates = req.body;

    await service.updateEntity(uid, updates);

    res.json({
      success: true,
      message: `Entity ${uid} updated`,
    });
  } catch (error) {
    console.error('Error updating entity:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Delete entity
 * DELETE /api/entities/:uid
 */
app.delete('/api/entities/:uid', async (req, res) => {
  try {
    if (!service) {
      return res.status(400).json({
        success: false,
        error: 'Service not initialized',
      });
    }

    const { uid } = req.params;
    await service.deleteEntity(uid);

    res.json({
      success: true,
      message: `Entity ${uid} deleted`,
    });
  } catch (error) {
    console.error('Error deleting entity:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Search entities
 * GET /api/entities/search?q=query
 */
app.get('/api/entities/search', async (req, res) => {
  try {
    if (!service) {
      return res.status(400).json({
        success: false,
        error: 'Service not initialized',
      });
    }

    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
      });
    }

    const entities = await service.searchEntities(q);

    res.json({
      success: true,
      entities,
    });
  } catch (error) {
    console.error('Error searching entities:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Get agent state
 * GET /api/agent/state
 */
app.get('/api/agent/state', (req, res) => {
  try {
    if (!service) {
      return res.status(400).json({
        success: false,
        error: 'Service not initialized',
      });
    }

    const state = service.getAgentState();

    res.json({
      success: true,
      state,
    });
  } catch (error) {
    console.error('Error getting agent state:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Health check
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    initialized: service !== null,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  POST   /api/init - Initialize service`);
  console.log(`  POST   /api/chat - Send chat message`);
  console.log(`  GET    /api/queue - Get queue items`);
  console.log(`  POST   /api/queue/:id/approve - Approve item`);
  console.log(`  POST   /api/queue/:id/reject - Reject item`);
  console.log(`  GET    /api/entities - List all entities`);
  console.log(`  GET    /api/entities/:uid - Get single entity`);
  console.log(`  PUT    /api/entities/:uid - Update entity`);
  console.log(`  DELETE /api/entities/:uid - Delete entity`);
  console.log(`  GET    /api/entities/search?q=query - Search entities`);
  console.log(`  GET    /api/agent/state - Get agent state`);
  console.log(`  GET    /api/health - Health check`);
  console.log();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  
  if (service) {
    await service.stop();
  }
  
  process.exit(0);
});
