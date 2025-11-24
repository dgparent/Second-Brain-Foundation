import { KnowledgeNodeEntity, KnowledgeNodeMetadata, createKnowledgeNode } from '@sbf/frameworks-knowledge-tracking';

export interface InsightMetadata extends KnowledgeNodeMetadata {
  insight_type: 'connection' | 'realization' | 'question' | 'idea' | 'pattern';
  
  source_highlights?: string[];
  triggered_by?: string;
  
  confidence_level?: 'low' | 'medium' | 'high';
  actionable?: boolean;
  action_items?: string[];
  
  related_insights?: string[];
}

export interface InsightEntity extends KnowledgeNodeEntity {
  metadata: InsightMetadata;
}

export function createInsight(
  title: string,
  body: string,
  insightType: 'connection' | 'realization' | 'question' | 'idea' | 'pattern',
  options: Partial<InsightMetadata> = {}
): InsightEntity {
  const baseNode = createKnowledgeNode(
    title,
    'insight',
    {
      body,
      ...options
    }
  );
  
  return {
    ...baseNode,
    metadata: {
      ...baseNode.metadata,
      insight_type: insightType,
      body,
      confidence_level: options.confidence_level || 'medium',
      actionable: options.actionable || false,
      action_items: options.action_items,
      source_highlights: options.source_highlights,
      triggered_by: options.triggered_by,
      related_insights: options.related_insights
    }
  };
}

export function linkToHighlights(
  insight: InsightEntity,
  highlightUids: string[]
): InsightEntity {
  return {
    ...insight,
    updated: new Date().toISOString(),
    metadata: {
      ...insight.metadata,
      source_highlights: highlightUids,
      modified_date: new Date().toISOString()
    }
  };
}

export function makeActionable(
  insight: InsightEntity,
  actionItems: string[]
): InsightEntity {
  return {
    ...insight,
    updated: new Date().toISOString(),
    metadata: {
      ...insight.metadata,
      actionable: true,
      action_items: actionItems,
      importance: 5,
      modified_date: new Date().toISOString()
    }
  };
}
