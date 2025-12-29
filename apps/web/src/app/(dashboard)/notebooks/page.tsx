'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Archive, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NotebookCard } from '@/components/notebooks/NotebookCard';
import { CreateNotebookDialog } from '@/components/notebooks/CreateNotebookDialog';
import { EditNotebookDialog } from '@/components/notebooks/EditNotebookDialog';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { useNotebookStore } from '@/lib/stores/notebook-store';
import type { Notebook } from '@/lib/api/types';

export default function NotebooksPage() {
  const router = useRouter();
  const { 
    notebooks, 
    isLoading, 
    fetchNotebooks,
    archiveNotebook,
    unarchiveNotebook,
    deleteNotebook,
  } = useNotebookStore();
  
  const [showCreate, setShowCreate] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);
  const [deletingNotebook, setDeletingNotebook] = useState<Notebook | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchNotebooks(showArchived);
  }, [fetchNotebooks, showArchived]);

  const handleCreateSuccess = useCallback((notebookId: string) => {
    router.push(`/notebooks/${notebookId}`);
  }, [router]);

  const handleArchive = async (notebook: Notebook) => {
    try {
      await archiveNotebook(notebook.id);
    } catch {
      // Error handled by store
    }
  };

  const handleUnarchive = async (notebook: Notebook) => {
    try {
      await unarchiveNotebook(notebook.id);
    } catch {
      // Error handled by store
    }
  };

  const handleDelete = async () => {
    if (!deletingNotebook) return;
    
    setIsDeleting(true);
    try {
      await deleteNotebook(deletingNotebook.id);
      setDeletingNotebook(null);
    } catch {
      // Error handled by store
    } finally {
      setIsDeleting(false);
    }
  };

  const activeNotebooks = notebooks.filter((n) => !n.archived);
  const archivedNotebooks = notebooks.filter((n) => n.archived);
  const displayedNotebooks = showArchived ? archivedNotebooks : activeNotebooks;

  if (isLoading && notebooks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (!showArchived && activeNotebooks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notebooks</h1>
          {archivedNotebooks.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setShowArchived(true)}
            >
              <Archive className="mr-2 h-4 w-4" />
              View Archived ({archivedNotebooks.length})
            </Button>
          )}
        </div>
        
        <EmptyState
          icon={BookOpen}
          title="No notebooks yet"
          description="Create your first notebook to start organizing your research and sources."
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Notebook
            </Button>
          }
        />
        
        <CreateNotebookDialog 
          open={showCreate} 
          onOpenChange={setShowCreate}
          onSuccess={handleCreateSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">
            {showArchived ? 'Archived Notebooks' : 'Notebooks'}
          </h1>
          {!showArchived && activeNotebooks.length > 0 && (
            <span className="text-sm text-gray-500">
              {activeNotebooks.length} notebook{activeNotebooks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showArchived ? (
            <Button 
              variant="outline" 
              onClick={() => setShowArchived(false)}
            >
              Back to Notebooks
            </Button>
          ) : (
            <>
              {archivedNotebooks.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowArchived(true)}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archived ({archivedNotebooks.length})
                </Button>
              )}
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Notebook
              </Button>
            </>
          )}
        </div>
      </div>

      {displayedNotebooks.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="No archived notebooks"
          description="Notebooks you archive will appear here."
          action={
            <Button variant="outline" onClick={() => setShowArchived(false)}>
              Back to Notebooks
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedNotebooks.map((notebook) => (
            <NotebookCard 
              key={notebook.id} 
              notebook={notebook}
              onEdit={setEditingNotebook}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
              onDelete={setDeletingNotebook}
            />
          ))}
        </div>
      )}

      <CreateNotebookDialog 
        open={showCreate} 
        onOpenChange={setShowCreate}
        onSuccess={handleCreateSuccess}
      />
      
      <EditNotebookDialog
        notebook={editingNotebook}
        open={!!editingNotebook}
        onOpenChange={(open) => !open && setEditingNotebook(null)}
      />
      
      <DeleteConfirmDialog
        open={!!deletingNotebook}
        onOpenChange={(open) => !open && setDeletingNotebook(null)}
        title="Delete Notebook"
        itemName={deletingNotebook?.name}
        description={`This will permanently delete "${deletingNotebook?.name}" and all its associated sources. This action cannot be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
