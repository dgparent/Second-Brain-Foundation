/**
 * Chat API client with SSE streaming support
 */
import { api, getToken } from './client';
import type { ChatSession, ChatMessage, PaginationParams } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ContextConfig {
  sources: Record<string, 'insights' | 'full' | 'exclude'>;
  notes: Record<string, 'full' | 'summary' | 'exclude'>;
}

export interface StreamMessagePayload {
  message: string;
  notebookId?: string;
  modelId?: string;
  contextConfig?: ContextConfig;
}

export interface StreamCallbacks {
  signal?: AbortSignal;
  onToken: (token: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export interface CreateSessionInput {
  notebookId?: string;
  title?: string;
}

export interface ChatSessionSummary {
  id: string;
  title?: string;
  notebookId?: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
}

/**
 * Chat API methods
 */
export const chatApi = {
  /**
   * Create a new chat session
   */
  createSession: async (input?: CreateSessionInput): Promise<ChatSession> => {
    return api.post<ChatSession>('/chat/sessions', input || {});
  },

  /**
   * Get all chat sessions for the current user
   */
  getSessions: async (params?: PaginationParams): Promise<ChatSessionSummary[]> => {
    return api.get<ChatSessionSummary[]>('/chat/sessions', { params });
  },

  /**
   * Get a specific chat session with messages
   */
  getSession: async (sessionId: string): Promise<ChatSession> => {
    return api.get<ChatSession>(`/chat/sessions/${sessionId}`);
  },

  /**
   * Delete a chat session
   */
  deleteSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/chat/sessions/${sessionId}`);
  },

  /**
   * Update chat session title
   */
  updateSession: async (sessionId: string, data: { title: string }): Promise<ChatSession> => {
    return api.patch<ChatSession>(`/chat/sessions/${sessionId}`, data);
  },

  /**
   * Get messages for a session with pagination
   */
  getMessages: async (
    sessionId: string,
    params?: PaginationParams
  ): Promise<ChatMessage[]> => {
    return api.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`, { params });
  },

  /**
   * Send a message and stream the response using SSE
   */
  streamMessage: async (
    sessionId: string,
    payload: StreamMessagePayload,
    callbacks: StreamCallbacks
  ): Promise<void> => {
    const token = getToken();
    
    const response = await fetch(
      `${API_BASE_URL}/chat/${sessionId}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
        signal: callbacks.signal,
      }
    );

    if (!response.ok) {
      let errorMessage = 'Failed to stream message';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        // Ignore parse error
      }
      throw new Error(errorMessage);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          // Handle SSE event types
          if (line.startsWith('event: ')) {
            const event = line.slice(7).trim();
            if (event === 'done' || event === 'complete') {
              callbacks.onComplete();
              return;
            }
            if (event === 'error') {
              // Error will come in the next data line
              continue;
            }
          }

          // Handle SSE data
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              callbacks.onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.error) {
                callbacks.onError(new Error(parsed.error));
                return;
              }
              
              if (parsed.content) {
                callbacks.onToken(parsed.content);
              } else if (parsed.token) {
                callbacks.onToken(parsed.token);
              } else if (typeof parsed === 'string') {
                callbacks.onToken(parsed);
              }
            } catch {
              // If it's not JSON, treat it as raw content
              if (data.trim()) {
                callbacks.onToken(data);
              }
            }
          }
        }
      }

      callbacks.onComplete();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error; // Re-throw abort errors
      }
      callbacks.onError(error instanceof Error ? error : new Error('Stream error'));
    }
  },

  /**
   * Send a non-streaming message (for testing/fallback)
   */
  sendMessage: async (
    sessionId: string,
    payload: StreamMessagePayload
  ): Promise<ChatMessage> => {
    return api.post<ChatMessage>(`/chat/sessions/${sessionId}/messages`, payload);
  },
};

export default chatApi;
