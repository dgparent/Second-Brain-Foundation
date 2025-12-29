/**
 * Chat Page - Main chat interface with session management
 */
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChatInterface, ChatSessionList } from '@/components/chat';
import { useChatStore } from '@/lib/stores/chat-store';
import { useNotebookStore } from '@/lib/stores/notebook-store';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const sessionId = searchParams.get('session');
  const notebookId = searchParams.get('notebook');

  const { currentNotebook, fetchNotebook } = useNotebookStore();
  const { fetchSession, currentSession } = useChatStore();

  const [showSessions, setShowSessions] = useState(true);

  // Load notebook if specified
  useEffect(() => {
    if (notebookId) {
      fetchNotebook(notebookId);
    }
  }, [notebookId, fetchNotebook]);

  // Load session if specified
  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [sessionId, fetchSession]);

  // Handle session selection
  const handleSessionSelect = (newSessionId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('session', newSessionId);
    router.push(`/chat?${params.toString()}`);
  };

  // Handle new chat
  const handleNewChat = () => {
    const params = new URLSearchParams();
    if (notebookId) {
      params.set('notebook', notebookId);
    }
    router.push(`/chat?${params.toString()}`);
  };

  // Handle session created
  const handleSessionCreated = (newSessionId: string) => {
    handleSessionSelect(newSessionId);
  };

  // Determine if context is available (notebook has sources)
  const hasContext = notebookId
    ? (currentNotebook?.sourceCount ?? 0) > 0
    : true;

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Sessions Sidebar */}
      {showSessions && (
        <div className="w-72 flex-shrink-0 border-r pr-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
            {notebookId && currentNotebook && (
              <p className="text-sm text-gray-500 mt-1">
                In: {currentNotebook.name}
              </p>
            )}
          </div>
          <ChatSessionList
            notebookId={notebookId ?? undefined}
            currentSessionId={sessionId ?? undefined}
            onSessionSelect={handleSessionSelect}
            onNewChat={handleNewChat}
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 min-w-0">
        <ChatInterface
          sessionId={sessionId ?? undefined}
          notebookId={notebookId ?? undefined}
          hasContext={hasContext}
          onSessionCreated={handleSessionCreated}
        />
      </div>
    </div>
  );
}
