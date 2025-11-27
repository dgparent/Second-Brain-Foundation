/**
 * Alert type definitions for SBF Analytics Module
 */

export interface Alert {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: AlertType;
  condition: AlertCondition;
  actions: AlertAction[];
  schedule?: AlertSchedule;
  enabled: boolean;
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export enum AlertType {
  THRESHOLD = 'threshold',
  ANOMALY = 'anomaly',
  TREND = 'trend',
  GOAL = 'goal',
  SCHEDULE = 'schedule'
}

export interface AlertCondition {
  metric: string;
  operator: AlertOperator;
  value: number;
  duration?: number;
  consecutiveOccurrences?: number;
}

export enum AlertOperator {
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CHANGES_BY = 'changes_by',
  ANOMALY_DETECTED = 'anomaly_detected'
}

export interface AlertAction {
  type: AlertActionType;
  config: AlertActionConfig;
}

export enum AlertActionType {
  NOTIFICATION = 'notification',
  EMAIL = 'email',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  SMS = 'sms'
}

export interface AlertActionConfig {
  recipient?: string;
  message?: string;
  url?: string;
  channels?: string[];
}

export interface AlertSchedule {
  frequency: AlertFrequency;
  dayOfWeek?: number[];
  timeOfDay?: string;
  timezone?: string;
}

export enum AlertFrequency {
  REALTIME = 'realtime',
  MINUTELY = 'minutely',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export interface AlertHistory {
  id: string;
  alertId: string;
  triggeredAt: Date;
  condition: string;
  value: number;
  actionsTaken: string[];
}
