// Auth Guard (Placeholder)
// Validates JWT token and attaches user to request

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      // TODO: Validate JWT token
      // TODO: Load user from database
      // For now, placeholder:
      const user = await this.validateToken(token);
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid authentication token');
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  private async validateToken(token: string): Promise<any> {
    // TODO: Implement JWT validation
    // Placeholder: return mock user
    return {
      id: 'user-123',
      email: 'user@example.com',
      name: 'Test User'
    };
  }
}
