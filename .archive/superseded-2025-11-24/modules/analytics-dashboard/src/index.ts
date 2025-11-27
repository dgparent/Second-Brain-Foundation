/**
 * Main entry point for Analytics Dashboard module
 */

export * from './types';
export * from './services';
export * from './config/analytics.config';

// Export module metadata
export const moduleMetadata = {
  id: '@sbf/modules/analytics-dashboard',
  name: 'Analytics Dashboard',
  version: '1.0.0',
  description: 'Power BI-like analytics and visualization module',
  author: 'Second Brain Foundation',
  category: 'analytics',
  capabilities: [
    'dashboards',
    'metrics',
    'visualizations',
    'alerts',
    'exports',
  ],
  requiredModules: [
    '@sbf/shared',
    '@sbf/core/module-system',
  ],
  optionalModules: [
    '@sbf/core/knowledge-graph',
    '@sbf/memory-engine',
  ],
};
