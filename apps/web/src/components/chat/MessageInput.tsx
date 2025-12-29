/**
 * MessageInput - Chat input component with send button
 */
'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, StopCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (message: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function MessageInput({
  onSend,
  onCancel,
  isLoading = false,
  disabled = false,
  placeholder = 'Type a message...',
  className,
}: MessageInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!input.trim() || isLoading || disabled) return;
    onSend(input.trim());
    setInput('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn('flex items-end gap-2', className)}>
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || disabled}
          rows={1}
          className={cn(
            'w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12',
            'text-sm text-gray-900 placeholder:text-gray-400',
            'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500',
            'transition-colors'
          )}
        />
        
        {/* Character count for long messages */}
        {input.length > 500 && (
          <span className="absolute bottom-2 right-14 text-xs text-gray-400">
            {input.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onCancel}
          className="h-11 w-11 rounded-xl flex-shrink-0"
          title="Stop generating"
        >
          <StopCircle className="h-5 w-5 text-red-500" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className="h-11 w-11 rounded-xl flex-shrink-0"
          title="Send message"
        >
          {disabled ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      )}
    </div>
  );
}

export default MessageInput;
