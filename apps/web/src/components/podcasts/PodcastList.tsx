/**
 * Podcast List Component
 * 
 * Displays a list of generated podcasts with status, progress, and playback controls.
 */
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Mic,
  Play,
  Pause,
  Trash2,
  Download,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export interface Podcast {
  id: string;
  title: string;
  status: 'pending' | 'script_generating' | 'script_ready' | 'audio_generating' | 'processing' | 'completed' | 'failed';
  sourceIds: string[];
  audioUrl?: string;
  duration?: number;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
  scriptPreview?: string;
  progress?: number;
  stage?: string;
}

interface PodcastListProps {
  podcasts: Podcast[];
  isLoading?: boolean;
  onPlay?: (podcast: Podcast) => void;
  onDelete?: (podcastId: string) => void;
  onRetry?: (podcastId: string) => void;
  onDownload?: (podcast: Podcast) => void;
  onViewScript?: (podcast: Podcast) => void;
  currentlyPlaying?: string | null;
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusIcon(status: Podcast['status']) {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    case 'script_generating':
    case 'audio_generating':
    case 'processing':
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    case 'script_ready':
      return <CheckCircle2 className="h-4 w-4 text-yellow-500" />;
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
}

function getStatusLabel(status: Podcast['status']): string {
  const labels: Record<Podcast['status'], string> = {
    pending: 'Pending',
    script_generating: 'Generating Script',
    script_ready: 'Script Ready',
    audio_generating: 'Generating Audio',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  };
  return labels[status] || status;
}

function getStatusVariant(status: Podcast['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'script_generating':
    case 'audio_generating':
    case 'processing':
      return 'secondary';
    default:
      return 'outline';
  }
}

// =============================================================================
// Podcast Card Component
// =============================================================================

interface PodcastCardProps {
  podcast: Podcast;
  isPlaying?: boolean;
  onPlay?: () => void;
  onDelete?: () => void;
  onRetry?: () => void;
  onDownload?: () => void;
  onViewScript?: () => void;
}

function PodcastCard({
  podcast,
  isPlaying,
  onPlay,
  onDelete,
  onRetry,
  onDownload,
  onViewScript,
}: PodcastCardProps) {
  const isGenerating = ['script_generating', 'audio_generating', 'processing'].includes(podcast.status);
  const isCompleted = podcast.status === 'completed';
  const isFailed = podcast.status === 'failed';
  
  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      isPlaying && 'ring-2 ring-primary',
      isFailed && 'border-red-200 bg-red-50/50',
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="shrink-0 p-2 rounded-lg bg-primary/10">
              <Mic className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{podcast.title}</CardTitle>
              <CardDescription className="text-xs">
                {format(new Date(podcast.createdAt), 'MMM d, yyyy h:mm a')}
              </CardDescription>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {podcast.scriptPreview && (
                <DropdownMenuItem onClick={onViewScript}>
                  View Script
                </DropdownMenuItem>
              )}
              {isCompleted && (
                <DropdownMenuItem onClick={onDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
              )}
              {isFailed && (
                <DropdownMenuItem onClick={onRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Status and Progress */}
        <div className="flex items-center gap-2 mb-3">
          {getStatusIcon(podcast.status)}
          <Badge variant={getStatusVariant(podcast.status)}>
            {getStatusLabel(podcast.status)}
          </Badge>
          
          {isCompleted && podcast.duration && (
            <span className="text-xs text-muted-foreground ml-auto">
              {formatDuration(podcast.duration)}
            </span>
          )}
          
          {isCompleted && podcast.fileSize && (
            <span className="text-xs text-muted-foreground">
              {formatFileSize(podcast.fileSize)}
            </span>
          )}
        </div>
        
        {/* Progress Bar for Generating */}
        {isGenerating && podcast.progress !== undefined && (
          <div className="space-y-1 mb-3">
            <Progress value={podcast.progress * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {podcast.stage || 'Processing...'} ({Math.round(podcast.progress * 100)}%)
            </p>
          </div>
        )}
        
        {/* Error Message */}
        {isFailed && podcast.errorMessage && (
          <div className="p-2 rounded-md bg-red-100 text-red-700 text-xs mb-3">
            {podcast.errorMessage}
          </div>
        )}
        
        {/* Script Preview */}
        {podcast.scriptPreview && (
          <div className="p-2 rounded-md bg-muted/50 text-xs text-muted-foreground line-clamp-2 mb-3">
            {podcast.scriptPreview}
          </div>
        )}
        
        {/* Source Count */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {podcast.sourceIds.length} source{podcast.sourceIds.length !== 1 ? 's' : ''}
          </span>
          
          {/* Play Button */}
          {isCompleted && podcast.audioUrl && (
            <Button
              size="sm"
              onClick={onPlay}
              className="gap-1"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Play
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function PodcastList({
  podcasts,
  isLoading,
  onPlay,
  onDelete,
  onRetry,
  onDownload,
  onViewScript,
  currentlyPlaying,
}: PodcastListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-6 w-24 bg-muted rounded mb-3" />
              <div className="h-8 w-full bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (podcasts.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Mic className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No podcasts yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Generate your first podcast by selecting source documents and clicking &quot;Create Podcast&quot;.
          </p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {podcasts.map((podcast) => (
        <PodcastCard
          key={podcast.id}
          podcast={podcast}
          isPlaying={currentlyPlaying === podcast.id}
          onPlay={() => onPlay?.(podcast)}
          onDelete={() => onDelete?.(podcast.id)}
          onRetry={() => onRetry?.(podcast.id)}
          onDownload={() => onDownload?.(podcast)}
          onViewScript={() => onViewScript?.(podcast)}
        />
      ))}
    </div>
  );
}

export default PodcastList;
