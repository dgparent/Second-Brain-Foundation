import {
  createHealthEvent,
  createHealthPrivacy,
  HealthEventEntity,
} from '../entities/HealthEventEntity';
import {
  createHealthMetric,
  HealthMetricEntity,
} from '../entities/HealthMetricEntity';

describe('Health Entities', () => {
  describe('HealthEventEntity', () => {
    it('should create a workout event', () => {
      const event = createHealthEvent({
        uid: 'workout-001',
        type: 'health.workout',
        title: 'Morning Run',
        date: '2025-11-21',
        time: '07:00',
        duration_minutes: 30,
      });

      expect(event.uid).toBe('workout-001');
      expect(event.type).toBe('health.workout');
      expect(event.title).toBe('Morning Run');
      expect(event.metadata.date).toBe('2025-11-21');
      expect(event.metadata.time).toBe('07:00');
      expect(event.metadata.duration_minutes).toBe(30);
    });

    it('should create a symptom event with severity', () => {
      const event = createHealthEvent({
        uid: 'symptom-001',
        type: 'health.symptom',
        title: 'Headache',
        date: '2025-11-21',
        severity: 6,
        body_region: 'head',
        notes: 'Started after lunch',
      });

      expect(event.metadata.severity).toBe(6);
      expect(event.metadata.body_region).toBe('head');
      expect(event.metadata.notes).toBe('Started after lunch');
    });

    it('should have confidential privacy settings', () => {
      const event = createHealthEvent({
        uid: 'test-001',
        type: 'health.test',
        title: 'Test',
        date: '2025-11-21',
      });

      expect(event.sensitivity.level).toBe('confidential');
      expect(event.sensitivity.privacy.cloud_ai_allowed).toBe(false);
      expect(event.sensitivity.privacy.local_ai_allowed).toBe(true);
      expect(event.sensitivity.privacy.export_allowed).toBe(true);
    });

    it('should be permanent lifecycle', () => {
      const event = createHealthEvent({
        uid: 'test-002',
        type: 'health.test',
        title: 'Test',
        date: '2025-11-21',
      });

      expect(event.lifecycle.state).toBe('permanent');
    });
  });

  describe('HealthMetricEntity', () => {
    it('should create a weight metric', () => {
      const metric = createHealthMetric({
        uid: 'metric-001',
        metric_type: 'weight',
        value: 75.5,
        unit: 'kg',
        date: '2025-11-21',
      });

      expect(metric.uid).toBe('metric-001');
      expect(metric.type).toBe('health.metric');
      expect(metric.metadata.metric_type).toBe('weight');
      expect(metric.metadata.value).toBe(75.5);
      expect(metric.metadata.unit).toBe('kg');
      expect(metric.title).toContain('75.5kg');
    });

    it('should create a heart rate metric', () => {
      const metric = createHealthMetric({
        uid: 'metric-002',
        metric_type: 'heart_rate',
        value: 72,
        unit: 'bpm',
        date: '2025-11-21',
        time: '08:00',
        source_system: 'apple_health',
      });

      expect(metric.metadata.metric_type).toBe('heart_rate');
      expect(metric.metadata.value).toBe(72);
      expect(metric.metadata.unit).toBe('bpm');
      expect(metric.metadata.time).toBe('08:00');
      expect(metric.metadata.source_system).toBe('apple_health');
    });

    it('should create a blood pressure metric with string value', () => {
      const metric = createHealthMetric({
        uid: 'metric-003',
        metric_type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg',
        date: '2025-11-21',
      });

      expect(metric.metadata.value).toBe('120/80');
      expect(metric.metadata.unit).toBe('mmHg');
    });

    it('should use current date if not provided', () => {
      const metric = createHealthMetric({
        uid: 'metric-004',
        metric_type: 'hrv',
        value: 55,
        unit: 'ms',
      });

      expect(metric.metadata.date).toBeDefined();
      expect(metric.metadata.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should have confidential privacy', () => {
      const metric = createHealthMetric({
        uid: 'metric-005',
        metric_type: 'glucose',
        value: 95,
        unit: 'mg/dL',
      });

      expect(metric.sensitivity.level).toBe('confidential');
      expect(metric.sensitivity.privacy.cloud_ai_allowed).toBe(false);
    });
  });

  describe('createHealthPrivacy', () => {
    it('should create confidential privacy by default', () => {
      const privacy = createHealthPrivacy();
      
      expect(privacy.level).toBe('confidential');
      expect(privacy.privacy.cloud_ai_allowed).toBe(false);
      expect(privacy.privacy.local_ai_allowed).toBe(true);
      expect(privacy.privacy.export_allowed).toBe(true);
    });

    it('should create personal privacy when specified', () => {
      const privacy = createHealthPrivacy('personal');
      
      expect(privacy.level).toBe('personal');
      expect(privacy.privacy.cloud_ai_allowed).toBe(false);
    });
  });
});
