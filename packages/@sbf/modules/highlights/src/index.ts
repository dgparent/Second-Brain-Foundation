export * from './HighlightEntity.js';
export * from './InsightEntity.js';

// Re-export framework utilities
export {
  KnowledgeGraphWorkflow,
  SpacedRepetitionWorkflow,
  extractHighlights,
  searchNodes,
  categorizeByTopic,
  formatNodeSummary
} from '@sbf/knowledge-tracking';
