/**
 * SearchResultCard - Individual search result with highlighting
 */
'use client';

import Link from 'next/link';
import { FileText, BookOpen, Lightbulb, Video, Globe, FileIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SearchResult } from '@/lib/api/search';
import { cn } from '@/lib/utils';

interface SearchResultCardProps {
  result: SearchResult;
  query: string;
  className?: string;
}

const entityIcons = {
  source: FileText,
  note: BookOpen,
  insight: Lightbulb,
};

const sourceTypeIcons: Record<string, typeof FileText> = {
  url: Globe,
  youtube: Video,
  pdf: FileIcon,
  document: FileText,
  text: FileText,
};

export function SearchResultCard({
  result,
  query,
  className,
}: SearchResultCardProps) {
  const EntityIcon = entityIcons[result.entityType] || FileText;
  const SourceIcon = result.sourceType
    ? sourceTypeIcons[result.sourceType] || FileText
    : null;

  // Highlight matching terms in snippet
  const highlightedSnippet = highlightMatches(result.snippet || '', query);

  // Build href based on entity type
  const href = buildHref(result);

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
            <EntityIcon className="h-5 w-5 text-gray-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and badges */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Link
                href={href}
                className="font-medium text-gray-900 hover:text-blue-600 truncate max-w-md"
              >
                {result.title || 'Untitled'}
              </Link>
              <Badge variant="secondary" className="text-xs capitalize">
                {result.entityType}
              </Badge>
              {result.searchType && (
                <Badge variant="outline" className="text-xs">
                  {result.searchType}
                </Badge>
              )}
              {SourceIcon && result.sourceType && (
                <Badge variant="outline" className="text-xs gap-1">
                  <SourceIcon className="h-3 w-3" />
                  {result.sourceType}
                </Badge>
              )}
            </div>

            {/* Snippet with highlighting */}
            {highlightedSnippet && (
              <p
                className="text-sm text-gray-600 line-clamp-3 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightedSnippet }}
              />
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span className="font-medium">
                {Math.round(result.score * 100)}% match
              </span>
              {result.notebookName && (
                <span>in {result.notebookName}</span>
              )}
              {result.createdAt && (
                <span>{formatDate(result.createdAt)}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Highlight matching terms in text
 */
function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return escapeHtml(text);

  const words = query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => escapeRegExp(w));

  if (words.length === 0) return escapeHtml(text);

  const pattern = new RegExp(`(${words.join('|')})`, 'gi');
  const escaped = escapeHtml(text);
  return escaped.replace(
    pattern,
    '<mark class="bg-yellow-200 text-gray-900 px-0.5 rounded">$1</mark>'
  );
}

function escapeHtml(text: string): string {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (div) {
    div.textContent = text;
    return div.innerHTML;
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildHref(result: SearchResult): string {
  switch (result.entityType) {
    case 'source':
      return `/sources/${result.entityId}`;
    case 'note':
      return `/notes/${result.entityId}`;
    case 'insight':
      return `/sources/${result.metadata?.sourceId || result.entityId}`;
    default:
      return '#';
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default SearchResultCard;
