import { create } from 'zustand';
import { sourceApi } from '@/lib/api/sources';
import type { Source, SourceCreateInput, SourceUploadInput } from '@/lib/api/types';

interface SourceFilters {
  notebookId?: string;
  type?: string;
  status?: string;
}

interface SourceState {
  sources: Source[];
  currentSource: Source | null;
  isLoading: boolean;
  error: string | null;
  filters: SourceFilters;
  uploadProgress: number;
  
  // Actions
  fetchSources: (filters?: SourceFilters) => Promise<void>;
  fetchSource: (id: string) => Promise<void>;
  addSourceFromUrl: (url: string, notebookId?: string) => Promise<Source>;
  addSourceFromFile: (file: File, notebookId?: string, onProgress?: (progress: number) => void) => Promise<Source>;
  deleteSource: (id: string) => Promise<void>;
  retryProcessing: (id: string) => Promise<void>;
  setFilters: (filters: SourceFilters) => void;
  clearCurrentSource: () => void;
  clearError: () => void;
}

export const useSourceStore = create<SourceState>((set, get) => ({
  sources: [],
  currentSource: null,
  isLoading: false,
  error: null,
  filters: {},
  uploadProgress: 0,
  
  fetchSources: async (filters?: SourceFilters) => {
    set({ isLoading: true, error: null });
    if (filters) {
      set({ filters });
    }
    try {
      const response = await sourceApi.list(filters || get().filters);
      set({ sources: response.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch sources';
      set({ error: message, isLoading: false });
    }
  },
  
  fetchSource: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const source = await sourceApi.get(id);
      set({ currentSource: source, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch source';
      set({ error: message, isLoading: false });
    }
  },
  
  addSourceFromUrl: async (url: string, notebookId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const source = await sourceApi.addFromUrl({ url, notebookId });
      set((state) => ({ 
        sources: [source, ...state.sources],
        isLoading: false 
      }));
      return source;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add source';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  
  addSourceFromFile: async (file: File, notebookId?: string, onProgress?: (progress: number) => void) => {
    set({ isLoading: true, error: null, uploadProgress: 0 });
    try {
      const source = await sourceApi.uploadFile(
        { file, notebookId },
        (progress) => {
          set({ uploadProgress: progress });
          onProgress?.(progress);
        }
      );
      set((state) => ({ 
        sources: [source, ...state.sources],
        isLoading: false,
        uploadProgress: 100,
      }));
      return source;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload file';
      set({ error: message, isLoading: false, uploadProgress: 0 });
      throw error;
    }
  },
  
  deleteSource: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await sourceApi.delete(id);
      set((state) => ({
        sources: state.sources.filter((s) => s.id !== id),
        currentSource:
          state.currentSource?.id === id ? null : state.currentSource,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete source';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  
  retryProcessing: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await sourceApi.reprocess(id);
      // Update the source status to processing
      set((state) => ({
        sources: state.sources.map((s) =>
          s.id === id ? { ...s, status: 'processing' as const } : s
        ),
        currentSource:
          state.currentSource?.id === id 
            ? { ...state.currentSource, status: 'processing' as const }
            : state.currentSource,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retry processing';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  
  setFilters: (filters: SourceFilters) => {
    set({ filters });
    get().fetchSources(filters);
  },
  
  clearCurrentSource: () => set({ currentSource: null }),
  
  clearError: () => set({ error: null }),
}));
