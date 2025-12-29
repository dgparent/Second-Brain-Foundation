/**
 * Mind Map Edge Component
 * 
 * Custom edge component for React Flow mind maps.
 */
'use client';

import { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { cn } from '@/lib/utils';
import type { MindMapEdgeData } from './types';

// =============================================================================
// Edge Styling
// =============================================================================

const edgeStyles: Record<string, string> = {
  solid: '',
  dashed: '5,5',
  dotted: '2,2',
};

// =============================================================================
// Component
// =============================================================================

export const MindMapEdge = memo(function MindMapEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<MindMapEdgeData>) {
  const style = data?.style || 'solid';
  const strength = data?.strength || 1;
  const label = data?.label;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  // Calculate stroke width based on strength
  const strokeWidth = Math.max(1, Math.min(4, strength * 2));

  return (
    <>
      {/* Invisible wider path for easier selection */}
      <path
        id={`${id}-hitbox`}
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
      />

      {/* Actual edge path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={selected ? '#6366f1' : '#94a3b8'}
        strokeWidth={strokeWidth}
        strokeDasharray={edgeStyles[style]}
        strokeLinecap="round"
        markerEnd={markerEnd}
        className={cn(
          'transition-all duration-200',
          selected && 'filter drop-shadow-md'
        )}
      />

      {/* Edge label */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={cn(
              'px-2 py-0.5 rounded text-xs bg-white border shadow-sm',
              selected ? 'border-primary' : 'border-gray-200'
            )}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

export default MindMapEdge;
