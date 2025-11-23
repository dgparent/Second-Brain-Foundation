/**
 * Date and Time Utilities
 */

export function now(): string {
  return new Date().toISOString();
}

export function futureDate(milliseconds: number): string {
  return new Date(Date.now() + milliseconds).toISOString();
}

export function pastDate(milliseconds: number): string {
  return new Date(Date.now() - milliseconds).toISOString();
}

export function isExpired(timestamp: string): boolean {
  return new Date(timestamp) < new Date();
}

export function daysUntil(timestamp: string): number {
  const diff = new Date(timestamp).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function hoursUntil(timestamp: string): number {
  const diff = new Date(timestamp).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60));
}

export function formatRelative(timestamp: string): string {
  const hours = hoursUntil(timestamp);
  
  if (hours < 0) return 'overdue';
  if (hours === 0) return 'now';
  if (hours < 24) return `in ${hours}h`;
  
  const days = Math.floor(hours / 24);
  return `in ${days}d`;
}
