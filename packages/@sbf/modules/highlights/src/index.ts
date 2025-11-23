export * from './HighlightEntity.js';
export * from './InsightEntity.js';

// Re-export framework utilities
export {
  KnowledgeGraphWorkflow,
  SpacedRepetitionWorkflow,
  ProgressTrackingWorkflow,
  createKnowledgeNode,
  updateNodeMastery,
  markNodeReviewed
} from '@sbf/knowledge-tracking';
