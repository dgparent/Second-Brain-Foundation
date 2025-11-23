import { KnowledgeNodeEntity, KnowledgeNodeMetadata } from '@sbf/knowledge-tracking';

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
  type: 'highlights.insight';
  metadata: InsightMetadata;
}

export function createInsight(
  title: string,
  body: string,
  insightType: 'connection' | 'realization' | 'question' | 'idea' | 'pattern',
  options: Partial<InsightMetadata> = {}
): InsightEntity {
  const now = new Date().toISOString();
  
  return {
    uid: `ins-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'highlights.insight',
    title,
    metadata: {
      content_type: 'insight',
      insight_type: insightType,
      body,
      tags: [],
      status: 'active',
      times_reviewed: 0,
      created_date: now,
      modified_date: now,
      ease_factor: 2.5,
      interval_days: 1,
      consecutive_correct: 0,
      mastery_level: 0,
      confidence_level: 'medium',
      actionable: false,
      ...options
    }
  };
}

export function linkToHighlights(
  insight: InsightEntity,
  highlightUids: string[]
): InsightEntity {
  return {
    ...insight,
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
    metadata: {
      ...insight.metadata,
      actionable: true,
      action_items: actionItems,
      importance: 5,
      modified_date: new Date().toISOString()
    }
  };
}
