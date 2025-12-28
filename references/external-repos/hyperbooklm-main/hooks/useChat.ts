"use client";

import { useState, useCallback, useRef } from "react";
import { Message, Source } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { streamChatCompletion } from "@/lib/api/claude";

export function useChat(sources: Source[]) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      if (sources.length === 0) {
        setError("Please add at least one source before asking questions");
        return;
      }

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);
      setStreamingContent("");

      const assistantMessageId = generateId();
      let fullResponse = "";

      try {
        await streamChatCompletion(content.trim(), sources, {
          onStart: () => {
            setStreamingContent("");
          },
          onToken: (token: string) => {
            fullResponse += token;
            setStreamingContent(fullResponse);
          },
          onComplete: (finalText: string) => {
            const assistantMessage: Message = {
              id: assistantMessageId,
              role: "assistant",
              content: finalText || fullResponse,
              timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setStreamingContent("");
            setIsLoading(false);
          },
          onError: (err: Error) => {
            setError(err.message);
            setIsLoading(false);
            setStreamingContent("");
          },
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        setIsLoading(false);
        setStreamingContent("");
      }
    },
    [sources, isLoading]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setStreamingContent("");
  }, []);

  return {
    messages,
    isLoading,
    error,
    streamingContent,
    sendMessage,
    clearMessages,
  };
}
