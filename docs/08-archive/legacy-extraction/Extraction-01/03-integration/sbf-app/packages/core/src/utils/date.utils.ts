/**
 * Date/Time Utilities
 */

/**
 * Get current ISO 8601 timestamp
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if date is within last N hours
 */
export function isWithinHours(date: Date, hours: number): boolean {
  const nowTime = new Date();
  const diff = nowTime.getTime() - date.getTime();
  const hoursDiff = diff / (1000 * 60 * 60);
  return hoursDiff <= hours;
}
