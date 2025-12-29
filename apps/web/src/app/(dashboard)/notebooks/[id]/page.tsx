'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Archive, 
  Trash2, 
  FileText,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditNotebookDialog } from '@/components/notebooks/EditNotebookDialog';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { useNotebookStore } from '@/lib/stores/notebook-store';
import { sourceApi } from '@/lib/api';
import { formatRelativeDate, formatDate } from '@/lib/utils';
import type { Source } from '@/lib/api/types';

export default function NotebookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const notebookId = params.id as string;
  
  const { 
    currentNotebook, 
    isLoading, 
    fetchNotebook, 
    archiveNotebook,
    deleteNotebook,
    clearCurrentNotebook,
  } = useNotebookStore();
  
  const [sources, setSources] = useState<Source[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchNotebook(notebookId);
    
    // Fetch sources for this notebook
    const loadSources = async () => {
      try {
        const response = await sourceApi.list({ notebookId });
        setSources(response.data);
      } catch (error) {
        console.error('Failed to load sources:', error);
      } finally {
        setSourcesLoading(false);
      }
    };
    loadSources();

    return () => {
      clearCurrentNotebook();
    };
  }, [notebookId, fetchNotebook, clearCurrentNotebook]);

  const handleArchive = async () => {
    try {
      await archiveNotebook(notebookId);
      router.push('/notebooks');
    } catch {
      // Error handled by store
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNotebook(notebookId);
      router.push('/notebooks');
    } catch {
      // Error handled by store
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !currentNotebook) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/notebooks">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{currentNotebook.name}</h1>
            {currentNotebook.description && (
              <p className="text-gray-500 mt-1">{currentNotebook.description}</p>
            )}
            <p className="text-sm text-gray-400 mt-2">
              Created {formatDate(currentNotebook.createdAt)} · 
              Updated {formatRelativeDate(currentNotebook.updatedAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/notebooks/${notebookId}/sources/add`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Source
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEdit(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Notebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDelete(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sources Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sources</h2>
          <span className="text-sm text-gray-500">
            {sources.length} source{sources.length !== 1 ? 's' : ''}
          </span>
        </div>

        {sourcesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : sources.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No sources yet"
            description="Add sources to this notebook to start building your knowledge base."
            action={
              <Link href={`/notebooks/${notebookId}/sources/add`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Source
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {sources.map((source) => (
              <Card key={source.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
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
                              className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Source
                            </a>
                          </>
                        )}
                      </CardDescription>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatRelativeDate(source.createdAt)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span 
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        source.status === 'processed' 
                          ? 'bg-green-100 text-green-700' 
                          : source.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {source.status}
                    </span>
                    {source.metadata?.wordCount && (
                      <span>{source.metadata.wordCount.toLocaleString()} words</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EditNotebookDialog
        notebook={currentNotebook}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
      
      <DeleteConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Notebook"
        itemName={currentNotebook.name}
        description={`This will permanently delete "${currentNotebook.name}" and all its associated sources. This action cannot be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
