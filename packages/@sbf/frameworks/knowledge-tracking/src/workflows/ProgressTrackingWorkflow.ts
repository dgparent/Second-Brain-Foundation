import { KnowledgeNodeEntity } from '../entities/KnowledgeNodeEntity.js';
import { LearningSessionEntity } from '../entities/LearningSessionEntity.js';
import { LearningResourceEntity } from '../entities/LearningResourceEntity.js';

export class ProgressTrackingWorkflow {
  /**
   * Calculate learning velocity over a period
   */
  calculateLearningVelocity(
    nodes: KnowledgeNodeEntity[],
    sessions: LearningSessionEntity[],
    periodDays: number = 30
  ): {
    nodes_mastered: number;
    time_invested_hours: number;
    average_quality: number;
    velocity: number;
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    
    // Nodes mastered in period
    const nodesMastered = nodes.filter(node =>
      node.metadata.status === 'mastered' &&
      node.metadata.modified_date >= cutoffStr
    );
    
    // Sessions in period
    const recentSessions = sessions.filter(session =>
      session.metadata.date >= cutoffStr
    );
    
    const timeInvested = recentSessions.reduce((sum, s) => sum + s.metadata.duration_minutes, 0) / 60;
    const avgQuality = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + (s.metadata.effectiveness_rating || 3), 0) / recentSessions.length
      : 0;
    
    const velocity = timeInvested > 0 ? nodesMastered.length / timeInvested : 0;
    
    return {
      nodes_mastered: nodesMastered.length,
      time_invested_hours: Math.round(timeInvested * 10) / 10,
      average_quality: Math.round(avgQuality * 10) / 10,
      velocity: Math.round(velocity * 100) / 100
    };
  }

  /**
   * Get learning statistics for a date range
   */
  getLearningStats(
    sessions: LearningSessionEntity[],
    startDate: string,
    endDate: string
  ): {
    sessions: number;
    total_time_minutes: number;
    topics_covered: string[];
    average_effectiveness: number;
    sessions_by_type: Record<string, number>;
  } {
    const filtered = sessions.filter(s =>
      s.metadata.date >= startDate && s.metadata.date <= endDate
    );
    
    const totalTime = filtered.reduce((sum, s) => sum + s.metadata.duration_minutes, 0);
    const topicsSet = new Set<string>();
    const sessionsByType: Record<string, number> = {};
    let effectivenessSum = 0;
    let effectivenessCount = 0;
    
    filtered.forEach(session => {
      // Topics
      session.metadata.focus_areas.forEach(topic => topicsSet.add(topic));
      if (session.metadata.topic) topicsSet.add(session.metadata.topic);
      
      // Session types
      sessionsByType[session.metadata.session_type] =
        (sessionsByType[session.metadata.session_type] || 0) + 1;
      
      // Effectiveness
      if (session.metadata.effectiveness_rating) {
        effectivenessSum += session.metadata.effectiveness_rating;
        effectivenessCount++;
      }
    });
    
    return {
      sessions: filtered.length,
      total_time_minutes: totalTime,
      topics_covered: Array.from(topicsSet),
      average_effectiveness: effectivenessCount > 0
        ? Math.round((effectivenessSum / effectivenessCount) * 10) / 10
        : 0,
      sessions_by_type: sessionsByType
    };
  }

  /**
   * Get resource completion stats
   */
  getResourceStats(resources: LearningResourceEntity[]): {
    total: number;
    completed: number;
    in_progress: number;
    completion_rate: number;
    average_rating: number;
    by_type: Record<string, number>;
  } {
    const completed = resources.filter(r => r.metadata.status === 'completed');
    const inProgress = resources.filter(r => r.metadata.status === 'reading');
    
    const ratedResources = resources.filter(r => r.metadata.rating !== undefined);
    const avgRating = ratedResources.length > 0
      ? ratedResources.reduce((sum, r) => sum + (r.metadata.rating || 0), 0) / ratedResources.length
      : 0;
    
    const byType: Record<string, number> = {};
    resources.forEach(r => {
      byType[r.metadata.resource_type] = (byType[r.metadata.resource_type] || 0) + 1;
    });
    
    return {
      total: resources.length,
      completed: completed.length,
      in_progress: inProgress.length,
      completion_rate: resources.length > 0
        ? Math.round((completed.length / resources.length) * 100)
        : 0,
      average_rating: Math.round(avgRating * 10) / 10,
      by_type: byType
    };
  }

  /**
   * Get mastery distribution
   */
  getMasteryDistribution(nodes: KnowledgeNodeEntity[]): {
    novice: number;
    learning: number;
    competent: number;
    proficient: number;
    expert: number;
  } {
    const distribution = {
      novice: 0,
      learning: 0,
      competent: 0,
      proficient: 0,
      expert: 0
    };
    
    nodes.forEach(node => {
      const mastery = node.metadata.mastery_level || 0;
      if (mastery < 20) distribution.novice++;
      else if (mastery < 40) distribution.learning++;
      else if (mastery < 60) distribution.competent++;
      else if (mastery < 80) distribution.proficient++;
      else distribution.expert++;
    });
    
    return distribution;
  }
}
