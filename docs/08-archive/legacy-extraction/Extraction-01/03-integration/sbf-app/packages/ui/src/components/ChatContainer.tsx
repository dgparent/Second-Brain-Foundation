/**
 * Chat Container Component
 * Adapted from Open-WebUI's Chat component
 * 
 * Main chat interface that integrates messages and input
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageProps } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { EmptyState } from './common/EmptyState';
import { Tooltip } from './common/Tooltip';

export interface ChatContainerProps {
  initialMessages?: MessageProps[];
  onSendMessage: (message: string) => Promise<void>;
  isProcessing?: boolean;
  title?: string;
  onWikilinkClick?: (entityName: string) => void;
  onSettingsClick?: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  initialMessages = [],
  onSendMessage,
  isProcessing = false,
  title = 'Second Brain Foundation',
  onWikilinkClick,
  onSettingsClick,
}) => {
  const [messages, setMessages] = useState<MessageProps[]>(initialMessages);
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSend = async (message: string) => {
    // Add user message
    const userMessage: MessageProps = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      // Call the handler (which should update messages via streaming or completion)
      await onSendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: MessageProps = {
        role: 'assistant',
        content: `Error: ${(error as Error).message}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900" data-tour="chat-interface">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your personal knowledge assistant
            </p>
          </div>
          {onSettingsClick && (
            <Tooltip content="Open Settings" position="bottom">
              <button
                onClick={onSettingsClick}
                data-tour="settings-button"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Settings"
              >
                <span className="text-xl">⚙️</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && !streamingMessage && (
            <EmptyState
              icon="🧠"
              title="Let's start organizing!"
              description="Ask me anything about your notes or request organization actions. I'll help you create entities and build your knowledge graph."
              examples={[
                "What projects am I working on?",
                "Show me notes about machine learning",
                "Create a new project entity for my research"
              ]}
              secondaryAction={{
                label: "Learn More",
                href: "/docs/getting-started"
              }}
            />
          )}

          {messages.map((msg, index) => (
            <ChatMessage key={index} {...msg} onWikilinkClick={onWikilinkClick} />
          ))}

          {streamingMessage && (
            <ChatMessage
              role="assistant"
              content={streamingMessage}
              isStreaming={true}
            />
          )}

          {isProcessing && !streamingMessage && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div data-tour="message-input">
        <MessageInput
          onSend={handleSend}
          disabled={isProcessing}
          placeholder={isProcessing ? 'Processing...' : 'Ask me anything about your vault...'}
        />
      </div>
    </div>
  );
};

// Helper to update messages from outside
export const useChatMessages = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);

  const addMessage = (message: MessageProps) => {
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    addMessage({
      role: 'user',
      content,
      timestamp: Date.now(),
    });
  };

  const addAssistantMessage = (content: string) => {
    addMessage({
      role: 'assistant',
      content,
      timestamp: Date.now(),
    });
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    addMessage,
    addUserMessage,
    addAssistantMessage,
    clearMessages,
  };
};
