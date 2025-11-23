import { KnowledgeNodeEntity, KnowledgeNodeMetadata } from '@sbf/knowledge-tracking';

export interface HighlightMetadata extends KnowledgeNodeMetadata {
  highlight_text: string;
  context_before?: string;
  context_after?: string;
  
  location: {
    source_type: 'book' | 'article' | 'video' | 'podcast' | 'webpage' | 'document';
    page_number?: string;
    timestamp?: string;
    url?: string;
  };
  
  color?: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'none';
  is_favorite?: boolean;
  
  personal_note?: string;
  connections?: string[];
  
  imported_from?: 'kindle' | 'readwise' | 'notion' | 'obsidian' | 'manual';
  import_date?: string;
}

export interface HighlightEntity extends KnowledgeNodeEntity {
  type: 'highlights.highlight';
  metadata: HighlightMetadata;
}

export function createHighlight(
  highlightText: string,
  sourceTitle: string,
  sourceType: 'book' | 'article' | 'video' | 'podcast' | 'webpage' | 'document',
  options: Partial<HighlightMetadata> = {}
): HighlightEntity {
  const now = new Date().toISOString();
  
  return {
    uid: `hl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'highlights.highlight',
    title: highlightText.substring(0, 60) + (highlightText.length > 60 ? '...' : ''),
    metadata: {
      content_type: 'highlight',
      highlight_text: highlightText,
      location: {
        source_type: sourceType
      },
      source_title: sourceTitle,
      tags: [],
      status: 'to-review',
      times_reviewed: 0,
      created_date: now,
      modified_date: now,
      ease_factor: 2.5,
      interval_days: 1,
      consecutive_correct: 0,
      mastery_level: 0,
      ...options
    }
  };
}

export function addPersonalNote(
  highlight: HighlightEntity,
  note: string
): HighlightEntity {
  return {
    ...highlight,
    metadata: {
      ...highlight.metadata,
      personal_note: note,
      quality_rating: (highlight.metadata.quality_rating || 3) + 1,
      modified_date: new Date().toISOString()
    }
  };
}

export function linkHighlights(
  highlight: HighlightEntity,
  relatedHighlightUids: string[]
): HighlightEntity {
  const existingConnections = highlight.metadata.connections || [];
  const newConnections = [...new Set([...existingConnections, ...relatedHighlightUids])];
  
  return {
    ...highlight,
    metadata: {
      ...highlight.metadata,
      connections: newConnections,
      related_node_uids: newConnections,
      modified_date: new Date().toISOString()
    }
  };
}
