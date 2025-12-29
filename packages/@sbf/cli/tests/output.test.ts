/**
 * CLI Output Utils Tests
 */

import { describe, it, expect } from 'vitest';
import { formatBytes, formatRelativeDate, formatTable } from '../src/utils/output.js';

describe('Output Utils', () => {
  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    it('should handle decimal places', () => {
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(2560, 1)).toBe('2.5 KB');
    });

    it('should handle large numbers', () => {
      expect(formatBytes(1099511627776)).toBe('1 TB');
    });
  });

  describe('formatRelativeDate', () => {
    it('should format recent dates', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const result = formatRelativeDate(fiveMinutesAgo.toISOString());

      expect(result).toContain('minute');
    });

    it('should format dates from hours ago', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const result = formatRelativeDate(twoHoursAgo.toISOString());

      expect(result).toContain('hour');
    });

    it('should format dates from days ago', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      const result = formatRelativeDate(threeDaysAgo.toISOString());

      expect(result).toContain('day');
    });

    it('should handle just now', () => {
      const now = new Date();

      const result = formatRelativeDate(now.toISOString());

      expect(result).toMatch(/just now|second/i);
    });
  });

  describe('formatTable', () => {
    it('should format data as table', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];

      const result = formatTable(data, ['name', 'age']);

      expect(result).toContain('Alice');
      expect(result).toContain('Bob');
      expect(result).toContain('30');
      expect(result).toContain('25');
    });

    it('should handle empty data', () => {
      const result = formatTable([], ['col1', 'col2']);

      expect(result).toBe('');
    });

    it('should handle missing fields', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob' }, // missing age
      ];

      const result = formatTable(data, ['name', 'age']);

      expect(result).toContain('Alice');
      expect(result).toContain('Bob');
    });

    it('should truncate long values', () => {
      const data = [
        { name: 'A'.repeat(100), desc: 'Short' },
      ];

      const result = formatTable(data, ['name', 'desc'], { maxWidth: 20 });

      // Should be truncated
      expect(result.length).toBeLessThan(200);
    });
  });
});
