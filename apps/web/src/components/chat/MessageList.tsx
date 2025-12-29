/**
 * MessageList - Scrollable list of chat messages with auto-scroll
 */
'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { StreamingMessage } from './StreamingMessage';
import type { ChatMessage as ChatMessageType } from '@/lib/hooks/useChat';

interface MessageListProps {
  messages: ChatMessageType[];
  streamingContent?: string;
  className?: string;
}

export function MessageList({
  messages,
  streamingContent,
  className,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or streaming content
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div
      ref={containerRef}
      className={className}
    >
      <div className="space-y-6 max-w-3xl mx-auto">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Streaming message */}
        {streamingContent && (
          <StreamingMessage content={streamingContent} />
        )}

        {/* Scroll anchor */}
        <div ref={scrollRef} />
      </div>
    </div>
  );
}

export default MessageList;
