/**
 * Tests for Relationship Strength Calculator
 */

import { RelationshipStrengthCalculator } from '../utils/RelationshipStrengthCalculator';

describe('RelationshipStrengthCalculator', () => {
  let calculator: RelationshipStrengthCalculator;

  beforeEach(() => {
    calculator = new RelationshipStrengthCalculator();
  });

  describe('calculate', () => {
    it('should calculate vital relationship strength', () => {
      const result = calculator.calculate({
        interaction_count: 50,
        days_since_last: 5,
        avg_per_month: 8,
        total_days_known: 365,
        positive_interactions: 45,
        negative_interactions: 5,
      });

      expect(result.strength).toBe('vital');
      expect(result.score).toBeGreaterThanOrEqual(75);
    });

    it('should calculate strong relationship strength', () => {
      const result = calculator.calculate({
        interaction_count: 25,
        days_since_last: 15,
        avg_per_month: 4,
        total_days_known: 180,
        positive_interactions: 20,
        negative_interactions: 5,
      });

      expect(result.strength).toBe('strong');
      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.score).toBeLessThan(75);
    });

    it('should calculate moderate relationship strength', () => {
      const result = calculator.calculate({
        interaction_count: 10,
        days_since_last: 45,
        avg_per_month: 1.5,
        total_days_known: 90,
      });

      expect(result.strength).toBe('moderate');
      expect(result.score).toBeGreaterThanOrEqual(25);
      expect(result.score).toBeLessThan(50);
    });

    it('should calculate weak relationship strength', () => {
      const result = calculator.calculate({
        interaction_count: 3,
        days_since_last: 120,
        avg_per_month: 0.5,
        total_days_known: 60,
      });

      expect(result.strength).toBe('weak');
      expect(result.score).toBeLessThan(25);
    });

    it('should return detailed factor scores', () => {
      const result = calculator.calculate({
        interaction_count: 20,
        days_since_last: 10,
        avg_per_month: 3,
        total_days_known: 200,
      });

      expect(result.factors.frequency).toBeGreaterThan(0);
      expect(result.factors.recency).toBeGreaterThan(0);
      expect(result.factors.longevity).toBeGreaterThan(0);
      expect(result.factors.sentiment).toBeGreaterThan(0);
    });
  });
});
