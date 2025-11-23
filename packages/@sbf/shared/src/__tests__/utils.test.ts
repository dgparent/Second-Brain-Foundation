/**
 * Tests for Shared Utility Functions
 */

import {
  generateUID,
  slugify,
  validateUID,
  parseUID,
  incrementUID,
} from '../utils/uid';

import {
  now,
  futureDate,
  pastDate,
  isExpired,
  daysUntil,
  hoursUntil,
  formatRelative,
} from '../utils/date';

describe('UID Utilities', () => {
  describe('slugify', () => {
    it('should convert text to lowercase slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello@World!')).toBe('hello-world');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('Hello   World')).toBe('hello-world');
    });

    it('should trim leading and trailing dashes', () => {
      expect(slugify('---Hello World---')).toBe('hello-world');
    });

    it('should truncate to 50 characters', () => {
      const longText = 'a'.repeat(100);
      expect(slugify(longText)).toHaveLength(50);
    });
  });

  describe('generateUID', () => {
    it('should generate valid UID with default counter', () => {
      const uid = generateUID('task', 'My Task');
      expect(uid).toBe('task-my-task-001');
    });

    it('should pad counter to 3 digits', () => {
      const uid = generateUID('task', 'My Task', 42);
      expect(uid).toBe('task-my-task-042');
    });

    it('should handle large counters', () => {
      const uid = generateUID('task', 'My Task', 9999);
      expect(uid).toBe('task-my-task-9999');
    });
  });

  describe('validateUID', () => {
    it('should validate correct UID format', () => {
      expect(validateUID('task-my-task-001')).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(validateUID('invalid')).toBe(false);
      expect(validateUID('task-001')).toBe(false);
      expect(validateUID('task--001')).toBe(false);
    });
  });

  describe('parseUID', () => {
    it('should parse valid UID', () => {
      const result = parseUID('task-test-042');
      expect(result).toEqual({
        type: 'task',
        slug: 'test',
        counter: 42,
      });
    });

    it('should return null for invalid UID', () => {
      expect(parseUID('invalid')).toBeNull();
    });
  });

  describe('incrementUID', () => {
    it('should increment counter', () => {
      const newUid = incrementUID('task-test-001');
      expect(newUid).toBe('task-test-002');
    });

    it('should throw on invalid UID', () => {
      expect(() => incrementUID('invalid')).toThrow('Invalid UID');
    });
  });
});

describe('Date Utilities', () => {
  describe('now', () => {
    it('should return ISO8601 timestamp', () => {
      const timestamp = now();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('futureDate', () => {
    it('should return future timestamp', () => {
      const future = futureDate(1000);
      expect(new Date(future).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('pastDate', () => {
    it('should return past timestamp', () => {
      const past = pastDate(1000);
      expect(new Date(past).getTime()).toBeLessThan(Date.now());
    });
  });

  describe('isExpired', () => {
    it('should detect expired timestamps', () => {
      const past = pastDate(1000);
      expect(isExpired(past)).toBe(true);
    });

    it('should detect non-expired timestamps', () => {
      const future = futureDate(1000);
      expect(isExpired(future)).toBe(false);
    });
  });

  describe('daysUntil', () => {
    it('should calculate days until future date', () => {
      const future = futureDate(1000 * 60 * 60 * 24 * 5); // 5 days
      const days = daysUntil(future);
      expect(days).toBeGreaterThanOrEqual(4);
      expect(days).toBeLessThanOrEqual(6);
    });
  });

  describe('hoursUntil', () => {
    it('should calculate hours until future date', () => {
      const future = futureDate(1000 * 60 * 60 * 3); // 3 hours
      const hours = hoursUntil(future);
      expect(hours).toBeGreaterThanOrEqual(2);
      expect(hours).toBeLessThanOrEqual(4);
    });
  });

  describe('formatRelative', () => {
    it('should format as "overdue" for past dates', () => {
      const past = pastDate(1000 * 60 * 60 * 2); // 2 hours ago
      expect(formatRelative(past)).toBe('overdue');
    });

    it('should format hours for near future', () => {
      const future = futureDate(1000 * 60 * 60 * 5); // 5 hours
      const formatted = formatRelative(future);
      expect(formatted).toMatch(/in \d+h/);
    });

    it('should format days for distant future', () => {
      const future = futureDate(1000 * 60 * 60 * 24 * 5); // 5 days
      const formatted = formatRelative(future);
      expect(formatted).toMatch(/in \d+d/);
    });
  });
});
