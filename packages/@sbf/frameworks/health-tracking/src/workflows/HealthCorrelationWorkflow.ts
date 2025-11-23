import { HealthEventEntity } from '../entities/HealthEventEntity';
import { HealthMetricEntity } from '../entities/HealthMetricEntity';

/**
 * Simple Memory Engine interface
 */
interface SimpleMemoryEngine {
  queryEntities(query: any): Promise<any[]>;
  getEntity(uid: string): Promise<any>;
  createRelationship(relationship: any): Promise<any>;
}

/**
 * Correlation result
 */
export interface CorrelationResult {
  event_uid: string;
  metric_uid: string;
  correlation_strength: number;   // 0.0-1.0
  time_delta_hours: number;
  correlation_type: 'temporal' | 'causal' | 'statistical';
}

/**
 * Correlation pattern
 */
export interface CorrelationPattern {
  pattern_name: string;
  description: string;
  event_type: string;
  metric_type: string;
  occurrences: number;
  average_strength: number;
  confidence: number;             // 0.0-1.0
}

/**
 * Health correlation workflow
 * Finds patterns between health events and metrics
 */
export class HealthCorrelationWorkflow {
  constructor(
    private memoryEngine: SimpleMemoryEngine,
    private config: {
      maxTimeDeltaHours?: number;
      minCorrelationStrength?: number;
      minOccurrencesForPattern?: number;
    } = {}
  ) {
    this.config.maxTimeDeltaHours = config.maxTimeDeltaHours || 48;
    this.config.minCorrelationStrength = config.minCorrelationStrength || 0.3;
    this.config.minOccurrencesForPattern = config.minOccurrencesForPattern || 3;
  }

  /**
   * Find correlations for a health event
   */
  async findCorrelations(eventUid: string): Promise<CorrelationResult[]> {
    // Get the event
    const event = await this.memoryEngine.getEntity(eventUid) as HealthEventEntity;
    if (!event) return [];

    const eventDate = new Date(event.metadata.date);
    const eventTime = event.metadata.time || '12:00';
    const eventDateTime = new Date(`${event.metadata.date}T${eventTime}`);

    // Query nearby metrics (within time window)
    const windowStart = new Date(eventDateTime.getTime() - this.config.maxTimeDeltaHours! * 3600000);
    const windowEnd = new Date(eventDateTime.getTime() + this.config.maxTimeDeltaHours! * 3600000);

    const nearbyMetrics = await this.memoryEngine.queryEntities({
      type: 'health.metric',
      dateRange: {
        start: windowStart.toISOString().split('T')[0],
        end: windowEnd.toISOString().split('T')[0],
      },
    }) as HealthMetricEntity[];

    // Calculate correlations
    const correlations: CorrelationResult[] = [];

    for (const metric of nearbyMetrics) {
      const metricDate = new Date(metric.metadata.date);
      const metricTime = metric.metadata.time || '12:00';
      const metricDateTime = new Date(`${metric.metadata.date}T${metricTime}`);

      const timeDelta = Math.abs(metricDateTime.getTime() - eventDateTime.getTime()) / 3600000;

      if (timeDelta > this.config.maxTimeDeltaHours!) continue;

      // Calculate correlation strength (simplified - could use more sophisticated methods)
      // Closer in time = stronger temporal correlation
      const temporalStrength = 1 - (timeDelta / this.config.maxTimeDeltaHours!);

      if (temporalStrength >= this.config.minCorrelationStrength!) {
        correlations.push({
          event_uid: eventUid,
          metric_uid: metric.uid,
          correlation_strength: temporalStrength,
          time_delta_hours: timeDelta,
          correlation_type: 'temporal',
        });
      }
    }

    return correlations.sort((a, b) => b.correlation_strength - a.correlation_strength);
  }

  /**
   * Create correlation links in the graph
   */
  async createCorrelationLinks(correlations: CorrelationResult[]): Promise<void> {
    for (const corr of correlations) {
      await this.memoryEngine.createRelationship({
        from: corr.event_uid,
        to: corr.metric_uid,
        type: 'correlates_with',
        metadata: {
          strength: corr.correlation_strength,
          time_delta_hours: corr.time_delta_hours,
          correlation_type: corr.correlation_type,
          discovered_at: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Discover correlation patterns over time
   * E.g., "Poor sleep correlates with higher heart rate"
   */
  async discoverPatterns(
    eventType: string,
    metricType: string,
    dateRange: { start: string; end: string }
  ): Promise<CorrelationPattern | null> {
    // Get all events of this type
    const events = await this.memoryEngine.queryEntities({
      type: eventType,
      dateRange,
    }) as HealthEventEntity[];

    // Get all metrics of this type
    const metrics = await this.memoryEngine.queryEntities({
      type: 'health.metric',
      dateRange,
    }) as HealthMetricEntity[];

    const relevantMetrics = metrics.filter(
      m => m.metadata.metric_type === metricType
    );

    let correlationCount = 0;
    let totalStrength = 0;

    // For each event, check if there's a correlated metric
    for (const event of events) {
      const correlations = await this.findCorrelationsForEvent(event, relevantMetrics);
      if (correlations.length > 0) {
        correlationCount++;
        totalStrength += correlations[0].correlation_strength;
      }
    }

    if (correlationCount < this.config.minOccurrencesForPattern!) {
      return null; // Not enough occurrences to establish pattern
    }

    const averageStrength = totalStrength / correlationCount;
    const confidence = Math.min(correlationCount / 10, 1.0); // Max confidence at 10+ occurrences

    return {
      pattern_name: `${eventType} ↔ ${metricType}`,
      description: `${eventType} events correlate with ${metricType} measurements`,
      event_type: eventType,
      metric_type: metricType,
      occurrences: correlationCount,
      average_strength: averageStrength,
      confidence,
    };
  }

  /**
   * Find correlations for a specific event against a set of metrics
   */
  private findCorrelationsForEvent(
    event: HealthEventEntity,
    metrics: HealthMetricEntity[]
  ): CorrelationResult[] {
    const eventDate = new Date(event.metadata.date);
    const eventTime = event.metadata.time || '12:00';
    const eventDateTime = new Date(`${event.metadata.date}T${eventTime}`);

    const correlations: CorrelationResult[] = [];

    for (const metric of metrics) {
      const metricDate = new Date(metric.metadata.date);
      const metricTime = metric.metadata.time || '12:00';
      const metricDateTime = new Date(`${metric.metadata.date}T${metricTime}`);

      const timeDelta = Math.abs(metricDateTime.getTime() - eventDateTime.getTime()) / 3600000;

      if (timeDelta <= this.config.maxTimeDeltaHours!) {
        const strength = 1 - (timeDelta / this.config.maxTimeDeltaHours!);
        
        if (strength >= this.config.minCorrelationStrength!) {
          correlations.push({
            event_uid: event.uid,
            metric_uid: metric.uid,
            correlation_strength: strength,
            time_delta_hours: timeDelta,
            correlation_type: 'temporal',
          });
        }
      }
    }

    return correlations;
  }
}
