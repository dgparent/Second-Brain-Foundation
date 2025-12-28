/**
 * @sbf/domain-base - Timestamp Utilities
 * 
 * Utilities for ISO8601 timestamp handling.
 */

import { ISO8601 } from '../types';

/**
 * Get current timestamp in ISO8601 format
 */
export function now(): ISO8601 {
  return new Date().toISOString();
}

/**
 * Check if a string is a valid ISO8601 timestamp
 */
export function isValidISO8601(value: string): boolean {
  try {
    const date = new Date(value);
    return !isNaN(date.getTime()) && date.toISOString() === value;
  } catch {
    return false;
  }
}

/**
 * Parse an ISO8601 string to Date
 */
export function parseISO8601(value: ISO8601): Date {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO8601 timestamp: ${value}`);
  }
  return date;
}

/**
 * Format a Date to ISO8601 string
 */
export function toISO8601(date: Date): ISO8601 {
  return date.toISOString();
}

/**
 * Add duration to a timestamp
 */
export function addDuration(timestamp: ISO8601, durationMs: number): ISO8601 {
  const date = parseISO8601(timestamp);
  return toISO8601(new Date(date.getTime() + durationMs));
}

/**
 * Calculate the difference between two timestamps in milliseconds
 */
export function diffMs(a: ISO8601, b: ISO8601): number {
  return parseISO8601(a).getTime() - parseISO8601(b).getTime();
}

/**
 * Check if a timestamp has expired (is in the past)
 */
export function isExpired(timestamp: ISO8601): boolean {
  return parseISO8601(timestamp).getTime() < Date.now();
}

/**
 * Get the 48-hour dissolution timestamp for daily notes
 */
export function get48HourDissolveAt(createdAt: ISO8601): ISO8601 {
  return addDuration(createdAt, 48 * 60 * 60 * 1000);
}

/**
 * Duration constants
 */
export const Duration = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  DISSOLVE_PERIOD: 48 * 60 * 60 * 1000, // 48 hours
} as const;
