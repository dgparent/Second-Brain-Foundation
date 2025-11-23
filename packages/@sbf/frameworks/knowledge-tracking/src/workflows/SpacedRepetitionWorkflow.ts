import { KnowledgeNodeEntity } from '../entities/KnowledgeNodeEntity.js';

export type ReviewPerformance = 'forgot' | 'hard' | 'good' | 'easy';

export class SpacedRepetitionWorkflow {
  /**
   * Calculate next review date using SM-2 algorithm
   */
  calculateNextReview(
    node: KnowledgeNodeEntity,
    performance: ReviewPerformance
  ): string {
    const metadata = node.metadata;
    let easeFactor = metadata.ease_factor || 2.5;
    let intervalDays = metadata.interval_days || 1;
    let consecutiveCorrect = metadata.consecutive_correct || 0;
    
    // Update based on performance
    switch (performance) {
      case 'forgot':
        easeFactor = Math.max(1.3, easeFactor - 0.2);
        intervalDays = 1;
        consecutiveCorrect = 0;
        break;
      
      case 'hard':
        easeFactor = Math.max(1.3, easeFactor - 0.15);
        intervalDays = Math.max(1, Math.floor(intervalDays * 1.2));
        consecutiveCorrect = 0;
        break;
      
      case 'good':
        consecutiveCorrect++;
        if (consecutiveCorrect === 1) {
          intervalDays = 1;
        } else if (consecutiveCorrect === 2) {
          intervalDays = 6;
        } else {
          intervalDays = Math.round(intervalDays * easeFactor);
        }
        break;
      
      case 'easy':
        easeFactor = Math.min(2.5, easeFactor + 0.15);
        consecutiveCorrect++;
        intervalDays = Math.round(intervalDays * easeFactor * 1.3);
        break;
    }
    
    // Calculate next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);
    
    return nextDate.toISOString().split('T')[0];
  }

  /**
   * Get nodes due for review
   */
  getDueForReview(
    nodes: KnowledgeNodeEntity[],
    date: string = new Date().toISOString().split('T')[0]
  ): KnowledgeNodeEntity[] {
    return nodes.filter(node => {
      if (!node.metadata.next_review) {
        // Never reviewed - include if not new
        const daysSinceCreated = this.getDaysSince(node.metadata.created_date);
        return daysSinceCreated > 0;
      }
      return node.metadata.next_review <= date;
    });
  }

  /**
   * Update mastery level based on review performance
   */
  updateMasteryLevel(
    currentMastery: number,
    performance: ReviewPerformance
  ): number {
    let delta = 0;
    
    switch (performance) {
      case 'forgot':
        delta = -15;
        break;
      case 'hard':
        delta = -5;
        break;
      case 'good':
        delta = 10;
        break;
      case 'easy':
        delta = 15;
        break;
    }
    
    return Math.max(0, Math.min(100, currentMastery + delta));
  }

  /**
   * Get review statistics
   */
  getReviewStats(nodes: KnowledgeNodeEntity[]): {
    total_reviews: number;
    average_reviews_per_node: number;
    nodes_never_reviewed: number;
    nodes_due_today: number;
  } {
    const today = new Date().toISOString().split('T')[0];
    const dueToday = this.getDueForReview(nodes, today);
    const neverReviewed = nodes.filter(n => n.metadata.times_reviewed === 0);
    const totalReviews = nodes.reduce((sum, n) => sum + n.metadata.times_reviewed, 0);
    
    return {
      total_reviews: totalReviews,
      average_reviews_per_node: nodes.length > 0 ? totalReviews / nodes.length : 0,
      nodes_never_reviewed: neverReviewed.length,
      nodes_due_today: dueToday.length
    };
  }

  private getDaysSince(dateStr: string): number {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}
