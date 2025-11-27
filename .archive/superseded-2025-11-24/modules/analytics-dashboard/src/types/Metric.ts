/**
 * Metric type definitions for SBF Analytics Module
 */

export interface Metric {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  module: string;
  type: MetricType;
  aggregation: AggregationType;
  calculation: string;
  unit?: string;
  format?: MetricFormat;
  category?: string;
  tags?: string[];
  isCore: boolean;
}

export enum MetricType {
  NUMERIC = 'numeric',
  PERCENTAGE = 'percentage',
  CURRENCY = 'currency',
  DURATION = 'duration',
  COUNT = 'count',
  RATIO = 'ratio'
}

export enum AggregationType {
  SUM = 'sum',
  AVG = 'avg',
  COUNT = 'count',
  COUNT_DISTINCT = 'count_distinct',
  MIN = 'min',
  MAX = 'max',
  MEDIAN = 'median',
  PERCENTILE = 'percentile',
  CUSTOM = 'custom'
}

export interface MetricFormat {
  prefix?: string;
  suffix?: string;
  decimals?: number;
  thousandsSeparator?: string;
  decimalSeparator?: string;
}

export interface MetricDefinition {
  metric: string;
  displayName: string;
  description?: string;
  sql: string;
  type: MetricType;
  aggregation?: AggregationType;
  filters?: MetricFilter[];
  dependencies?: string[];
}

export interface MetricFilter {
  field: string;
  operator: FilterOperator;
  value: any;
}

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN = 'less_than',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  IN = 'in',
  NOT_IN = 'not_in',
  LIKE = 'like',
  BETWEEN = 'between',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null'
}

export interface MetricQuery {
  module: string;
  metrics: string[];
  dimensions?: string[];
  filters?: MetricFilter[];
  dateRange?: DateRange;
  granularity?: TimeGranularity;
  limit?: number;
  orderBy?: OrderBy[];
}

export interface DateRange {
  start: Date | string;
  end: Date | string;
  preset?: DateRangePreset;
}

export enum DateRangePreset {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
  THIS_QUARTER = 'this_quarter',
  THIS_YEAR = 'this_year',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_QUARTER = 'last_quarter',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export enum TimeGranularity {
  SECOND = 'second',
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

export interface OrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

export interface MetricData {
  metric: string;
  value: number | string;
  timestamp?: Date;
  dimensions?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface MetricContext {
  tenantId: string;
  userId?: string;
  dateRange?: DateRange;
  filters?: Record<string, any>;
}
