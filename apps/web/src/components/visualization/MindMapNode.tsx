/**
 * Mind Map Node Component
 * 
 * Custom node component for React Flow mind maps.
 */
'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ChevronDown, ChevronRight, FileText, Lightbulb, BookOpen, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MindMapNodeData, MindMapNodeType } from './types';

// =============================================================================
// Node Styling
// =============================================================================

const nodeColors: Record<MindMapNodeType, string> = {
  root: 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-200',
  topic: 'bg-blue-500 text-white border-blue-600 shadow-blue-200',
  subtopic: 'bg-teal-400 text-white border-teal-500 shadow-teal-200',
  detail: 'bg-gray-100 text-gray-800 border-gray-300 shadow-gray-100',
};

const nodeSizes: Record<MindMapNodeType, string> = {
  root: 'px-6 py-3 text-lg font-bold min-w-[180px]',
  topic: 'px-4 py-2 text-base font-semibold min-w-[140px]',
  subtopic: 'px-3 py-1.5 text-sm font-medium min-w-[120px]',
  detail: 'px-3 py-1.5 text-xs min-w-[100px]',
};

const nodeIcons: Record<MindMapNodeType, typeof FileText> = {
  root: Target,
  topic: Lightbulb,
  subtopic: BookOpen,
  detail: FileText,
};

// =============================================================================
// Component
// =============================================================================

export const MindMapNode = memo(function MindMapNode({
  data,
  isConnectable,
  selected,
}: NodeProps<MindMapNodeData>) {
  const { label, type, isExpanded, childCount, description, icon } = data;
  const IconComponent = nodeIcons[type];

  return (
    <div
      className={cn(
        'rounded-lg border-2 shadow-md transition-all duration-200',
        'hover:shadow-lg cursor-pointer',
        nodeColors[type],
        nodeSizes[type],
        selected && 'ring-2 ring-offset-2 ring-primary shadow-lg scale-105'
      )}
      title={description}
    >
      {/* Input handle - not for root */}
      {type !== 'root' && (
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
        />
      )}

      <div className="flex items-center gap-2">
        {/* Icon */}
        {type === 'root' && IconComponent && (
          <IconComponent className="h-5 w-5 shrink-0 opacity-80" />
        )}

        {/* Expand/collapse indicator */}
        {childCount && childCount > 0 && (
          <span className="opacity-70 shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        )}

        {/* Label */}
        <span className="truncate max-w-[180px]">{label}</span>

        {/* Child count badge */}
        {!isExpanded && childCount && childCount > 0 && (
          <span
            className={cn(
              'text-xs px-1.5 py-0.5 rounded-full shrink-0',
              type === 'detail'
                ? 'bg-gray-300 text-gray-700'
                : 'bg-white/20 text-inherit'
            )}
          >
            +{childCount}
          </span>
        )}
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
});

export default MindMapNode;
