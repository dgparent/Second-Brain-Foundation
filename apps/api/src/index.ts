import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';
import { logger } from '@sbf/logging';
import { tenantContextMiddleware, errorHandler } from './middleware';
import routes from './routes';
import { vaultService } from './services/vault.service';
import path from 'path';

config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info({
    method: req.method,
    path: req.path,
    tenantId: req.headers['x-tenant-id'],
  });
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Tenant context middleware
app.use(tenantContextMiddleware);

// API Routes
app.use('/api/v1', routes);

// Error handler
app.use(errorHandler);

const server = app.listen(PORT, async () => {
  logger.info(`SBF API Gateway listening on port ${PORT}`);
  
  try {
    // In development, we might want to start a default watcher
    // In production, this should be triggered by tenant activation or a startup job
    if (process.env.NODE_ENV !== 'production') {
        await vaultService.startTenantWatcher('default');
    }
  } catch (error) {
    logger.error('Failed to start Vault Service:', error);
  }
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down...');
  await vaultService.stopAll();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
