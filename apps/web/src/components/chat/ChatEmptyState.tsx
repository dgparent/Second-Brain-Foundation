/**
 * ChatEmptyState - Empty state shown when no messages exist
 */
'use client';

import { Sparkles, BookOpen, Lightbulb, Search } from 'lucide-react';

interface ChatEmptyStateProps {
  hasContext: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}

const suggestions = [
  { icon: Lightbulb, text: 'Summarize the key insights from my sources' },
  { icon: Search, text: 'What are the main themes across all my content?' },
  { icon: BookOpen, text: 'Create a study guide based on my notes' },
];

export function ChatEmptyState({ hasContext, onSuggestionClick }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-6">
        <Sparkles className="h-8 w-8 text-purple-600" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {hasContext ? 'Ready to Research' : 'Waiting for Context'}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 max-w-sm mb-8">
        {hasContext
          ? 'Ask questions about your sources. I can help synthesize information, find connections, and generate insights.'
          : 'Add sources to your notebook to enable context-aware chat. The more sources you add, the better I can help.'}
      </p>

      {/* Suggestions */}
      {hasContext && (
        <div className="w-full max-w-md space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Try asking:
          </p>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick?.(suggestion.text)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 text-left transition-colors group"
            >
              <suggestion.icon className="h-5 w-5 text-gray-400 group-hover:text-purple-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {suggestion.text}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatEmptyState;
