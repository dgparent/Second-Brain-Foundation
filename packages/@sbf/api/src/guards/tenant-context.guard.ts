// Tenant Context Guard
// Ensures tenant context is set before handler execution

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { TenantContextService } from '@sbf/core/entity-manager/services/TenantContextService';

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(
    private readonly tenantContextService: TenantContextService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Extract tenant_id from:
    // 1. Route params (e.g., /tenants/:tenantId)
    // 2. Header (X-Tenant-Id)
    // 3. Subdomain
    const tenantId = this.extractTenantId(request);

    if (!tenantId) {
      throw new BadRequestException('Tenant context required');
    }

    try {
      // Resolve tenant context
      const tenantContext = await this.tenantContextService.resolve({
        userId: user.id,
        tenantId
      });

      // Attach to request for use in handlers
      request.tenantContext = tenantContext;

      return true;
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }

  private extractTenantId(request: any): string | null {
    // Try route params first (most common for REST APIs)
    if (request.params?.tenantId) {
      return request.params.tenantId;
    }

    // Try header
    if (request.headers['x-tenant-id']) {
      return request.headers['x-tenant-id'];
    }

    // Try subdomain (e.g., tenant123.sbf.app)
    const host = request.headers.host;
    if (host) {
      const subdomain = host.split('.')[0];
      // If subdomain looks like a UUID or slug, use it
      if (subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'api') {
        // TODO: Resolve slug to tenant_id
        return subdomain;
      }
    }

    return null;
  }
}
