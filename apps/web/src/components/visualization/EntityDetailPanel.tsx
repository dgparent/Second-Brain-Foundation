'use client';

/**
 * Entity Detail Panel Component
 * 
 * Sidebar panel showing detailed information about a selected entity
 * in the knowledge graph, including relationships and properties.
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  X,
  User,
  Building2,
  Lightbulb,
  Calendar,
  MapPin,
  FileText,
  Tag,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Link2,
} from 'lucide-react';
import type { GraphEntity, GraphRelation, EntityType, RelationType } from './types';

// =============================================================================
// Types
// =============================================================================

interface EntityDetailPanelProps {
  entity: GraphEntity | null;
  relations: GraphRelation[];
  allEntities: GraphEntity[];
  onClose: () => void;
  onEntityClick: (entityId: string) => void;
  className?: string;
}

// =============================================================================
// Entity Type Config
// =============================================================================

const entityTypeConfig: Record<
  EntityType,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    label: string;
  }
> = {
  person: { icon: User, color: 'bg-blue-100 text-blue-700', label: 'Person' },
  organization: { icon: Building2, color: 'bg-purple-100 text-purple-700', label: 'Organization' },
  concept: { icon: Lightbulb, color: 'bg-amber-100 text-amber-700', label: 'Concept' },
  event: { icon: Calendar, color: 'bg-green-100 text-green-700', label: 'Event' },
  location: { icon: MapPin, color: 'bg-red-100 text-red-700', label: 'Location' },
  document: { icon: FileText, color: 'bg-slate-100 text-slate-700', label: 'Document' },
  topic: { icon: Tag, color: 'bg-teal-100 text-teal-700', label: 'Topic' },
};

const relationTypeLabels: Record<RelationType, string> = {
  mentions: 'Mentions',
  related_to: 'Related to',
  part_of: 'Part of',
  caused_by: 'Caused by',
  leads_to: 'Leads to',
  associated_with: 'Associated with',
  contrasts_with: 'Contrasts with',
  supports: 'Supports',
  opposes: 'Opposes',
};

// =============================================================================
// Component
// =============================================================================

export function EntityDetailPanel({
  entity,
  relations,
  allEntities,
  onClose,
  onEntityClick,
  className,
}: EntityDetailPanelProps) {
  if (!entity) {
    return null;
  }

  const config = entityTypeConfig[entity.type] || {
    icon: Tag,
    color: 'bg-gray-100 text-gray-700',
    label: 'Entity',
  };

  const Icon = config.icon;

  // Get incoming and outgoing relations
  const outgoingRelations = relations.filter((r) => r.sourceId === entity.id);
  const incomingRelations = relations.filter((r) => r.targetId === entity.id);

  // Get related entities
  const getEntity = (id: string) => allEntities.find((e) => e.id === id);

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-background border-l',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg', config.color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{entity.name}</h3>
            <Badge variant="secondary" className="mt-1">
              {config.label}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Description */}
          {entity.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Description
              </h4>
              <p className="text-sm">{entity.description}</p>
            </div>
          )}

          {/* Properties */}
          {entity.properties && Object.keys(entity.properties).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Properties
              </h4>
              <div className="space-y-2">
                {Object.entries(entity.properties).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-start justify-between text-sm"
                  >
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-medium text-right ml-2">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source reference */}
          {entity.sourceRef && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Source
              </h4>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="h-3 w-3 mr-2" />
                View in document
              </Button>
            </div>
          )}

          <Separator />

          {/* Outgoing Relations */}
          {outgoingRelations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Outgoing Relations ({outgoingRelations.length})
              </h4>
              <div className="space-y-2">
                {outgoingRelations.map((relation) => {
                  const targetEntity = getEntity(relation.targetId);
                  if (!targetEntity) return null;

                  const targetConfig = entityTypeConfig[targetEntity.type];
                  const TargetIcon = targetConfig?.icon || Tag;

                  return (
                    <button
                      key={relation.id}
                      onClick={() => onEntityClick(relation.targetId)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-left transition-colors"
                    >
                      <TargetIcon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {targetEntity.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {relationTypeLabels[relation.type] || relation.type}
                        </div>
                      </div>
                      <Link2 className="h-3 w-3 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Incoming Relations */}
          {incomingRelations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Incoming Relations ({incomingRelations.length})
              </h4>
              <div className="space-y-2">
                {incomingRelations.map((relation) => {
                  const sourceEntity = getEntity(relation.sourceId);
                  if (!sourceEntity) return null;

                  const sourceConfig = entityTypeConfig[sourceEntity.type];
                  const SourceIcon = sourceConfig?.icon || Tag;

                  return (
                    <button
                      key={relation.id}
                      onClick={() => onEntityClick(relation.sourceId)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-left transition-colors"
                    >
                      <SourceIcon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {sourceEntity.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {relationTypeLabels[relation.type] || relation.type}
                        </div>
                      </div>
                      <Link2 className="h-3 w-3 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No relations */}
          {outgoingRelations.length === 0 && incomingRelations.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              No relationships found
            </div>
          )}

          {/* Confidence */}
          {entity.confidence !== undefined && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium">
                  {Math.round(entity.confidence * 100)}%
                </span>
              </div>
              <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${entity.confidence * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default EntityDetailPanel;
