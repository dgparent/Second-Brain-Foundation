import { HealthEventEntity } from '../entities/HealthEventEntity';
import { HealthMetricEntity } from '../entities/HealthMetricEntity';

/**
 * Generate a unique ID for health entities
 */
export function generateHealthUID(prefix: string, date?: string): string {
  const timestamp = date || new Date().toISOString().split('T')[0];
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Validate health event data
 */
export function validateHealthEvent(event: Partial<HealthEventEntity>): string[] {
  const errors: string[] = [];

  if (!event.uid) errors.push('UID is required');
  if (!event.title) errors.push('Title is required');
  if (!event.metadata?.date) errors.push('Date is required');

  // Validate date format
  if (event.metadata?.date && !/^\d{4}-\d{2}-\d{2}$/.test(event.metadata.date)) {
    errors.push('Date must be in YYYY-MM-DD format');
  }

  // Validate time format if provided
  if (event.metadata?.time && !/^\d{2}:\d{2}$/.test(event.metadata.time)) {
    errors.push('Time must be in HH:MM format');
  }

  // Validate severity if provided
  if (event.metadata?.severity !== undefined) {
    const severity = event.metadata.severity;
    if (typeof severity !== 'number' || severity < 0 || severity > 10) {
      errors.push('Severity must be a number between 0 and 10');
    }
  }

  return errors;
}

/**
 * Validate health metric data
 */
export function validateHealthMetric(metric: Partial<HealthMetricEntity>): string[] {
  const errors: string[] = [];

  if (!metric.uid) errors.push('UID is required');
  if (!metric.metadata?.metric_type) errors.push('Metric type is required');
  if (metric.metadata?.value === undefined) errors.push('Value is required');
  if (!metric.metadata?.unit) errors.push('Unit is required');
  if (!metric.metadata?.date) errors.push('Date is required');

  return errors;
}

/**
 * Calculate BMI from weight and height
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * Calculate BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Calculate target heart rate zones (Karvonen formula)
 */
export function calculateHeartRateZones(age: number, restingHR: number): {
  zone1: { min: number; max: number; name: string };
  zone2: { min: number; max: number; name: string };
  zone3: { min: number; max: number; name: string };
  zone4: { min: number; max: number; name: string };
  zone5: { min: number; max: number; name: string };
} {
  const maxHR = 220 - age;
  const hrReserve = maxHR - restingHR;

  return {
    zone1: {
      min: Math.round(restingHR + hrReserve * 0.5),
      max: Math.round(restingHR + hrReserve * 0.6),
      name: 'Very Light (50-60%)',
    },
    zone2: {
      min: Math.round(restingHR + hrReserve * 0.6),
      max: Math.round(restingHR + hrReserve * 0.7),
      name: 'Light (60-70%)',
    },
    zone3: {
      min: Math.round(restingHR + hrReserve * 0.7),
      max: Math.round(restingHR + hrReserve * 0.8),
      name: 'Moderate (70-80%)',
    },
    zone4: {
      min: Math.round(restingHR + hrReserve * 0.8),
      max: Math.round(restingHR + hrReserve * 0.9),
      name: 'Hard (80-90%)',
    },
    zone5: {
      min: Math.round(restingHR + hrReserve * 0.9),
      max: maxHR,
      name: 'Maximum (90-100%)',
    },
  };
}

/**
 * Format health metric for display
 */
export function formatMetric(value: number | string, unit: string, decimals: number = 1): string {
  if (typeof value === 'string') return `${value} ${unit}`;
  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * Filter events by date range
 */
export function filterByDateRange(
  events: HealthEventEntity[],
  startDate: string,
  endDate: string
): HealthEventEntity[] {
  return events.filter(event => {
    const date = event.metadata.date;
    return date >= startDate && date <= endDate;
  });
}

/**
 * Group events by date
 */
export function groupByDate(
  events: HealthEventEntity[]
): Record<string, HealthEventEntity[]> {
  const grouped: Record<string, HealthEventEntity[]> = {};

  for (const event of events) {
    const date = event.metadata.date;
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(event);
  }

  return grouped;
}

/**
 * Sort events by date and time
 */
export function sortByDateTime(
  events: HealthEventEntity[],
  order: 'asc' | 'desc' = 'desc'
): HealthEventEntity[] {
  return [...events].sort((a, b) => {
    const aDateTime = `${a.metadata.date}T${a.metadata.time || '00:00'}`;
    const bDateTime = `${b.metadata.date}T${b.metadata.time || '00:00'}`;
    const comparison = aDateTime.localeCompare(bDateTime);
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Calculate average of metric values
 */
export function calculateAverageMetric(metrics: HealthMetricEntity[]): number {
  if (metrics.length === 0) return 0;
  
  const sum = metrics.reduce((acc, m) => {
    const value = typeof m.metadata.value === 'number' ? m.metadata.value : parseFloat(String(m.metadata.value));
    return acc + (isNaN(value) ? 0 : value);
  }, 0);

  return sum / metrics.length;
}

/**
 * Get metric trend (increasing, decreasing, stable)
 */
export function getMetricTrend(metrics: HealthMetricEntity[], windowSize: number = 7): 'increasing' | 'decreasing' | 'stable' {
  if (metrics.length < 2) return 'stable';

  const sorted = [...metrics].sort((a, b) => a.metadata.date.localeCompare(b.metadata.date));
  const recent = sorted.slice(-windowSize);

  if (recent.length < 2) return 'stable';

  const firstValue = recent[0].metadata.value;
  const lastValue = recent[recent.length - 1].metadata.value;

  const first = typeof firstValue === 'number' ? firstValue : parseFloat(String(firstValue));
  const last = typeof lastValue === 'number' ? lastValue : parseFloat(String(lastValue));

  if (isNaN(first) || isNaN(last) || first === 0) return 'stable';

  const percentChange = ((last - first) / first) * 100;

  if (percentChange > 2) return 'increasing';
  if (percentChange < -2) return 'decreasing';
  return 'stable';
}
