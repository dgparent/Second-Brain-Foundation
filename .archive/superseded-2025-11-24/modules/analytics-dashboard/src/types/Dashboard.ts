/**
 * Dashboard type definitions for SBF Analytics Module
 */

export interface Dashboard {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: DashboardType;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refreshInterval?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isTemplate: boolean;
  isPublic: boolean;
}

export enum DashboardType {
  PERSONAL_OVERVIEW = 'personal_overview',
  TASK_TRACKER = 'task_tracker',
  HEALTH_DASHBOARD = 'health_dashboard',
  FINANCIAL_SUMMARY = 'financial_summary',
  LEARNING_PROGRESS = 'learning_progress',
  RELATIONSHIP_CRM = 'relationship_crm',
  VA_BUSINESS = 'va_business',
  CUSTOM = 'custom'
}

export interface DashboardLayout {
  type: 'grid' | 'flex' | 'masonry';
  columns: number;
  rowHeight?: number;
  gap?: number;
}

export interface DashboardWidget {
  id: string;
  dashboardId: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  dataSource: string;
  refreshInterval?: number;
}

export enum WidgetType {
  CHART = 'chart',
  METRIC_CARD = 'metric_card',
  TABLE = 'table',
  TEXT = 'text',
  FILTER = 'filter',
  CUSTOM = 'custom'
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetConfig {
  chartType?: ChartType;
  metric?: string;
  dimensions?: string[];
  aggregation?: AggregationType;
  filters?: Record<string, any>;
  options?: Record<string, any>;
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  AREA = 'area',
  PIE = 'pie',
  DONUT = 'donut',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap',
  TABLE = 'table',
  BIG_NUMBER = 'big_number',
  GAUGE = 'gauge',
  FUNNEL = 'funnel',
  SANKEY = 'sankey',
  TREEMAP = 'treemap',
  CALENDAR = 'calendar',
  NETWORK = 'network'
}

export enum AggregationType {
  SUM = 'sum',
  AVG = 'avg',
  COUNT = 'count',
  MIN = 'min',
  MAX = 'max',
  MEDIAN = 'median',
  PERCENTILE = 'percentile'
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: FilterType;
  field: string;
  defaultValue?: any;
  options?: FilterOption[];
}

export enum FilterType {
  DATE_RANGE = 'date_range',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  TEXT = 'text',
  NUMBER_RANGE = 'number_range'
}

export interface FilterOption {
  label: string;
  value: any;
}

export interface DashboardConfig {
  name: string;
  description?: string;
  type: DashboardType;
  layout?: DashboardLayout;
  widgets?: Partial<DashboardWidget>[];
  filters?: DashboardFilter[];
}
