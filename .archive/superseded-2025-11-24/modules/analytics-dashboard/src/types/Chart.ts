/**
 * Chart type definitions for SBF Analytics Module
 */

export interface ChartConfig {
  type: ChartType;
  data: ChartData;
  options: ChartOptions;
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  AREA = 'area',
  PIE = 'pie',
  DONUT = 'donut',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap',
  GAUGE = 'gauge',
  FUNNEL = 'funnel',
  SANKEY = 'sankey',
  TREEMAP = 'treemap',
  CALENDAR = 'calendar',
  NETWORK = 'network',
  TABLE = 'table',
  BIG_NUMBER = 'big_number'
}

export interface ChartData {
  labels?: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: (number | null)[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface ChartOptions {
  title?: string;
  subtitle?: string;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  legend?: LegendOptions;
  tooltip?: TooltipOptions;
  axes?: AxesOptions;
  colors?: string[];
  theme?: 'light' | 'dark';
}

export interface LegendOptions {
  display: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

export interface TooltipOptions {
  enabled: boolean;
  mode?: 'index' | 'dataset' | 'point';
  position?: 'average' | 'nearest';
}

export interface AxesOptions {
  x?: AxisOptions;
  y?: AxisOptions;
}

export interface AxisOptions {
  title?: string;
  display?: boolean;
  min?: number;
  max?: number;
  type?: 'linear' | 'logarithmic' | 'time' | 'category';
  grid?: GridOptions;
}

export interface GridOptions {
  display: boolean;
  color?: string;
  lineWidth?: number;
}
