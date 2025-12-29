/**
 * API Client for CLI
 */

import { request } from 'undici';
import { getConfig } from '../config.js';
import {
  RemoteEntity,
  CreateEntityRequest,
  ListEntitiesRequest,
  ListEntitiesResponse,
  SearchRequest,
  SearchResponse,
  ChatRequest,
  ChatResponse,
  APIError,
} from '../types.js';

/**
 * SBF API Error
 */
export class SBFAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SBFAPIError';
  }
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const config = getConfig();
  const url = `${config.apiUrl.replace(/\/$/, '')}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  try {
    const { statusCode, body: responseBody } = await request(url, {
      method: method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await responseBody.text();
    let data: unknown;
    
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (statusCode >= 400) {
      const errorData = data as APIError | undefined;
      throw new SBFAPIError(
        errorData?.message || `HTTP ${statusCode}`,
        errorData?.code || `HTTP_${statusCode}`,
        statusCode,
        errorData?.details
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof SBFAPIError) {
      throw error;
    }
    throw new SBFAPIError(
      `Network error: ${(error as Error).message}`,
      'NETWORK_ERROR',
      0
    );
  }
}

/**
 * API client object
 */
export const api = {
  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await apiRequest<{ status: string }>('GET', '/health');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get current user
   */
  async me(): Promise<{ id: string; email: string; name?: string }> {
    return apiRequest('GET', '/api/v1/me');
  },

  /**
   * List entities
   */
  async listEntities(params?: ListEntitiesRequest): Promise<ListEntitiesResponse> {
    const query = new URLSearchParams();

    if (params?.type) query.set('type', params.type);
    if (params?.sensitivity) query.set('sensitivity', params.sensitivity);
    if (params?.search) query.set('search', params.search);
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.limit) query.set('limit', String(params.limit));

    const queryString = query.toString();
    const path = `/api/v1/entities${queryString ? `?${queryString}` : ''}`;

    return apiRequest('GET', path);
  },

  /**
   * Get entity by UID
   */
  async getEntity(uid: string): Promise<RemoteEntity | null> {
    try {
      return await apiRequest<RemoteEntity>('GET', `/api/v1/entities/${uid}`);
    } catch (error) {
      if (error instanceof SBFAPIError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create entity
   */
  async createEntity(data: CreateEntityRequest): Promise<RemoteEntity> {
    return apiRequest('POST', '/api/v1/entities', data);
  },

  /**
   * Update entity
   */
  async updateEntity(uid: string, data: Partial<CreateEntityRequest>): Promise<RemoteEntity> {
    return apiRequest('PATCH', `/api/v1/entities/${uid}`, data);
  },

  /**
   * Delete entity
   */
  async deleteEntity(uid: string): Promise<void> {
    await apiRequest('DELETE', `/api/v1/entities/${uid}`);
  },

  /**
   * Search entities
   */
  async search(params: SearchRequest): Promise<SearchResponse> {
    const query = new URLSearchParams();
    query.set('q', params.query);
    
    if (params.type) query.set('type', params.type);
    if (params.limit) query.set('limit', String(params.limit));
    if (params.hybrid !== undefined) query.set('hybrid', String(params.hybrid));

    return apiRequest('GET', `/api/v1/search?${query.toString()}`);
  },

  /**
   * Chat with knowledge base
   */
  async chat(params: ChatRequest): Promise<ChatResponse> {
    return apiRequest('POST', '/api/v1/chat', params);
  },
};
