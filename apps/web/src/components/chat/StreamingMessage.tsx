/**
 * StreamingMessage - Message component with animated cursor during streaming
 */
'use client';

import { Sparkles } from 'lucide-react';

interface StreamingMessageProps {
  content: string;
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className="flex gap-4 justify-start">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
        <Sparkles className="h-4 w-4 text-white" />
      </div>

      {/* Message bubble */}
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-5 py-3 bg-gray-50 border border-gray-200">
        {/* Generating indicator */}
        <div className="flex items-center gap-2 mb-2 opacity-50">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Generating
          </span>
        </div>

        {/* Content with cursor */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-900">
          {content}
          <span className="inline-block w-0.5 h-4 ml-0.5 bg-purple-500 animate-pulse align-middle" />
        </p>
      </div>
    </div>
  );
}

export default StreamingMessage;
