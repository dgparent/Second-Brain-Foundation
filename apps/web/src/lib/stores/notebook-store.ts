import { create } from 'zustand';
import { notebookApi } from '@/lib/api/notebooks';
import type { Notebook, NotebookCreateInput, NotebookUpdateInput } from '@/lib/api/types';

interface NotebookState {
  notebooks: Notebook[];
  currentNotebook: Notebook | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotebooks: (showArchived?: boolean) => Promise<void>;
  fetchNotebook: (id: string) => Promise<void>;
  createNotebook: (data: NotebookCreateInput) => Promise<Notebook>;
  updateNotebook: (id: string, data: NotebookUpdateInput) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;
  archiveNotebook: (id: string) => Promise<void>;
  unarchiveNotebook: (id: string) => Promise<void>;
  clearCurrentNotebook: () => void;
  clearError: () => void;
}

export const useNotebookStore = create<NotebookState>((set, get) => ({
  notebooks: [],
  currentNotebook: null,
  isLoading: false,
  error: null,
  
  fetchNotebooks: async (showArchived = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await notebookApi.list({ archived: showArchived });
      set({ notebooks: response.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch notebooks';
      set({ error: message, isLoading: false });
    }
  },
  
  fetchNotebook: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const notebook = await notebookApi.get(id);
      set({ currentNotebook: notebook, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch notebook';
      set({ error: message, isLoading: false });
    }
  },
  
  createNotebook: async (data: NotebookCreateInput) => {
    set({ isLoading: true, error: null });
    try {
      const notebook = await notebookApi.create(data);
      set((state) => ({ 
        notebooks: [notebook, ...state.notebooks],
        isLoading: false 
      }));
      return notebook;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create notebook';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  
  updateNotebook: async (id: string, data: NotebookUpdateInput) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await notebookApi.update(id, data);
      set((state) => ({
        notebooks: state.notebooks.map((n) =>
          n.id === id ? updated : n
        ),
        currentNotebook:
          state.currentNotebook?.id === id ? updated : state.currentNotebook,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update notebook';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  
  deleteNotebook: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await notebookApi.delete(id);
      set((state) => ({
        notebooks: state.notebooks.filter((n) => n.id !== id),
        currentNotebook:
          state.currentNotebook?.id === id ? null : state.currentNotebook,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete notebook';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  
  archiveNotebook: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await notebookApi.archive(id);
      set((state) => ({
        notebooks: state.notebooks.map((n) =>
          n.id === id ? { ...n, archived: true } : n
        ),
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to archive notebook';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  
  unarchiveNotebook: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await notebookApi.unarchive(id);
      set((state) => ({
        notebooks: state.notebooks.map((n) =>
          n.id === id ? { ...n, archived: false } : n
        ),
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unarchive notebook';
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  
  clearCurrentNotebook: () => set({ currentNotebook: null }),
  
  clearError: () => set({ error: null }),
}));
