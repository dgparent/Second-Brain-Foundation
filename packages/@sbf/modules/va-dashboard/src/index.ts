/**
 * VA Dashboard Plugin
 * Domain: Virtual Assistant / Client Management
 */

export * from './entities/VAEntities';
export * from './workflows/EmailToTaskWorkflow';

export const VAPlugin = {
  id: 'sbf-va-dashboard',
  name: 'Virtual Assistant Dashboard',
  version: '0.1.0',
  domain: 'va',
  description: 'Client management and task automation for Virtual Assistants',
  
  entityTypes: [
    'va-client',
    'va-task',
    'va-meeting',
  ],
  
  features: [
    'Email to Task extraction',
    'Client management',
    'Task tracking',
    'Meeting scheduling',
  ],
};
