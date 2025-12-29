/**
 * Mind Map Controls Component
 * 
 * Toolbar for mind map operations like export, zoom, and layout.
 */
'use client';

import {
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Grid,
  Layout,
  Circle,
  Image,
  FileJson,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ExportFormat, LayoutDirection } from './types';

// =============================================================================
// Types
// =============================================================================

interface MindMapControlsProps {
  onExport?: (format: ExportFormat) => void;
  onFitView?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRecenter?: () => void;
  onLayoutChange?: (direction: LayoutDirection) => void;
  onLayoutTypeChange?: (type: 'dagre' | 'radial') => void;
  currentLayout?: LayoutDirection;
  showLayoutOptions?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function MindMapControls({
  onExport,
  onFitView,
  onZoomIn,
  onZoomOut,
  onRecenter,
  onLayoutChange,
  onLayoutTypeChange,
  currentLayout = 'LR',
  showLayoutOptions = true,
}: MindMapControlsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 p-1 bg-white rounded-lg border shadow-sm">
        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 pr-2 border-r">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onZoomIn}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom in</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onZoomOut}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom out</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onFitView}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit to view</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onRecenter}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset view</TooltipContent>
          </Tooltip>
        </div>

        {/* Layout Options */}
        {showLayoutOptions && (
          <div className="flex items-center gap-0.5 px-2 border-r">
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Layout className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Layout direction</TooltipContent>
              </Tooltip>
              <DropdownMenuContent>
                <DropdownMenuLabel>Layout Direction</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onLayoutChange?.('LR')}
                  className={currentLayout === 'LR' ? 'bg-accent' : ''}
                >
                  <Grid className="h-4 w-4 mr-2 rotate-90" />
                  Left to Right
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onLayoutChange?.('TB')}
                  className={currentLayout === 'TB' ? 'bg-accent' : ''}
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Top to Bottom
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onLayoutChange?.('RL')}
                  className={currentLayout === 'RL' ? 'bg-accent' : ''}
                >
                  <Grid className="h-4 w-4 mr-2 -rotate-90" />
                  Right to Left
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onLayoutChange?.('BT')}
                  className={currentLayout === 'BT' ? 'bg-accent' : ''}
                >
                  <Grid className="h-4 w-4 mr-2 rotate-180" />
                  Bottom to Top
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Layout Type</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onLayoutTypeChange?.('dagre')}>
                  <Layout className="h-4 w-4 mr-2" />
                  Hierarchical
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLayoutTypeChange?.('radial')}>
                  <Circle className="h-4 w-4 mr-2" />
                  Radial
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Export Options */}
        <div className="flex items-center gap-0.5 pl-1">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Export</TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExport?.('png')}>
                <Image className="h-4 w-4 mr-2" />
                PNG Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.('svg')}>
                <Image className="h-4 w-4 mr-2" />
                SVG Vector
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                PDF Document
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExport?.('json')}>
                <FileJson className="h-4 w-4 mr-2" />
                JSON Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default MindMapControls;
