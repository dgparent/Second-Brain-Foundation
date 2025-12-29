/**
 * ChatSessionList - List of chat sessions in sidebar
 */
'use client';

import { useEffect } from 'react';
import { MessageSquare, Trash2, MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatStore } from '@/lib/stores/chat-store';
import { cn } from '@/lib/utils';
import { formatRelativeDate } from '@/lib/utils';

interface ChatSessionListProps {
  notebookId?: string;
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  className?: string;
}

export function ChatSessionList({
  notebookId,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  className,
}: ChatSessionListProps) {
  const { sessions, isLoadingSessions, fetchSessions, deleteSession } = useChatStore();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Filter sessions by notebook if specified
  const filteredSessions = notebookId
    ? sessions.filter((s) => s.notebookId === notebookId)
    : sessions;

  if (isLoadingSessions) {
    return (
      <div className={cn('space-y-2', className)}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* New Chat Button */}
      <Button
        onClick={onNewChat}
        variant="outline"
        className="w-full justify-start gap-2"
      >
        <Plus className="h-4 w-4" />
        New Chat
      </Button>

      {/* Session List */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500">
          No chat sessions yet
        </div>
      ) : (
        <div className="space-y-1">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                'group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors',
                session.id === currentSessionId
                  ? 'bg-gray-100 text-gray-900'
                  : 'hover:bg-gray-50 text-gray-700'
              )}
              onClick={() => onSessionSelect(session.id)}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0 text-gray-400" />
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {session.title || 'Untitled Chat'}
                </div>
                <div className="text-xs text-gray-400">
                  {session.messageCount} messages · {formatRelativeDate(session.lastMessageAt)}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatSessionList;
