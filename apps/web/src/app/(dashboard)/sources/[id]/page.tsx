'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ExternalLink, 
  Trash2, 
  RefreshCw,
  FileText,
  Globe,
  Clock,
  Hash,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { useSourceStore } from '@/lib/stores/source-store';
import { sourceApi } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, formatRelativeDate } from '@/lib/utils';
import type { SourceInsight } from '@/lib/api/types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  processed: 'bg-green-100 text-green-700 border-green-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
};

export default function SourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sourceId = params.id as string;
  const { toast } = useToast();
  
  const { 
    currentSource, 
    isLoading, 
    fetchSource, 
    deleteSource,
    retryProcessing,
    clearCurrentSource,
  } = useSourceStore();
  
  const [insights, setInsights] = useState<SourceInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSource(sourceId);
    
    // Fetch insights for this source
    const loadInsights = async () => {
      try {
        const data = await sourceApi.getInsights(sourceId);
        setInsights(data);
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setInsightsLoading(false);
      }
    };
    loadInsights();

    return () => {
      clearCurrentSource();
    };
  }, [sourceId, fetchSource, clearCurrentSource]);

  const handleRetry = async () => {
    try {
      await retryProcessing(sourceId);
      toast({
        title: 'Processing started',
        description: 'The source is being reprocessed.',
      });
    } catch {
      toast({
        title: 'Failed to retry',
        description: 'Could not start reprocessing. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSource(sourceId);
      toast({
        title: 'Source deleted',
        description: 'The source has been permanently deleted.',
      });
      router.push('/sources');
    } catch {
      toast({
        title: 'Failed to delete',
        description: 'Could not delete the source. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !currentSource) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const statusColor = statusColors[currentSource.status] || statusColors.pending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/sources">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{currentSource.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm border ${statusColor}`}>
                {currentSource.status === 'processing' && (
                  <RefreshCw className="inline-block h-3 w-3 mr-1 animate-spin" />
                )}
                {currentSource.status}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="capitalize flex items-center gap-1">
                {currentSource.type === 'url' ? (
                  <Globe className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {currentSource.type}
              </span>
              {currentSource.url && (
                <a 
                  href={currentSource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Original
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {currentSource.status === 'failed' && (
            <Button variant="outline" onClick={handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Processing
            </Button>
          )}
          <Button variant="destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Metadata Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Added
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{formatDate(currentSource.createdAt)}</p>
            <p className="text-sm text-gray-500">{formatRelativeDate(currentSource.createdAt)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Word Count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {currentSource.metadata?.wordCount?.toLocaleString() || 'N/A'}
            </p>
            <p className="text-sm text-gray-500">words</p>
          </CardContent>
        </Card>
        
        {currentSource.notebookId && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Notebook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                href={`/notebooks/${currentSource.notebookId}`}
                className="font-medium text-blue-600 hover:underline"
              >
                View Notebook
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary */}
      {currentSource.metadata?.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">
              {currentSource.metadata.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5" />
            Key Insights
          </CardTitle>
          <CardDescription>
            AI-generated insights extracted from this source
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insightsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {currentSource.status === 'processed' ? (
                <p>No insights generated for this source.</p>
              ) : currentSource.status === 'processing' ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <p>Insights are being generated...</p>
                </div>
              ) : currentSource.status === 'failed' ? (
                <div className="flex flex-col items-center gap-2">
                  <p>Processing failed. Try reprocessing the source.</p>
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </div>
              ) : (
                <p>Source is pending processing.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div 
                  key={insight.id || index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{insight.title}</p>
                      {insight.content && (
                        <p className="text-sm text-gray-600 mt-1">{insight.content}</p>
                      )}
                      {insight.tags && insight.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {insight.tags.map((tag) => (
                            <span 
                              key={tag}
                              className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Source"
        itemName={currentSource.title}
        description={`This will permanently delete "${currentSource.title}" and all its associated data including insights. This action cannot be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
