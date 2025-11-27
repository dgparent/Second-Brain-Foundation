export interface AuthUser {
  userId: string;
  email: string;
  tenantIds: string[];
}

export interface JWTPayload {
  userId: string;
  email: string;
  tenantIds: string[];
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
