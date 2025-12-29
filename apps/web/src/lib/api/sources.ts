import { api } from './client';
import type { 
  Source, 
  SourceInsight,
  PaginatedResponse,
  PaginationParams,
  AddSourceFromUrlInput,
  AddSourceFromFileInput,
} from './types';

interface SourceFilters {
  notebookId?: string;
  type?: string;
  status?: string;
}

/**
 * Source API functions
 */
export const sourceApi = {
  /**
   * List sources with optional filters
   */
  async list(params?: PaginationParams & SourceFilters): Promise<PaginatedResponse<Source>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.notebookId) queryParams.set('notebookId', params.notebookId);
    if (params?.type) queryParams.set('type', params.type);
    if (params?.status) queryParams.set('status', params.status);
    
    const url = `/sources${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get<PaginatedResponse<Source>>(url);
  },

  /**
   * Get a single source by ID
   */
  async get(id: string): Promise<Source> {
    return api.get<Source>(`/sources/${id}`);
  },

  /**
   * Add a source from URL
   */
  async addFromUrl(input: AddSourceFromUrlInput): Promise<Source> {
    return api.post<Source>('/sources/url', input);
  },

  /**
   * Upload a file as a source
   */
  async uploadFile(
    input: AddSourceFromFileInput,
    onProgress?: (progress: number) => void
  ): Promise<Source> {
    return api.upload<Source>(
      '/sources/upload',
      input.file,
      onProgress,
      input.notebookId ? { notebookId: input.notebookId } : undefined
    );
  },

  /**
   * Add text content as a source
   */
  async addText(title: string, content: string, notebookId?: string): Promise<Source> {
    return api.post<Source>('/sources/text', { title, content, notebookId });
  },

  /**
   * Delete a source
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/sources/${id}`);
  },

  /**
   * Reprocess a failed source
   */
  async reprocess(id: string): Promise<Source> {
    return api.post<Source>(`/sources/${id}/reprocess`);
  },

  /**
   * Move source to another notebook
   */
  async moveToNotebook(sourceId: string, notebookId: string): Promise<Source> {
    return api.patch<Source>(`/sources/${sourceId}`, { notebookId });
  },

  /**
   * Get source content/transcript
   */
  async getContent(id: string): Promise<{ content: string; chunks?: string[] }> {
    return api.get(`/sources/${id}/content`);
  },

  /**
   * Get insights for a source
   */
  async getInsights(sourceId: string): Promise<SourceInsight[]> {
    return api.get<SourceInsight[]>(`/sources/${sourceId}/insights`);
  },

  /**
   * Generate/regenerate insights for a source
   */
  async generateInsights(sourceId: string, types?: string[]): Promise<SourceInsight[]> {
    return api.post<SourceInsight[]>(`/sources/${sourceId}/insights/generate`, { types });
  },
};
