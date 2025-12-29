'use client';

/**
 * Knowledge Graph Node Component
 * 
 * Custom React Flow node for knowledge graph entities.
 * Displays entity information with type-specific styling and icons.
 */
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import {
  User,
  Building2,
  Lightbulb,
  Calendar,
  MapPin,
  FileText,
  Tag,
  CircleDot,
} from 'lucide-react';
import type { GraphNodeData, EntityType } from './types';

// =============================================================================
// Entity Type Config
// =============================================================================

const entityConfig: Record<
  EntityType,
  {
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    borderColor: string;
    textColor: string;
    label: string;
  }
> = {
  person: {
    icon: User,
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-300 dark:border-blue-700',
    textColor: 'text-blue-700 dark:text-blue-300',
    label: 'Person',
  },
  organization: {
    icon: Building2,
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-300 dark:border-purple-700',
    textColor: 'text-purple-700 dark:text-purple-300',
    label: 'Organization',
  },
  concept: {
    icon: Lightbulb,
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    borderColor: 'border-amber-300 dark:border-amber-700',
    textColor: 'text-amber-700 dark:text-amber-300',
    label: 'Concept',
  },
  event: {
    icon: Calendar,
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-300 dark:border-green-700',
    textColor: 'text-green-700 dark:text-green-300',
    label: 'Event',
  },
  location: {
    icon: MapPin,
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-300 dark:border-red-700',
    textColor: 'text-red-700 dark:text-red-300',
    label: 'Location',
  },
  document: {
    icon: FileText,
    bgColor: 'bg-slate-50 dark:bg-slate-950',
    borderColor: 'border-slate-300 dark:border-slate-700',
    textColor: 'text-slate-700 dark:text-slate-300',
    label: 'Document',
  },
  topic: {
    icon: Tag,
    bgColor: 'bg-teal-50 dark:bg-teal-950',
    borderColor: 'border-teal-300 dark:border-teal-700',
    textColor: 'text-teal-700 dark:text-teal-300',
    label: 'Topic',
  },
};

// =============================================================================
// Component
// =============================================================================

export const GraphNode = memo(function GraphNode({
  data,
  selected,
}: NodeProps<GraphNodeData>) {
  const config = entityConfig[data.entityType] || {
    icon: CircleDot,
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    borderColor: 'border-gray-300 dark:border-gray-700',
    textColor: 'text-gray-700 dark:text-gray-300',
    label: 'Entity',
  };

  const Icon = config.icon;
  const importance = data.importance || 0.5;
  
  // Scale size based on importance (0-1)
  const baseSize = 80;
  const size = baseSize + importance * 40; // 80-120px

  return (
    <>
      {/* Connection handles on all sides */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-0 !w-4 !h-2"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-transparent !border-0 !w-2 !h-4"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-transparent !border-0 !w-4 !h-2"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-transparent !border-0 !w-2 !h-4"
      />

      {/* Node content */}
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-full border-2 transition-all duration-200',
          config.bgColor,
          config.borderColor,
          selected && 'ring-2 ring-primary ring-offset-2',
          'hover:shadow-lg cursor-pointer'
        )}
        style={{
          width: size,
          height: size,
        }}
      >
        {/* Icon */}
        <Icon className={cn('w-6 h-6 mb-1', config.textColor)} />

        {/* Label */}
        <div
          className={cn(
            'text-xs font-medium text-center px-2 truncate max-w-full',
            config.textColor
          )}
          style={{ maxWidth: size - 16 }}
          title={data.label}
        >
          {data.label}
        </div>

        {/* Confidence indicator */}
        {data.confidence !== undefined && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[10px] bg-background border"
            title={`Confidence: ${Math.round(data.confidence * 100)}%`}
          >
            {Math.round(data.confidence * 100)}%
          </div>
        )}

        {/* Relationship count badge */}
        {data.relationshipCount !== undefined && data.relationshipCount > 0 && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium"
            title={`${data.relationshipCount} relationships`}
          >
            {data.relationshipCount}
          </div>
        )}
      </div>
    </>
  );
});

export default GraphNode;
