/**
 * Output Formatting Utilities
 */

import chalk from 'chalk';

/**
 * Table column definition
 */
export interface TableColumn {
  key: string;
  header: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
}

/**
 * Format data as a table
 */
export function formatTable<T extends Record<string, unknown>>(
  data: T[],
  columns: TableColumn[]
): string {
  if (data.length === 0) {
    return '';
  }

  // Calculate column widths
  const widths = columns.map((col) => {
    if (col.width) return col.width;
    
    const headerWidth = col.header.length;
    const maxDataWidth = Math.max(
      ...data.map((row) => String(row[col.key] ?? '').length)
    );
    
    return Math.max(headerWidth, maxDataWidth);
  });

  // Build header
  const headerRow = columns
    .map((col, i) => padString(col.header, widths[i], col.align || 'left'))
    .join('  ');
  
  const separator = widths.map((w) => '─'.repeat(w)).join('──');

  // Build data rows
  const rows = data.map((row) =>
    columns
      .map((col, i) => {
        const value = String(row[col.key] ?? '');
        return padString(value, widths[i], col.align || 'left');
      })
      .join('  ')
  );

  return [
    chalk.bold(headerRow),
    chalk.gray(separator),
    ...rows,
  ].join('\n');
}

/**
 * Pad string to width
 */
function padString(str: string, width: number, align: 'left' | 'right' | 'center'): string {
  const truncated = str.length > width ? str.substring(0, width - 1) + '…' : str;
  const padding = width - truncated.length;

  switch (align) {
    case 'right':
      return ' '.repeat(padding) + truncated;
    case 'center':
      const left = Math.floor(padding / 2);
      const right = padding - left;
      return ' '.repeat(left) + truncated + ' '.repeat(right);
    case 'left':
    default:
      return truncated + ' '.repeat(padding);
  }
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return d.toLocaleDateString();
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 1) + '…';
}

/**
 * Print success message
 */
export function success(message: string): void {
  console.log(chalk.green('✓ ') + message);
}

/**
 * Print error message
 */
export function error(message: string): void {
  console.log(chalk.red('✗ ') + message);
}

/**
 * Print warning message
 */
export function warning(message: string): void {
  console.log(chalk.yellow('⚠ ') + message);
}

/**
 * Print info message
 */
export function info(message: string): void {
  console.log(chalk.blue('ℹ ') + message);
}

/**
 * Print JSON data
 */
export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Print entity details
 */
export function printEntity(entity: Record<string, unknown>): void {
  console.log(chalk.bold(`\n${entity.title}`));
  console.log(chalk.gray(`Type: ${entity.type} | UID: ${entity.uid}`));
  console.log(chalk.gray(`Sensitivity: ${entity.sensitivity}`));
  
  if (entity.tags && Array.isArray(entity.tags) && entity.tags.length > 0) {
    console.log(chalk.gray(`Tags: ${entity.tags.join(', ')}`));
  }
  
  console.log(chalk.gray(`Created: ${formatRelativeDate(entity.created_at as string)}`));
  console.log('\n---\n');
  console.log(entity.content);
}
