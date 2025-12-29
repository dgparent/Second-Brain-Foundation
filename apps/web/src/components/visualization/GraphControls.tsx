'use client';

/**
 * Knowledge Graph Controls Component
 * 
 * Toolbar for knowledge graph operations including filtering, layout, and export.
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  LayoutGrid,
  Download,
  Filter,
  RefreshCw,
  User,
  Building2,
  Lightbulb,
  Calendar,
  MapPin,
  FileText,
  Tag,
} from 'lucide-react';
import type { EntityType } from './types';

// =============================================================================
// Types
// =============================================================================

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onRecenter: () => void;
  onLayoutChange: (layout: 'dagre' | 'radial' | 'force') => void;
  onExport: (format: 'png' | 'svg' | 'json') => void;
  onFilterChange: (types: EntityType[]) => void;
  onRefresh?: () => void;
  currentLayout: 'dagre' | 'radial' | 'force';
  activeFilters: EntityType[];
  className?: string;
}

// =============================================================================
// Entity Type Icons
// =============================================================================

const entityTypeIcons: Record<EntityType, React.ComponentType<{ className?: string }>> = {
  person: User,
  organization: Building2,
  concept: Lightbulb,
  event: Calendar,
  location: MapPin,
  document: FileText,
  topic: Tag,
};

const entityTypeLabels: Record<EntityType, string> = {
  person: 'People',
  organization: 'Organizations',
  concept: 'Concepts',
  event: 'Events',
  location: 'Locations',
  document: 'Documents',
  topic: 'Topics',
};

const allEntityTypes: EntityType[] = [
  'person',
  'organization',
  'concept',
  'event',
  'location',
  'document',
  'topic',
];

// =============================================================================
// Component
// =============================================================================

export function GraphControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  onRecenter,
  onLayoutChange,
  onExport,
  onFilterChange,
  onRefresh,
  currentLayout,
  activeFilters,
  className,
}: GraphControlsProps) {
  const handleFilterToggle = (type: EntityType) => {
    if (activeFilters.includes(type)) {
      onFilterChange(activeFilters.filter((t) => t !== type));
    } else {
      onFilterChange([...activeFilters, type]);
    }
  };

  const handleSelectAll = () => {
    onFilterChange([...allEntityTypes]);
  };

  const handleClearAll = () => {
    onFilterChange([]);
  };

  return (
    <TooltipProvider>
      <div
        className={`flex items-center gap-1 p-1.5 bg-background/95 backdrop-blur-sm rounded-lg border shadow-sm ${className}`}
      >
        {/* Zoom controls */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom in</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom out</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onFitView}>
              <Maximize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fit view</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Layout dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Layout</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Graph Layout</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onLayoutChange('dagre')}
              className={currentLayout === 'dagre' ? 'bg-accent' : ''}
            >
              Hierarchical
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onLayoutChange('radial')}
              className={currentLayout === 'radial' ? 'bg-accent' : ''}
            >
              Radial
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onLayoutChange('force')}
              className={currentLayout === 'force' ? 'bg-accent' : ''}
            >
              Force-directed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={activeFilters.length > 0 ? 'text-primary' : ''}
                >
                  <Filter className="h-4 w-4" />
                  {activeFilters.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                      {activeFilters.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Filter entities</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Entity Types</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allEntityTypes.map((type) => {
              const Icon = entityTypeIcons[type];
              return (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={activeFilters.length === 0 || activeFilters.includes(type)}
                  onCheckedChange={() => handleFilterToggle(type)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {entityTypeLabels[type]}
                </DropdownMenuCheckboxItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSelectAll}>
              Select all
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleClearAll}>
              Clear all
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Export dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Export</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Export Graph</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onExport('png')}>
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('svg')}>
              Export as SVG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('json')}>
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Refresh button */}
        {onRefresh && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh graph</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

export default GraphControls;
