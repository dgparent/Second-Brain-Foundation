/**
 * useChat - Custom hook for chat functionality with streaming support
 */
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { chatApi, ContextConfig, StreamMessagePayload } from '@/lib/api/chat';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface UseChatOptions {
  sessionId?: string;
  notebookId?: string;
  modelId?: string;
  contextConfig?: ContextConfig;
  onSessionCreated?: (sessionId: string) => void;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  streamingContent: string;
  sessionId: string | null;
  sendMessage: (content: string) => Promise<void>;
  cancelStream: () => void;
  clearMessages: () => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  createSession: () => Promise<string>;
}

/**
 * Custom hook for managing chat state and streaming
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    sessionId: initialSessionId,
    notebookId,
    modelId,
    contextConfig,
    onSessionCreated,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Update sessionId when prop changes
  useEffect(() => {
    if (initialSessionId) {
      setSessionId(initialSessionId);
    }
  }, [initialSessionId]);

  /**
   * Create a new chat session
   */
  const createSession = useCallback(async (): Promise<string> => {
    try {
      const session = await chatApi.createSession({ notebookId });
      setSessionId(session.id);
      onSessionCreated?.(session.id);
      return session.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      throw err;
    }
  }, [notebookId, onSessionCreated]);

  /**
   * Send a message and stream the response
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Create session if needed
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      try {
        currentSessionId = await createSession();
      } catch {
        return; // Error already set
      }
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsConnected(true);
    setError(null);
    setStreamingContent('');

    const assistantMessageId = crypto.randomUUID();
    lastMessageIdRef.current = assistantMessageId;
    let fullResponse = '';

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const payload: StreamMessagePayload = {
        message: content.trim(),
        notebookId,
        modelId,
        contextConfig,
      };

      await chatApi.streamMessage(
        currentSessionId,
        payload,
        {
          signal: abortControllerRef.current.signal,
          onToken: (token: string) => {
            fullResponse += token;
            setStreamingContent(fullResponse);
          },
          onComplete: () => {
            const assistantMessage: ChatMessage = {
              id: assistantMessageId,
              role: 'assistant',
              content: fullResponse,
              timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setStreamingContent('');
            setIsLoading(false);
            setIsConnected(false);
          },
          onError: (err: Error) => {
            setError(err.message);
            setIsLoading(false);
            setIsConnected(false);
            setStreamingContent('');
          },
        }
      );
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User cancelled - save partial response if any
        if (fullResponse) {
          const partialMessage: ChatMessage = {
            id: assistantMessageId,
            role: 'assistant',
            content: fullResponse + ' [cancelled]',
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, partialMessage]);
        }
        setIsLoading(false);
        setIsConnected(false);
        setStreamingContent('');
        return;
      }

      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to send message';
      setError(errorMessage);
      setIsLoading(false);
      setIsConnected(false);
      setStreamingContent('');
    }
  }, [sessionId, notebookId, modelId, contextConfig, isLoading, createSession]);

  /**
   * Cancel the current stream
   */
  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setStreamingContent('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    messages,
    isLoading,
    isConnected,
    error,
    streamingContent,
    sessionId,
    sendMessage,
    cancelStream,
    clearMessages,
    setMessages,
    createSession,
  };
}

export default useChat;
