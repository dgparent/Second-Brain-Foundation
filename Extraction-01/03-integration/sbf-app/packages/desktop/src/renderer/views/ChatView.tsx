/**
 * SBF Desktop - Chat View
 * Main chat interface for SBF AI assistant
 * 
 * Based on:
 * - SBF frontend-spec.md (chat interface design)
 * - FreedomGPT chat patterns (extracted)
 */

import React, { useState } from 'react';
import './ChatView.css';

interface ChatViewProps {
  vaultPath: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatView({ vaultPath }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // TODO: Send to AI backend
    // For now, just echo back
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Echo: ${input}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!vaultPath) {
    return (
      <div className="chat-view">
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h2>No Vault Selected</h2>
          <p>Select a vault folder in Settings to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-view">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>Welcome to Second Brain Foundation</h2>
            <p>Ask me anything about your vault, or use commands like:</p>
            <ul>
              <li><code>*organize</code> - Review and organize daily notes</li>
              <li><code>*entities</code> - Manage people, places, topics</li>
              <li><code>*search [query]</code> - Search your knowledge</li>
            </ul>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`message message-${message.role}`}>
            <div className="message-icon">
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything... (Enter to send, Shift+Enter for new line)"
          rows={3}
        />
        <button className="send-button" onClick={handleSend} disabled={!input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
