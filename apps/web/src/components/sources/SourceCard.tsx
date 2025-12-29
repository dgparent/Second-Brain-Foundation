'use client';

import Link from 'next/link';
import { 
  MoreHorizontal, 
  ExternalLink, 
  Trash2, 
  RefreshCw,
  FileText,
  Globe,
  FileType,
  Youtube,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatRelativeDate, truncate } from '@/lib/utils';
import type { Source } from '@/lib/api/types';

interface SourceCardProps {
  source: Source;
  onDelete?: (source: Source) => void;
  onRetry?: (source: Source) => void;
}

const sourceTypeIcons: Record<string, React.ElementType> = {
  url: Globe,
  pdf: FileType,
  document: FileText,
  youtube: Youtube,
  default: FileText,
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  processed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export function SourceCard({ source, onDelete, onRetry }: SourceCardProps) {
  const Icon = sourceTypeIcons[source.type] || sourceTypeIcons.default;
  const statusColor = statusColors[source.status] || statusColors.pending;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/sources/${source.id}`}>
                <CardTitle className="text-base hover:text-blue-600 transition-colors truncate">
                  {source.title}
                </CardTitle>
              </Link>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span className="capitalize">{source.type}</span>
                {source.url && (
                  <>
                    <span>·</span>
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open
                    </a>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {source.url && (
                <DropdownMenuItem asChild>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Original
                  </a>
                </DropdownMenuItem>
              )}
              {source.status === 'failed' && onRetry && (
                <DropdownMenuItem onClick={() => onRetry(source)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Processing
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(source)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {source.metadata?.summary && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {truncate(source.metadata.summary, 150)}
          </p>
        )}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor}`}>
              {source.status === 'processing' && (
                <RefreshCw className="inline-block h-3 w-3 mr-1 animate-spin" />
              )}
              {source.status}
            </span>
            {source.metadata?.wordCount && (
              <span className="text-gray-500">
                {source.metadata.wordCount.toLocaleString()} words
              </span>
            )}
          </div>
          <span className="text-gray-400 text-xs">
            {formatRelativeDate(source.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
