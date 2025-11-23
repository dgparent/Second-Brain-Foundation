/**
 * Tests for CronParser
 */

import { CronParser } from '../scheduler/CronParser';

describe('CronParser', () => {
  describe('getNextRunTime', () => {
    it('should parse "0 * * * *" (every hour)', () => {
      const from = new Date('2025-11-21T10:30:00');
      const next = CronParser.getNextRunTime('0 * * * *', from);
      
      expect(next.getMinutes()).toBe(0);
      expect(next.getHours()).toBeGreaterThan(from.getHours());
    });

    it('should parse "0 0 * * *" (every day at midnight)', () => {
      const from = new Date('2025-11-21T10:30:00');
      const next = CronParser.getNextRunTime('0 0 * * *', from);
      
      expect(next.getMinutes()).toBe(0);
      expect(next.getHours()).toBe(0);
      expect(next.getDate()).toBeGreaterThan(from.getDate());
    });

    it('should parse "30 * * * *" (every hour at minute 30)', () => {
      const from = new Date('2025-11-21T10:15:00');
      const next = CronParser.getNextRunTime('30 * * * *', from);
      
      expect(next.getMinutes()).toBe(30);
      expect(next.getHours()).toBeGreaterThan(from.getHours());
    });

    it('should parse "30 14 * * *" (every day at 14:30)', () => {
      const from = new Date('2025-11-21T10:00:00');
      const next = CronParser.getNextRunTime('30 14 * * *', from);
      
      expect(next.getMinutes()).toBe(30);
      expect(next.getHours()).toBe(14);
      expect(next.getDate()).toBeGreaterThan(from.getDate());
    });

    it('should throw error for invalid cron expression', () => {
      expect(() => CronParser.getNextRunTime('invalid')).toThrow('Invalid cron expression');
    });

    it('should throw error for incomplete cron expression', () => {
      expect(() => CronParser.getNextRunTime('0 * *')).toThrow('Invalid cron expression');
    });

    it('should default to 1 hour from now for unsupported pattern', () => {
      const from = new Date('2025-11-21T10:30:00');
      const next = CronParser.getNextRunTime('* * * * *', from);
      
      expect(next.getTime()).toBeGreaterThan(from.getTime());
    });

    it('should reset seconds and milliseconds', () => {
      const from = new Date('2025-11-21T10:30:45.123');
      const next = CronParser.getNextRunTime('0 * * * *', from);
      
      expect(next.getSeconds()).toBe(0);
      expect(next.getMilliseconds()).toBe(0);
    });
  });

  describe('shouldRunNow', () => {
    it('should return true when current time matches schedule', () => {
      const schedule = '0 * * * *';
      const now = new Date();
      now.setMinutes(0);
      now.setSeconds(0);
      
      expect(CronParser.shouldRunNow(schedule, now)).toBe(true);
    });

    it('should return false when current time does not match', () => {
      const schedule = '0 * * * *';
      const now = new Date();
      now.setMinutes(30);
      
      expect(CronParser.shouldRunNow(schedule, now)).toBe(false);
    });

    it('should handle daily schedule correctly', () => {
      const schedule = '0 0 * * *';
      const now = new Date();
      now.setHours(0);
      now.setMinutes(0);
      now.setSeconds(0);
      
      expect(CronParser.shouldRunNow(schedule, now)).toBe(true);
    });
  });
});
