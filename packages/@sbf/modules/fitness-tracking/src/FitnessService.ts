import { EntityManager } from '@sbf/core-entity-manager';
import { BaseAIProvider } from '@sbf/aei';
import { 
  HealthMetricEntity, 
  createHealthMetric, 
  MetricTypes,
  HealthEventEntity,
  createHealthEvent
} from '@sbf/frameworks-health-tracking';

export class FitnessService {
  constructor(
    private entityManager: EntityManager,
    private aiProvider: BaseAIProvider
  ) {}

  /**
   * Log a health metric (e.g. weight, steps)
   */
  async logMetric(
    metricType: string,
    value: number | string,
    unit: string,
    date: string = new Date().toISOString().split('T')[0],
    time?: string,
    source: string = 'manual'
  ): Promise<HealthMetricEntity> {
    const uid = `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const metric = createHealthMetric({
      uid,
      metric_type: metricType,
      value,
      unit,
      date,
      time,
      source_system: source
    });

    await this.entityManager.create(metric);
    return metric;
  }

  /**
   * Log a workout or health event
   */
  async logWorkout(
    title: string,
    activityType: string, // e.g. 'running', 'lifting'
    durationMinutes: number,
    date: string = new Date().toISOString().split('T')[0],
    caloriesBurned?: number,
    notes?: string
  ): Promise<HealthEventEntity> {
    const uid = `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const workout = createHealthEvent({
      uid,
      type: 'health.workout',
      title,
      date,
      duration_minutes: durationMinutes,
      notes
    });

    // Add specific workout metadata
    workout.metadata.activity_type = activityType;
    if (caloriesBurned) {
      workout.metadata.calories_burned = caloriesBurned;
    }

    await this.entityManager.create(workout);
    return workout;
  }

  /**
   * Get metrics by type
   */
  async getMetrics(metricType?: string): Promise<HealthMetricEntity[]> {
    const entities = await this.entityManager.getAll();
    const metrics = entities.filter(e => e.type === 'health.metric') as HealthMetricEntity[];
    
    if (metricType) {
      return metrics.filter(m => m.metadata.metric_type === metricType);
    }
    
    return metrics;
  }

  /**
   * Get workouts
   */
  async getWorkouts(): Promise<HealthEventEntity[]> {
    const entities = await this.entityManager.getAll();
    return entities.filter(e => e.type === 'health.workout') as HealthEventEntity[];
  }

  /**
   * Get latest metric value
   */
  async getLatestMetric(metricType: string): Promise<HealthMetricEntity | null> {
    const metrics = await this.getMetrics(metricType);
    if (metrics.length === 0) return null;
    
    // Sort by date descending
    return metrics.sort((a, b) => {
      const dateA = new Date(a.metadata.date + (a.metadata.time ? 'T' + a.metadata.time : ''));
      const dateB = new Date(b.metadata.date + (b.metadata.time ? 'T' + b.metadata.time : ''));
      return dateB.getTime() - dateA.getTime();
    })[0];
  }
}
