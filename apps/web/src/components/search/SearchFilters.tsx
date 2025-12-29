/**
 * SearchFilters - Filter controls for search results
 */
'use client';

import { Filter, X, Calendar, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { SearchFilters as SearchFiltersType } from '@/lib/api/search';
import type { SourceType } from '@/lib/api/types';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  className?: string;
}

const entityTypeOptions: { value: 'source' | 'note' | 'insight'; label: string }[] = [
  { value: 'source', label: 'Sources' },
  { value: 'note', label: 'Notes' },
  { value: 'insight', label: 'Insights' },
];

const sourceTypeOptions: { value: SourceType; label: string }[] = [
  { value: 'url', label: 'Web Pages' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'document', label: 'Documents' },
  { value: 'text', label: 'Text' },
];

export function SearchFilters({
  filters,
  onFiltersChange,
  className,
}: SearchFiltersProps) {
  const activeFilterCount =
    (filters.entityTypes?.length || 0) +
    (filters.sourceTypes?.length || 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  const handleEntityTypeToggle = (entityType: 'source' | 'note' | 'insight') => {
    const current = filters.entityTypes || [];
    const updated = current.includes(entityType)
      ? current.filter((t) => t !== entityType)
      : [...current, entityType];
    onFiltersChange({
      ...filters,
      entityTypes: updated.length > 0 ? updated : undefined,
    });
  };

  const handleSourceTypeToggle = (sourceType: SourceType) => {
    const current = filters.sourceTypes || [];
    const updated = current.includes(sourceType)
      ? current.filter((t) => t !== sourceType)
      : [...current, sourceType];
    onFiltersChange({
      ...filters,
      sourceTypes: updated.length > 0 ? updated : undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Content Type</DropdownMenuLabel>
            {entityTypeOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.entityTypes?.includes(option.value)}
                onCheckedChange={() => handleEntityTypeToggle(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Source Type</DropdownMenuLabel>
            {sourceTypeOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.sourceTypes?.includes(option.value)}
                onCheckedChange={() => handleSourceTypeToggle(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active Filter Badges */}
        {filters.entityTypes?.map((type) => (
          <Badge key={type} variant="secondary" className="gap-1">
            {entityTypeOptions.find((o) => o.value === type)?.label}
            <button
              onClick={() => handleEntityTypeToggle(type)}
              className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {filters.sourceTypes?.map((type) => (
          <Badge key={type} variant="outline" className="gap-1">
            <FileType className="h-3 w-3" />
            {sourceTypeOptions.find((o) => o.value === type)?.label}
            <button
              onClick={() => handleSourceTypeToggle(type)}
              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500"
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}

export default SearchFilters;
