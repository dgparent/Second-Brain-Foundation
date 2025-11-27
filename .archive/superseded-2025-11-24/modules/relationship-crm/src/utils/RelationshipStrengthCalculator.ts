/**
 * Relationship CRM Plugin - Relationship Strength Calculator
 * 
 * Calculate relationship strength scores with customizable algorithms
 */

export interface RelationshipData {
  interaction_count: number;
  days_since_last: number;
  avg_per_month: number;
  total_days_known: number;
  positive_interactions?: number;
  negative_interactions?: number;
}

export interface StrengthResult {
  score: number; // 0-100
  strength: 'weak' | 'moderate' | 'strong' | 'vital';
  factors: {
    frequency: number;
    recency: number;
    longevity: number;
    sentiment: number;
  };
}

export class RelationshipStrengthCalculator {
  /**
   * Calculate relationship strength with default algorithm
   */
  calculate(data: RelationshipData): StrengthResult {
    const frequency = this.calculateFrequencyScore(data);
    const recency = this.calculateRecencyScore(data);
    const longevity = this.calculateLongevityScore(data);
    const sentiment = this.calculateSentimentScore(data);

    // Weighted average
    const score = Math.round(
      frequency * 0.35 +
      recency * 0.35 +
      longevity * 0.20 +
      sentiment * 0.10
    );

    const strength = this.scoreToStrength(score);

    return {
      score,
      strength,
      factors: {
        frequency,
        recency,
        longevity,
        sentiment,
      },
    };
  }

  /**
   * Calculate frequency score (0-100)
   * Based on average interactions per month
   */
  private calculateFrequencyScore(data: RelationshipData): number {
    const { avg_per_month } = data;

    if (avg_per_month >= 8) return 100; // 2+ times per week
    if (avg_per_month >= 4) return 85;  // ~weekly
    if (avg_per_month >= 2) return 65;  // ~bi-weekly
    if (avg_per_month >= 1) return 45;  // ~monthly
    if (avg_per_month >= 0.5) return 25; // ~bi-monthly
    return Math.min(25, avg_per_month * 50);
  }

  /**
   * Calculate recency score (0-100)
   * Based on days since last interaction
   */
  private calculateRecencyScore(data: RelationshipData): number {
    const { days_since_last } = data;

    if (days_since_last <= 7) return 100;
    if (days_since_last <= 14) return 85;
    if (days_since_last <= 30) return 70;
    if (days_since_last <= 60) return 50;
    if (days_since_last <= 90) return 30;
    if (days_since_last <= 180) return 15;
    return Math.max(0, 15 - (days_since_last - 180) / 20);
  }

  /**
   * Calculate longevity score (0-100)
   * Based on total days known and interaction count
   */
  private calculateLongevityScore(data: RelationshipData): number {
    const { total_days_known, interaction_count } = data;

    // Relationship age bonus
    let ageScore = 0;
    if (total_days_known >= 365 * 3) ageScore = 40; // 3+ years
    else if (total_days_known >= 365 * 2) ageScore = 35; // 2+ years
    else if (total_days_known >= 365) ageScore = 30; // 1+ year
    else if (total_days_known >= 180) ageScore = 20; // 6+ months
    else if (total_days_known >= 90) ageScore = 10; // 3+ months
    else ageScore = Math.min(10, total_days_known / 9);

    // Interaction history bonus
    let historyScore = 0;
    if (interaction_count >= 100) historyScore = 60;
    else if (interaction_count >= 50) historyScore = 50;
    else if (interaction_count >= 25) historyScore = 40;
    else if (interaction_count >= 10) historyScore = 25;
    else if (interaction_count >= 5) historyScore = 15;
    else historyScore = interaction_count * 3;

    return Math.min(100, ageScore + historyScore);
  }

  /**
   * Calculate sentiment score (0-100)
   * Based on positive vs negative interactions
   */
  private calculateSentimentScore(data: RelationshipData): number {
    const { positive_interactions = 0, negative_interactions = 0, interaction_count } = data;

    if (interaction_count === 0) return 50; // Neutral

    const total = positive_interactions + negative_interactions;
    if (total === 0) return 50; // No sentiment data

    const ratio = positive_interactions / total;
    return Math.round(ratio * 100);
  }

  /**
   * Convert score to strength category
   */
  private scoreToStrength(score: number): 'weak' | 'moderate' | 'strong' | 'vital' {
    if (score >= 75) return 'vital';
    if (score >= 50) return 'strong';
    if (score >= 25) return 'moderate';
    return 'weak';
  }
}
