'use client';

/**
 * Knowledge Graph Edge Component
 * 
 * Custom React Flow edge for relationship visualization.
 * Shows relationship type labels and directional arrows.
 */
import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  getBezierPath,
} from 'reactflow';
import { cn } from '@/lib/utils';
import type { GraphEdgeData, RelationType } from './types';

// =============================================================================
// Relation Type Config
// =============================================================================

const relationConfig: Record<
  RelationType,
  {
    color: string;
    label: string;
    strokeDasharray?: string;
  }
> = {
  mentions: {
    color: '#94a3b8', // slate
    label: 'mentions',
    strokeDasharray: '5,5',
  },
  related_to: {
    color: '#3b82f6', // blue
    label: 'related to',
  },
  part_of: {
    color: '#8b5cf6', // violet
    label: 'part of',
  },
  caused_by: {
    color: '#ef4444', // red
    label: 'caused by',
  },
  leads_to: {
    color: '#22c55e', // green
    label: 'leads to',
  },
  associated_with: {
    color: '#f59e0b', // amber
    label: 'associated with',
  },
  contrasts_with: {
    color: '#ec4899', // pink
    label: 'contrasts with',
    strokeDasharray: '3,3',
  },
  supports: {
    color: '#14b8a6', // teal
    label: 'supports',
  },
  opposes: {
    color: '#f97316', // orange
    label: 'opposes',
    strokeDasharray: '8,4',
  },
};

// =============================================================================
// Component
// =============================================================================

export const GraphEdge = memo(function GraphEdge({
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
}: EdgeProps<GraphEdgeData>) {
  const config = data?.relationType
    ? relationConfig[data.relationType] || {
        color: '#94a3b8',
        label: data.relationType,
      }
    : { color: '#94a3b8', label: '' };

  // Calculate path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  // Calculate stroke width based on weight
  const weight = data?.weight ?? 0.5;
  const strokeWidth = 1 + weight * 2; // 1-3px

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

      {/* Visible edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? 'hsl(var(--primary))' : config.color,
          strokeWidth: selected ? strokeWidth + 1 : strokeWidth,
          strokeDasharray: config.strokeDasharray,
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />

      {/* Edge label */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            className={cn(
              'absolute px-2 py-0.5 rounded text-xs font-medium pointer-events-auto',
              'bg-background/90 backdrop-blur-sm border shadow-sm',
              'transform -translate-x-1/2 -translate-y-1/2',
              selected && 'ring-1 ring-primary'
            )}
            style={{
              left: labelX,
              top: labelY,
              color: config.color,
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Show relationship type on hover (if no custom label) */}
      {!data?.label && data?.relationType && (
        <EdgeLabelRenderer>
          <div
            className={cn(
              'absolute px-1.5 py-0.5 rounded text-[10px] opacity-0 hover:opacity-100',
              'bg-background/90 backdrop-blur-sm border',
              'transform -translate-x-1/2 -translate-y-1/2 transition-opacity',
              'pointer-events-none'
            )}
            style={{
              left: labelX,
              top: labelY,
              color: config.color,
            }}
          >
            {config.label}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Direction indicator (small arrow marker) */}
      {data?.isDirectional && (
        <defs>
          <marker
            id={`arrow-${id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill={selected ? 'hsl(var(--primary))' : config.color}
            />
          </marker>
        </defs>
      )}
    </>
  );
});

export default GraphEdge;
