import { KnowledgeNodeEntity } from '../entities/KnowledgeNodeEntity.js';

/**
 * Extract highlights from text using various patterns
 */
export function extractHighlights(
  text: string,
  pattern: 'markdown' | 'brackets' | 'custom' = 'markdown',
  customRegex?: RegExp
): string[] {
  let regex: RegExp;
  
  switch (pattern) {
    case 'markdown':
      // Match ==highlighted text==
      regex = /==([^=]+)==/g;
      break;
    case 'brackets':
      // Match [[highlighted text]]
      regex = /\[\[([^\]]+)\]\]/g;
      break;
    case 'custom':
      if (!customRegex) throw new Error('Custom pattern requires customRegex');
      regex = customRegex;
      break;
  }
  
  const matches: string[] = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1].trim());
  }
  
  return matches;
}

/**
 * Estimate reading time based on word count
 */
export function estimateReadingTime(
  wordCount: number,
  wpm: number = 200
): number {
  return Math.ceil(wordCount / wpm);
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * Generate learning path from nodes (topological sort)
 */
export function generateLearningPath(
  nodes: KnowledgeNodeEntity[]
): KnowledgeNodeEntity[] {
  const sorted: KnowledgeNodeEntity[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();
  
  const visit = (node: KnowledgeNodeEntity) => {
    if (visited.has(node.uid)) return;
    if (visiting.has(node.uid)) {
      // Cycle detected - skip
      return;
    }
    
    visiting.add(node.uid);
    
    // Visit prerequisites first
    node.metadata.prerequisite_uids?.forEach(prereqUid => {
      const prereq = nodes.find(n => n.uid === prereqUid);
      if (prereq) visit(prereq);
    });
    
    visiting.delete(node.uid);
    visited.add(node.uid);
    sorted.push(node);
  };
  
  nodes.forEach(node => visit(node));
  return sorted;
}

/**
 * Categorize nodes by topic/tag
 */
export function categorizeByTopic(
  nodes: KnowledgeNodeEntity[]
): Record<string, KnowledgeNodeEntity[]> {
  const byTopic: Record<string, KnowledgeNodeEntity[]> = {};
  
  nodes.forEach(node => {
    node.metadata.tags.forEach(tag => {
      if (!byTopic[tag]) byTopic[tag] = [];
      byTopic[tag].push(node);
    });
    
    // Also categorize by category if no tags
    if (node.metadata.tags.length === 0 && node.metadata.category) {
      if (!byTopic[node.metadata.category]) byTopic[node.metadata.category] = [];
      byTopic[node.metadata.category].push(node);
    }
  });
  
  return byTopic;
}

/**
 * Calculate mastery score
 */
export function calculateMasteryScore(
  timesReviewed: number,
  consecutiveCorrect: number,
  daysSinceCreated: number
): number {
  // Base score from reviews
  let score = Math.min(timesReviewed * 10, 50);
  
  // Bonus for consecutive correct reviews
  score += Math.min(consecutiveCorrect * 15, 30);
  
  // Time-based bonus (mature knowledge)
  if (daysSinceCreated > 30) score += 10;
  if (daysSinceCreated > 90) score += 10;
  
  return Math.min(score, 100);
}

/**
 * Find nodes mentioning a keyword
 */
export function searchNodes(
  nodes: KnowledgeNodeEntity[],
  keyword: string
): KnowledgeNodeEntity[] {
  const lowerKeyword = keyword.toLowerCase();
  
  return nodes.filter(node =>
    node.title.toLowerCase().includes(lowerKeyword) ||
    node.metadata.body?.toLowerCase().includes(lowerKeyword) ||
    node.metadata.summary?.toLowerCase().includes(lowerKeyword) ||
    node.metadata.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Get nodes by difficulty level
 */
export function filterByDifficulty(
  nodes: KnowledgeNodeEntity[],
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
): KnowledgeNodeEntity[] {
  return nodes.filter(node => node.metadata.difficulty === difficulty);
}

/**
 * Get top-rated nodes
 */
export function getTopRated(
  nodes: KnowledgeNodeEntity[],
  limit: number = 10
): KnowledgeNodeEntity[] {
  return nodes
    .filter(node => node.metadata.quality_rating !== undefined)
    .sort((a, b) => (b.metadata.quality_rating || 0) - (a.metadata.quality_rating || 0))
    .slice(0, limit);
}

/**
 * Format node for display
 */
export function formatNodeSummary(node: KnowledgeNodeEntity): string {
  const mastery = node.metadata.mastery_level || 0;
  const masteryBar = '█'.repeat(Math.floor(mastery / 10)) + '░'.repeat(10 - Math.floor(mastery / 10));
  
  return `
${node.title}
Type: ${node.metadata.content_type} | Status: ${node.metadata.status}
Mastery: [${masteryBar}] ${mastery}%
Reviews: ${node.metadata.times_reviewed}
${node.metadata.tags.length > 0 ? `Tags: ${node.metadata.tags.join(', ')}` : ''}
${node.metadata.summary || ''}
  `.trim();
}
