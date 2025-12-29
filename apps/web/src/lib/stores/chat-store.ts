/**
 * Chat Store - Zustand store for chat session management
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chatApi, ChatSessionSummary } from '@/lib/api/chat';
import type { ChatSession, ChatMessage } from '@/lib/api/types';

export interface ChatState {
  // Sessions
  sessions: ChatSessionSummary[];
  currentSession: ChatSession | null;
  isLoadingSessions: boolean;
  isLoadingSession: boolean;
  
  // Model config
  selectedModelId: string | null;
  contextConfig: {
    sources: Record<string, 'insights' | 'full' | 'exclude'>;
    notes: Record<string, 'full' | 'summary' | 'exclude'>;
  };
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchSessions: () => Promise<void>;
  fetchSession: (sessionId: string) => Promise<void>;
  createSession: (notebookId?: string, title?: string) => Promise<ChatSession>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  setCurrentSession: (session: ChatSession | null) => void;
  addMessageToCurrentSession: (message: ChatMessage) => void;
  setSelectedModelId: (modelId: string | null) => void;
  setContextConfig: (config: ChatState['contextConfig']) => void;
  updateSourceContext: (sourceId: string, level: 'insights' | 'full' | 'exclude') => void;
  updateNoteContext: (noteId: string, level: 'full' | 'summary' | 'exclude') => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  sessions: [],
  currentSession: null,
  isLoadingSessions: false,
  isLoadingSession: false,
  selectedModelId: null,
  contextConfig: {
    sources: {} as Record<string, 'insights' | 'full' | 'exclude'>,
    notes: {} as Record<string, 'full' | 'summary' | 'exclude'>,
  },
  error: null,
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchSessions: async () => {
        set({ isLoadingSessions: true, error: null });
        try {
          const sessions = await chatApi.getSessions();
          set({ sessions, isLoadingSessions: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch sessions',
            isLoadingSessions: false,
          });
        }
      },

      fetchSession: async (sessionId: string) => {
        set({ isLoadingSession: true, error: null });
        try {
          const session = await chatApi.getSession(sessionId);
          set({ currentSession: session, isLoadingSession: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch session',
            isLoadingSession: false,
          });
        }
      },

      createSession: async (notebookId?: string, title?: string) => {
        set({ error: null });
        try {
          const session = await chatApi.createSession({ notebookId, title });
          set((state) => ({
            sessions: [
              {
                id: session.id,
                title: session.title,
                notebookId: session.notebookId,
                messageCount: 0,
                lastMessageAt: session.createdAt,
                createdAt: session.createdAt,
              },
              ...state.sessions,
            ],
            currentSession: session,
          }));
          return session;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create session',
          });
          throw error;
        }
      },

      deleteSession: async (sessionId: string) => {
        set({ error: null });
        try {
          await chatApi.deleteSession(sessionId);
          set((state) => ({
            sessions: state.sessions.filter((s) => s.id !== sessionId),
            currentSession: state.currentSession?.id === sessionId 
              ? null 
              : state.currentSession,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete session',
          });
          throw error;
        }
      },

      updateSessionTitle: async (sessionId: string, title: string) => {
        set({ error: null });
        try {
          await chatApi.updateSession(sessionId, { title });
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === sessionId ? { ...s, title } : s
            ),
            currentSession:
              state.currentSession?.id === sessionId
                ? { ...state.currentSession, title }
                : state.currentSession,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update session',
          });
          throw error;
        }
      },

      setCurrentSession: (session: ChatSession | null) => {
        set({ currentSession: session });
      },

      addMessageToCurrentSession: (message: ChatMessage) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              messages: [...state.currentSession.messages, message],
            },
          };
        });
      },

      setSelectedModelId: (modelId: string | null) => {
        set({ selectedModelId: modelId });
      },

      setContextConfig: (config: ChatState['contextConfig']) => {
        set({ contextConfig: config });
      },

      updateSourceContext: (sourceId: string, level: 'insights' | 'full' | 'exclude') => {
        set((state) => ({
          contextConfig: {
            ...state.contextConfig,
            sources: {
              ...state.contextConfig.sources,
              [sourceId]: level,
            },
          },
        }));
      },

      updateNoteContext: (noteId: string, level: 'full' | 'summary' | 'exclude') => {
        set((state) => ({
          contextConfig: {
            ...state.contextConfig,
            notes: {
              ...state.contextConfig.notes,
              [noteId]: level,
            },
          },
        }));
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'sbf-chat-storage',
      partialize: (state) => ({
        selectedModelId: state.selectedModelId,
        contextConfig: state.contextConfig,
      }),
    }
  )
);

export default useChatStore;
