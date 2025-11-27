import { Request, Response, NextFunction } from 'express';
import { createTenantContext, TenantContext } from '@sbf/shared';

export interface AuthenticatedRequest extends Request {
  tenantContext?: TenantContext;
  tenantId?: string;
  userId?: string;
}

export function tenantContextMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const tenantId = req.headers['x-tenant-id'] as string;
  const userId = req.headers['x-user-id'] as string;
  const channel = (req.headers['x-channel'] as any) || 'web';

  if (!tenantId && !req.path.includes('/health')) {
    return res.status(400).json({ 
      error: 'Missing tenant context',
      message: 'X-Tenant-ID header is required' 
    });
  }

  if (tenantId) {
    req.tenantContext = createTenantContext(tenantId, userId, channel);
    req.tenantId = tenantId;
    req.userId = userId;
  }

  next();
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.userId) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'X-User-ID header is required for this endpoint' 
    });
  }
  next();
}
