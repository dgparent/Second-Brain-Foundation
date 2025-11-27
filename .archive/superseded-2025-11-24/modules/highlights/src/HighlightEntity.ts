import { KnowledgeNodeEntity, KnowledgeNodeMetadata, createKnowledgeNode } from '@sbf/frameworks-knowledge-tracking';

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
  metadata: HighlightMetadata;
}

export function createHighlight(
  highlightText: string,
  sourceTitle: string,
  sourceType: 'book' | 'article' | 'video' | 'podcast' | 'webpage' | 'document',
  options: Partial<HighlightMetadata> = {}
): HighlightEntity {
  const baseNode = createKnowledgeNode(
    highlightText.substring(0, 60) + (highlightText.length > 60 ? '...' : ''),
    'highlight',
    {
      source_title: sourceTitle,
      ...options
    }
  );
  
  return {
    ...baseNode,
    metadata: {
      ...baseNode.metadata,
      highlight_text: highlightText,
      location: {
        source_type: sourceType,
        ...options.location
      },
      color: options.color || 'yellow',
      is_favorite: options.is_favorite || false,
      personal_note: options.personal_note,
      connections: options.connections || [],
      imported_from: options.imported_from,
      import_date: options.import_date
    }
  };
}

export function addPersonalNote(
  highlight: HighlightEntity,
  note: string
): HighlightEntity {
  return {
    ...highlight,
    updated: new Date().toISOString(),
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
    updated: new Date().toISOString(),
    metadata: {
      ...highlight.metadata,
      connections: newConnections,
      related_node_uids: newConnections,
      modified_date: new Date().toISOString()
    }
  };
}
