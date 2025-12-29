/**
 * ConfidenceScorer Service
 * 
 * Scores confidence for entity extractions and determines if human review is needed.
 * Implements PRD FR25 requirements.
 */

import type { ConfidenceScore, ConfidenceComponent } from '../types';

export interface ExtractedEntity {
  name: string;
  type: string;
  typeConfidence?: number;
  properties?: Record<string, unknown>;
}

export interface ExtractionContext {
  content: string;
  sourceType?: string;
  previousExtractions?: ExtractedEntity[];
}

export interface ConfidenceScorerConfig {
  defaultThreshold?: number;  // Default: 0.90 (PRD FR25)
  weights?: {
    nameClarity?: number;
    typeCertainty?: number;
    contextSupport?: number;
    propertyCompleteness?: number;
  };
}

export class ConfidenceScorer {
  private config: ConfidenceScorerConfig;
  
  constructor(config: ConfidenceScorerConfig = {}) {
    this.config = {
      defaultThreshold: config.defaultThreshold ?? 0.90,
      weights: {
        nameClarity: config.weights?.nameClarity ?? 0.25,
        typeCertainty: config.weights?.typeCertainty ?? 0.25,
        contextSupport: config.weights?.contextSupport ?? 0.30,
        propertyCompleteness: config.weights?.propertyCompleteness ?? 0.20,
      },
    };
  }
  
  /**
   * Score confidence for entity extraction
   */
  scoreEntityExtraction(
    extraction: ExtractedEntity,
    context: ExtractionContext
  ): ConfidenceScore {
    const components: ConfidenceComponent[] = [];
    
    // Name clarity
    const nameScore = this.scoreNameClarity(extraction.name);
    components.push({
      name: 'name_clarity',
      score: nameScore,
      reason: this.getNameClarityReason(nameScore),
    });
    
    // Type certainty
    const typeScore = extraction.typeConfidence ?? 0.5;
    components.push({
      name: 'type_certainty',
      score: typeScore,
      reason: `Entity type confidence: ${(typeScore * 100).toFixed(0)}%`,
    });
    
    // Context support
    const contextScore = this.scoreContextSupport(extraction, context);
    components.push({
      name: 'context_support',
      score: contextScore,
      reason: this.getContextSupportReason(extraction.name, context.content),
    });
    
    // Property completeness
    const propertyScore = this.scorePropertyCompleteness(extraction);
    components.push({
      name: 'property_completeness',
      score: propertyScore,
      reason: `Properties filled: ${this.countProperties(extraction.properties)}`,
    });
    
    // Calculate weighted overall score
    const overall = this.calculateWeightedScore(components);
    const threshold = this.config.defaultThreshold!;
    
    return {
      overall,
      components,
      needsReview: overall < threshold,
      reviewThreshold: threshold,
    };
  }
  
  /**
   * Score confidence for relationship extraction
   */
  scoreRelationshipExtraction(
    sourceEntity: string,
    targetEntity: string,
    relationshipType: string,
    context: string
  ): ConfidenceScore {
    const components: ConfidenceComponent[] = [];
    
    // Source mentions
    const sourceMentions = this.countMentions(sourceEntity, context);
    const sourceScore = Math.min(1, sourceMentions / 3);
    components.push({
      name: 'source_presence',
      score: sourceScore,
      reason: `Source entity mentioned ${sourceMentions} times`,
    });
    
    // Target mentions
    const targetMentions = this.countMentions(targetEntity, context);
    const targetScore = Math.min(1, targetMentions / 3);
    components.push({
      name: 'target_presence',
      score: targetScore,
      reason: `Target entity mentioned ${targetMentions} times`,
    });
    
    // Proximity of mentions
    const proximityScore = this.scoreProximity(sourceEntity, targetEntity, context);
    components.push({
      name: 'proximity',
      score: proximityScore,
      reason: proximityScore > 0.7 ? 'Entities mentioned close together' : 'Entities mentioned far apart',
    });
    
    const overall = (sourceScore + targetScore + proximityScore) / 3;
    
    return {
      overall,
      components,
      needsReview: overall < this.config.defaultThreshold!,
      reviewThreshold: this.config.defaultThreshold!,
    };
  }
  
  /**
   * Score confidence for BMOM extraction
   */
  scoreBMOMExtraction(bmom: {
    because?: string;
    meaning?: string;
    outcome?: string;
    measure?: string;
  }): ConfidenceScore {
    const components: ConfidenceComponent[] = [];
    
    const fields: Array<{ key: keyof typeof bmom; label: string }> = [
      { key: 'because', label: 'Because' },
      { key: 'meaning', label: 'Meaning' },
      { key: 'outcome', label: 'Outcome' },
      { key: 'measure', label: 'Measure' },
    ];
    
    for (const { key, label } of fields) {
      const value = bmom[key];
      const score = this.scoreTextQuality(value);
      components.push({
        name: key,
        score,
        reason: value ? `${label}: ${value.length} chars` : `${label}: Empty`,
      });
    }
    
    const overall = components.reduce((sum, c) => sum + c.score, 0) / components.length;
    
    return {
      overall,
      components,
      needsReview: overall < this.config.defaultThreshold!,
      reviewThreshold: this.config.defaultThreshold!,
    };
  }
  
  /**
   * Score name clarity
   */
  private scoreNameClarity(name: string): number {
    if (!name || name.length < 2) return 0.1;
    if (name.length > 100) return 0.5;
    
    let score = 0.5;
    
    // Proper capitalization
    if (/^[A-Z]/.test(name)) {
      score += 0.2;
    }
    
    // Not all caps
    if (!/^[A-Z\s]+$/.test(name)) {
      score += 0.1;
    }
    
    // Contains at least one letter
    if (/[a-zA-Z]/.test(name)) {
      score += 0.1;
    }
    
    // Reasonable length (3-50 chars)
    if (name.length >= 3 && name.length <= 50) {
      score += 0.1;
    }
    
    return Math.min(1, score);
  }
  
  /**
   * Get reason for name clarity score
   */
  private getNameClarityReason(score: number): string {
    if (score >= 0.9) return 'Name is clear and well-formatted';
    if (score >= 0.7) return 'Name is acceptable';
    if (score >= 0.5) return 'Name may need clarification';
    return 'Name quality is low';
  }
  
  /**
   * Score context support
   */
  private scoreContextSupport(
    extraction: ExtractedEntity,
    context: ExtractionContext
  ): number {
    const mentions = this.countMentions(extraction.name, context.content);
    
    if (mentions >= 3) return 0.95;
    if (mentions >= 2) return 0.8;
    if (mentions >= 1) return 0.6;
    return 0.3;
  }
  
  /**
   * Get reason for context support score
   */
  private getContextSupportReason(name: string, content: string): string {
    const mentions = this.countMentions(name, content);
    return `"${name}" mentioned ${mentions} time${mentions !== 1 ? 's' : ''} in content`;
  }
  
  /**
   * Score property completeness
   */
  private scorePropertyCompleteness(extraction: ExtractedEntity): number {
    if (!extraction.properties) return 0.5;
    
    const filled = this.countProperties(extraction.properties);
    const total = Object.keys(extraction.properties).length;
    
    if (total === 0) return 0.5;
    return 0.5 + (0.5 * filled / total);
  }
  
  /**
   * Count filled properties
   */
  private countProperties(properties?: Record<string, unknown>): number {
    if (!properties) return 0;
    
    return Object.values(properties).filter(v => 
      v !== null && v !== undefined && v !== ''
    ).length;
  }
  
  /**
   * Count mentions of text in content
   */
  private countMentions(text: string, content: string): number {
    if (!text || !content) return 0;
    
    const regex = new RegExp(this.escapeRegex(text), 'gi');
    const matches = content.match(regex);
    return matches?.length || 0;
  }
  
  /**
   * Score proximity of two entities in text
   */
  private scoreProximity(entity1: string, entity2: string, content: string): number {
    const pos1 = content.toLowerCase().indexOf(entity1.toLowerCase());
    const pos2 = content.toLowerCase().indexOf(entity2.toLowerCase());
    
    if (pos1 === -1 || pos2 === -1) return 0.3;
    
    const distance = Math.abs(pos2 - pos1);
    const maxDistance = 500; // Characters
    
    if (distance <= 100) return 0.95;
    if (distance <= maxDistance) return 0.7 + (0.25 * (1 - distance / maxDistance));
    return 0.5;
  }
  
  /**
   * Score text quality
   */
  private scoreTextQuality(text?: string): number {
    if (!text) return 0;
    if (text.length < 10) return 0.3;
    if (text.length < 20) return 0.5;
    if (text.length < 50) return 0.7;
    return 0.9;
  }
  
  /**
   * Calculate weighted score from components
   */
  private calculateWeightedScore(components: ConfidenceComponent[]): number {
    const weights = this.config.weights!;
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const component of components) {
      const weight = (weights as Record<string, number>)[component.name] ?? 0.25;
      weightedSum += component.score * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
  
  /**
   * Escape regex special characters
   */
  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  /**
   * Get threshold for specific review type
   */
  getThreshold(type?: 'entity' | 'relationship' | 'bmom'): number {
    // Could implement different thresholds per type
    return this.config.defaultThreshold!;
  }
  
  /**
   * Check if score needs review
   */
  needsReview(score: number, threshold?: number): boolean {
    return score < (threshold ?? this.config.defaultThreshold!);
  }
}
