/**
 * Chat Message Component
 * Adapted from Open-WebUI's message display patterns
 * Enhanced with markdown rendering and syntax highlighting
 * 
 * Displays a single chat message (user or assistant)
 */

import React, { useState } from 'react';
import { MarkdownRenderer } from './common/MarkdownRenderer';
import { TypingIndicator } from './common/TypingIndicator';

export interface MessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  isStreaming?: boolean;
  onWikilinkClick?: (entityName: string) => void;
}

export const ChatMessage: React.FC<MessageProps> = ({
  role,
  content,
  timestamp,
  isStreaming = false,
  onWikilinkClick,
}) => {
  const isUser = role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-3xl rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }`}
      >
        {/* Role indicator */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-2">
            {!isUser && (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                AI
              </div>
            )}
            <span className="text-xs font-semibold opacity-80">
              {isUser ? 'You' : 'Assistant'}
            </span>
          </div>
          {timestamp && (
            <span className="text-xs opacity-60">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Message content with markdown rendering */}
        {isUser ? (
          <div className="prose prose-sm max-w-none prose-invert">
            <p className="my-0 whitespace-pre-wrap">{content}</p>
          </div>
        ) : (
          <div className={`prose prose-sm max-w-none dark:prose-invert`}>
            <MarkdownRenderer 
              content={content} 
              onWikilinkClick={onWikilinkClick}
            />
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
