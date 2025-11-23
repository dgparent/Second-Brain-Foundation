/**
 * String Utilities
 * 
 * Common string manipulation functions used across the application
 */

/**
 * Convert text to URL-friendly slug
 * 
 * @param text - Input text to slugify
 * @param maxLength - Maximum slug length (default: 50)
 * @returns Lowercase alphanumeric slug with hyphens
 * 
 * @example
 * slugify('Machine Learning Basics') // => 'machine-learning-basics'
 * slugify('Hello, World!') // => 'hello-world'
 */
export function slugify(text: string, maxLength: number = 50): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, maxLength);
}

/**
 * Pad a number with leading zeros
 */
export function padNumber(num: number, length: number): string {
  return num.toString().padStart(length, '0');
}

/**
 * Truncate text to maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number = 100, ellipsis: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalize first letter of text
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
