/**
 * SBFClient - API Client for Second Brain Foundation
 * 
 * HTTP client for communicating with the SBF API.
 */

import { requestUrl, RequestUrlParam, RequestUrlResponse } from 'obsidian';
import {
  RemoteEntity,
  EntityUpsertRequest,
  ListEntitiesRequest,
  ListEntitiesResponse,
  APIError,
  SBFPluginSettings,
} from '../types';

export class SBFClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(settings: SBFPluginSettings) {
    this.baseUrl = settings.apiUrl.replace(/\/$/, '');
    this.apiKey = settings.apiKey;
  }

  /**
   * Update client settings
   */
  updateSettings(settings: SBFPluginSettings): void {
    this.baseUrl = settings.apiUrl.replace(/\/$/, '');
    this.apiKey = settings.apiKey;
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const options: RequestUrlParam = {
      url,
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      throw: false,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    let response: RequestUrlResponse;
    
    try {
      response = await requestUrl(options);
    } catch (error) {
      throw new SBFAPIError('Network error', 'NETWORK_ERROR', {
        cause: error,
      });
    }

    if (response.status >= 400) {
      const errorData = response.json as APIError | undefined;
      throw new SBFAPIError(
        errorData?.message || `HTTP ${response.status}`,
        errorData?.code || `HTTP_${response.status}`,
        errorData?.details
      );
    }

    return response.json as T;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request<{ status: string }>('GET', '/health');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserInfo> {
    return this.request<UserInfo>('GET', '/api/v1/me');
  }

  /**
   * List entities with optional filters
   */
  async listEntities(params?: ListEntitiesRequest): Promise<ListEntitiesResponse> {
    const query = new URLSearchParams();

    if (params?.type) query.set('type', params.type);
    if (params?.sensitivity) query.set('sensitivity', params.sensitivity);
    if (params?.search) query.set('search', params.search);
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.since) query.set('since', params.since);

    const queryString = query.toString();
    const path = `/api/v1/entities${queryString ? `?${queryString}` : ''}`;

    return this.request<ListEntitiesResponse>('GET', path);
  }

  /**
   * Get single entity by UID
   */
  async getEntity(uid: string): Promise<RemoteEntity | null> {
    try {
      return await this.request<RemoteEntity>('GET', `/api/v1/entities/${uid}`);
    } catch (error) {
      if (error instanceof SBFAPIError && error.code === 'HTTP_404') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create or update entity
   */
  async upsertEntity(data: EntityUpsertRequest): Promise<RemoteEntity> {
    if (data.uid) {
      // Update existing
      return this.request<RemoteEntity>('PUT', `/api/v1/entities/${data.uid}`, data);
    } else {
      // Create new
      return this.request<RemoteEntity>('POST', '/api/v1/entities', data);
    }
  }

  /**
   * Create new entity
   */
  async createEntity(data: Omit<EntityUpsertRequest, 'uid'>): Promise<RemoteEntity> {
    return this.request<RemoteEntity>('POST', '/api/v1/entities', data);
  }

  /**
   * Update existing entity
   */
  async updateEntity(uid: string, data: Partial<EntityUpsertRequest>): Promise<RemoteEntity> {
    return this.request<RemoteEntity>('PATCH', `/api/v1/entities/${uid}`, data);
  }

  /**
   * Delete entity
   */
  async deleteEntity(uid: string): Promise<void> {
    await this.request<void>('DELETE', `/api/v1/entities/${uid}`);
  }

  /**
   * Search entities
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResult> {
    const params: Record<string, string> = { q: query };

    if (options?.type) params.type = options.type;
    if (options?.limit) params.limit = String(options.limit);
    if (options?.hybrid !== undefined) params.hybrid = String(options.hybrid);

    const queryString = new URLSearchParams(params).toString();
    return this.request<SearchResult>('GET', `/api/v1/search?${queryString}`);
  }

  /**
   * Get entity relationships
   */
  async getRelationships(uid: string): Promise<RelationshipMap> {
    return this.request<RelationshipMap>('GET', `/api/v1/entities/${uid}/relationships`);
  }

  /**
   * Batch get entities
   */
  async batchGet(uids: string[]): Promise<RemoteEntity[]> {
    if (uids.length === 0) return [];
    
    return this.request<RemoteEntity[]>('POST', '/api/v1/entities/batch', { uids });
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<SyncStatusResponse> {
    return this.request<SyncStatusResponse>('GET', '/api/v1/sync/status');
  }
}

/**
 * SBF API Error
 */
export class SBFAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SBFAPIError';
  }
}

/**
 * User info
 */
export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  tenantId: string;
}

/**
 * Search options
 */
export interface SearchOptions {
  type?: string;
  limit?: number;
  hybrid?: boolean;
}

/**
 * Search result
 */
export interface SearchResult {
  results: Array<{
    entity: RemoteEntity;
    score: number;
    highlights?: string[];
  }>;
  total: number;
  query: string;
}

/**
 * Relationship map
 */
export interface RelationshipMap {
  outgoing: Array<{
    type: string;
    target: RemoteEntity;
  }>;
  incoming: Array<{
    type: string;
    source: RemoteEntity;
  }>;
}

/**
 * Sync status response
 */
export interface SyncStatusResponse {
  lastSync?: string;
  entityCount: number;
  pendingChanges: number;
}
