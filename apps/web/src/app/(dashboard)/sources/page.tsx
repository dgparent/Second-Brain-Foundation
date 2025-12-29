'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Filter, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SourceCard } from '@/components/sources/SourceCard';
import { AddSourceDialog } from '@/components/sources/AddSourceDialog';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { useSourceStore } from '@/lib/stores/source-store';
import { useToast } from '@/components/ui/use-toast';
import type { Source } from '@/lib/api/types';

const SOURCE_TYPES = ['url', 'pdf', 'document', 'youtube'];
const SOURCE_STATUSES = ['pending', 'processing', 'processed', 'failed'];

export default function SourcesPage() {
  const { 
    sources, 
    isLoading, 
    fetchSources,
    deleteSource,
    retryProcessing,
    filters,
    setFilters,
  } = useSourceStore();
  const { toast } = useToast();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deletingSource, setDeletingSource] = useState<Source | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const handleRetry = async (source: Source) => {
    try {
      await retryProcessing(source.id);
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
    if (!deletingSource) return;
    
    setIsDeleting(true);
    try {
      await deleteSource(deletingSource.id);
      toast({
        title: 'Source deleted',
        description: 'The source has been permanently deleted.',
      });
      setDeletingSource(null);
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

  const handleTypeFilterChange = (type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...typeFilter, type]
      : typeFilter.filter((t) => t !== type);
    setTypeFilter(newTypes);
    setFilters({ ...filters, type: newTypes.length ? newTypes.join(',') : undefined });
  };

  const handleStatusFilterChange = (status: string, checked: boolean) => {
    const newStatuses = checked 
      ? [...statusFilter, status]
      : statusFilter.filter((s) => s !== status);
    setStatusFilter(newStatuses);
    setFilters({ ...filters, status: newStatuses.length ? newStatuses.join(',') : undefined });
  };

  const clearFilters = () => {
    setTypeFilter([]);
    setStatusFilter([]);
    setFilters({});
  };

  const hasActiveFilters = typeFilter.length > 0 || statusFilter.length > 0;

  // Filter sources locally for quick filtering
  const filteredSources = sources.filter((source) => {
    if (typeFilter.length > 0 && !typeFilter.includes(source.type)) return false;
    if (statusFilter.length > 0 && !statusFilter.includes(source.status)) return false;
    return true;
  });

  if (isLoading && sources.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      </div>
    );
  }

  if (sources.length === 0 && !hasActiveFilters) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Sources</h1>
        </div>
        
        <EmptyState
          icon={FileText}
          title="No sources yet"
          description="Add your first source to start building your knowledge base."
          action={
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Source
            </Button>
          }
        />
        
        <AddSourceDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Sources</h1>
          <span className="text-sm text-gray-500">
            {filteredSources.length} source{filteredSources.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {hasActiveFilters && (
                  <span className="ml-1 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs">
                    {typeFilter.length + statusFilter.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Type</DropdownMenuLabel>
              {SOURCE_TYPES.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={typeFilter.includes(type)}
                  onCheckedChange={(checked) => handleTypeFilterChange(type, checked)}
                >
                  <span className="capitalize">{type}</span>
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {SOURCE_STATUSES.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={(checked) => handleStatusFilterChange(status, checked)}
                >
                  <span className="capitalize">{status}</span>
                </DropdownMenuCheckboxItem>
              ))}
              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator />
                  <button
                    onClick={clearFilters}
                    className="w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Clear filters
                  </button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Button>
        </div>
      </div>

      {filteredSources.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No matching sources"
          description="No sources match your current filters."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSources.map((source) => (
            <SourceCard 
              key={source.id} 
              source={source}
              onDelete={setDeletingSource}
              onRetry={handleRetry}
            />
          ))}
        </div>
      )}

      <AddSourceDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
      
      <DeleteConfirmDialog
        open={!!deletingSource}
        onOpenChange={(open) => !open && setDeletingSource(null)}
        title="Delete Source"
        itemName={deletingSource?.title}
        description={`This will permanently delete "${deletingSource?.title}" and all its associated data. This action cannot be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
