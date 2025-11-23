/**
 * Simple cron expression parser for job scheduling
 * Supports basic cron format: minute hour dayOfMonth month dayOfWeek
 */

export class CronParser {
  /**
   * Parse cron expression and get next run time
   */
  static getNextRunTime(cronExpression: string, from: Date = new Date()): Date {
    const parts = cronExpression.trim().split(/\s+/);
    
    if (parts.length !== 5) {
      throw new Error('Invalid cron expression. Expected format: minute hour dayOfMonth month dayOfWeek');
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    const next = new Date(from);
    next.setSeconds(0);
    next.setMilliseconds(0);

    // Simple implementation: handle common patterns
    if (cronExpression === '0 * * * *') {
      // Every hour
      next.setHours(next.getHours() + 1);
      next.setMinutes(0);
    } else if (cronExpression === '0 0 * * *') {
      // Every day at midnight
      next.setDate(next.getDate() + 1);
      next.setHours(0);
      next.setMinutes(0);
    } else if (cronExpression.match(/^\d+ \* \* \* \*$/)) {
      // Every hour at specific minute
      const targetMinute = parseInt(minute);
      next.setHours(next.getHours() + 1);
      next.setMinutes(targetMinute);
    } else if (cronExpression.match(/^\d+ \d+ \* \* \*$/)) {
      // Every day at specific time
      const targetHour = parseInt(hour);
      const targetMinute = parseInt(minute);
      next.setDate(next.getDate() + 1);
      next.setHours(targetHour);
      next.setMinutes(targetMinute);
    } else {
      // Default: 1 hour from now
      next.setHours(next.getHours() + 1);
    }

    return next;
  }

  /**
   * Validate cron expression
   */
  static isValid(cronExpression: string): boolean {
    const parts = cronExpression.trim().split(/\s+/);
    return parts.length === 5;
  }

  /**
   * Get human-readable description of cron expression
   */
  static describe(cronExpression: string): string {
    if (cronExpression === '0 * * * *') {
      return 'Every hour';
    } else if (cronExpression === '0 0 * * *') {
      return 'Every day at midnight';
    } else if (cronExpression === '0 0 * * 0') {
      return 'Every Sunday at midnight';
    } else if (cronExpression.match(/^\d+ \* \* \* \*$/)) {
      const minute = cronExpression.split(' ')[0];
      return `Every hour at ${minute} minutes past`;
    } else if (cronExpression.match(/^\d+ \d+ \* \* \*$/)) {
      const [minute, hour] = cronExpression.split(' ');
      return `Every day at ${hour}:${minute.padStart(2, '0')}`;
    }
    return cronExpression;
  }

  /**
   * Check if the schedule should run now
   */
  static shouldRunNow(cronExpression: string, now: Date = new Date()): boolean {
    const parts = cronExpression.trim().split(/\s+/);
    
    if (parts.length !== 5) {
      return false;
    }

    const [minute, hour] = parts;
    
    // Check hourly patterns
    if (cronExpression === '0 * * * *') {
      return now.getMinutes() === 0;
    } else if (cronExpression === '0 0 * * *') {
      return now.getHours() === 0 && now.getMinutes() === 0;
    } else if (cronExpression.match(/^\d+ \* \* \* \*$/)) {
      return now.getMinutes() === parseInt(minute);
    } else if (cronExpression.match(/^\d+ \d+ \* \* \*$/)) {
      return now.getHours() === parseInt(hour) && now.getMinutes() === parseInt(minute);
    }
    
    return false;
  }
}
