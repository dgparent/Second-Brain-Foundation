// Tenant Context Decorator
// Extracts tenant context from request

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TenantCtx = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantContext;
  },
);
