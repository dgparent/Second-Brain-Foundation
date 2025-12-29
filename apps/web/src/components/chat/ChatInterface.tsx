/**
 * ChatInterface - Main chat interface component with streaming support
 */
'use client';

import { useEffect, useState } from 'react';
import { Settings2, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatEmptyState } from './ChatEmptyState';
import { ModelSelector } from './ModelSelector';
import { useChat, UseChatOptions } from '@/lib/hooks/useChat';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  sessionId?: string;
  notebookId?: string;
  hasContext?: boolean;
  showHeader?: boolean;
  showModelSelector?: boolean;
  onSessionCreated?: (sessionId: string) => void;
  className?: string;
}

export function ChatInterface({
  sessionId: initialSessionId,
  notebookId,
  hasContext = true,
  showHeader = true,
  showModelSelector = true,
  onSessionCreated,
  className,
}: ChatInterfaceProps) {
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>();

  const chatOptions: UseChatOptions = {
    sessionId: initialSessionId,
    notebookId,
    modelId: selectedModelId,
    onSessionCreated,
  };

  const {
    messages,
    isLoading,
    isConnected,
    error,
    streamingContent,
    sendMessage,
    cancelStream,
    clearMessages,
  } = useChat(chatOptions);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const showEmptyState = messages.length === 0 && !streamingContent;

  return (
    <div className={cn('flex h-full flex-col bg-white rounded-xl border shadow-sm', className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Chat</h2>
            {isConnected && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Connected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showModelSelector && (
              <ModelSelector
                value={selectedModelId}
                onChange={setSelectedModelId}
              />
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              title="Clear chat"
              disabled={messages.length === 0}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" title="Chat settings">
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {showEmptyState ? (
          <ChatEmptyState
            hasContext={hasContext}
            onSuggestionClick={handleSuggestionClick}
          />
        ) : (
          <MessageList
            messages={messages}
            streamingContent={streamingContent}
          />
        )}

        {/* Error display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm max-w-3xl mx-auto">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <MessageInput
          onSend={sendMessage}
          onCancel={cancelStream}
          isLoading={isLoading}
          disabled={!hasContext}
          placeholder={
            hasContext
              ? 'Ask a question about your sources...'
              : 'Add sources first to enable chat...'
          }
          className="max-w-3xl mx-auto"
        />
      </div>
    </div>
  );
}

export default ChatInterface;
