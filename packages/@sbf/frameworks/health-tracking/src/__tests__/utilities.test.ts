import {
  generateHealthUID,
  validateHealthEvent,
  validateHealthMetric,
  calculateBMI,
  getBMICategory,
  calculateHeartRateZones,
  formatMetric,
  filterByDateRange,
  groupByDate,
  sortByDateTime,
  calculateAverageMetric,
  getMetricTrend,
} from '../utils/healthHelpers';
import { createHealthEvent } from '../entities/HealthEventEntity';
import { createHealthMetric } from '../entities/HealthMetricEntity';

describe('Health Utilities', () => {
  describe('generateHealthUID', () => {
    it('should generate UID with prefix and date', () => {
      const uid = generateHealthUID('workout', '2025-11-21');
      expect(uid).toMatch(/^workout-2025-11-21-[a-z0-9]{6}$/);
    });

    it('should generate unique UIDs', () => {
      const uid1 = generateHealthUID('metric');
      const uid2 = generateHealthUID('metric');
      expect(uid1).not.toBe(uid2);
    });
  });

  describe('validateHealthEvent', () => {
    it('should validate complete event', () => {
      const event = createHealthEvent({
        uid: 'test-001',
        type: 'health.workout',
        title: 'Run',
        date: '2025-11-21',
      });

      expect(validateHealthEvent(event)).toHaveLength(0);
    });

    it('should validate time format', () => {
      const event: any = {
        uid: 'test-001',
        title: 'Test',
        metadata: { date: '2025-11-21', time: 'invalid' },
      };

      const errors = validateHealthEvent(event);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate severity range', () => {
      const event: any = {
        uid: 'test-001',
        title: 'Test',
        metadata: { date: '2025-11-21', severity: 15 },
      };

      const errors = validateHealthEvent(event);
      expect(errors).toContain('Severity must be a number between 0 and 10');
    });
  });

  describe('calculateBMI', () => {
    it('should calculate BMI correctly', () => {
      const bmi = calculateBMI(75, 180);
      expect(bmi).toBeCloseTo(23.15, 1);
    });
  });

  describe('getBMICategory', () => {
    it('should categorize underweight', () => {
      expect(getBMICategory(17)).toBe('Underweight');
    });

    it('should categorize normal weight', () => {
      expect(getBMICategory(22)).toBe('Normal weight');
    });

    it('should categorize overweight', () => {
      expect(getBMICategory(27)).toBe('Overweight');
    });

    it('should categorize obese', () => {
      expect(getBMICategory(32)).toBe('Obese');
    });
  });

  describe('calculateHeartRateZones', () => {
    it('should calculate HR zones', () => {
      const zones = calculateHeartRateZones(30, 60);
      
      expect(zones.zone1.name).toContain('Very Light');
      expect(zones.zone5.name).toContain('Maximum');
      expect(zones.zone3.min).toBeGreaterThanOrEqual(zones.zone2.max);
    });
  });

  describe('formatMetric', () => {
    it('should format numeric value', () => {
      expect(formatMetric(75.555, 'kg', 1)).toBe('75.6 kg');
    });

    it('should format string value', () => {
      expect(formatMetric('120/80', 'mmHg')).toBe('120/80 mmHg');
    });
  });

  describe('filterByDateRange', () => {
    const events = [
      createHealthEvent({ uid: 'e1', type: 'health.workout', title: 'E1', date: '2025-11-01' }),
      createHealthEvent({ uid: 'e2', type: 'health.workout', title: 'E2', date: '2025-11-15' }),
      createHealthEvent({ uid: 'e3', type: 'health.workout', title: 'E3', date: '2025-11-30' }),
    ];

    it('should filter events in range', () => {
      const filtered = filterByDateRange(events, '2025-11-10', '2025-11-30');
      expect(filtered).toHaveLength(2);
    });
  });

  describe('calculateAverageMetric', () => {
    it('should calculate average', () => {
      const metrics = [
        createHealthMetric({ uid: 'm1', metric_type: 'weight', value: 74, unit: 'kg' }),
        createHealthMetric({ uid: 'm2', metric_type: 'weight', value: 76, unit: 'kg' }),
        createHealthMetric({ uid: 'm3', metric_type: 'weight', value: 75, unit: 'kg' }),
      ];

      const avg = calculateAverageMetric(metrics);
      expect(avg).toBe(75);
    });
  });

  describe('getMetricTrend', () => {
    it('should detect increasing trend', () => {
      const metrics = [
        createHealthMetric({ uid: 'm1', metric_type: 'weight', value: 70, unit: 'kg', date: '2025-11-01' }),
        createHealthMetric({ uid: 'm2', metric_type: 'weight', value: 72, unit: 'kg', date: '2025-11-08' }),
      ];

      expect(getMetricTrend(metrics)).toBe('increasing');
    });

    it('should detect stable trend', () => {
      const metrics = [
        createHealthMetric({ uid: 'm1', metric_type: 'weight', value: 75, unit: 'kg', date: '2025-11-01' }),
        createHealthMetric({ uid: 'm2', metric_type: 'weight', value: 75.5, unit: 'kg', date: '2025-11-08' }),
      ];

      expect(getMetricTrend(metrics)).toBe('stable');
    });
  });
});
