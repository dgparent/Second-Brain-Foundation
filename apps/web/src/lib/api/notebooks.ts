import { api } from './client';
import type { 
  Notebook, 
  CreateNotebookInput, 
  UpdateNotebookInput,
  PaginatedResponse,
  PaginationParams 
} from './types';

/**
 * Notebook API functions
 */
export const notebookApi = {
  /**
   * List all notebooks for the current user
   */
  async list(params?: PaginationParams & { archived?: boolean }): Promise<PaginatedResponse<Notebook>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.archived !== undefined) queryParams.set('archived', params.archived.toString());
    
    const url = `/notebooks${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get<PaginatedResponse<Notebook>>(url);
  },

  /**
   * Get a single notebook by ID
   */
  async get(id: string): Promise<Notebook> {
    return api.get<Notebook>(`/notebooks/${id}`);
  },

  /**
   * Create a new notebook
   */
  async create(data: CreateNotebookInput): Promise<Notebook> {
    return api.post<Notebook>('/notebooks', data);
  },

  /**
   * Update a notebook
   */
  async update(id: string, data: UpdateNotebookInput): Promise<Notebook> {
    return api.patch<Notebook>(`/notebooks/${id}`, data);
  },

  /**
   * Delete a notebook
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/notebooks/${id}`);
  },

  /**
   * Archive a notebook
   */
  async archive(id: string): Promise<Notebook> {
    return api.post<Notebook>(`/notebooks/${id}/archive`);
  },

  /**
   * Unarchive a notebook
   */
  async unarchive(id: string): Promise<Notebook> {
    return api.post<Notebook>(`/notebooks/${id}/unarchive`);
  },

  /**
   * Get notebook statistics
   */
  async getStats(id: string): Promise<{
    sourceCount: number;
    insightCount: number;
    chatSessionCount: number;
  }> {
    return api.get(`/notebooks/${id}/stats`);
  },
};
