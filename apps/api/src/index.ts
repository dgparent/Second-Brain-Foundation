import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';
import { logger } from '@sbf/logging';
import { tenantContextMiddleware, errorHandler } from './middleware';
import routes from './routes';

config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.listen(PORT, () => {
  logger.info(`SBF API Gateway listening on port ${PORT}`);
});

export default app;
