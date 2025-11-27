export const MODULE_NAME = '@sbf/personal-tasks';

export * from './TaskService';
export { TaskEntity, TaskPriority, TaskStatus } from '@sbf/frameworks-task-management';

export function init() { 
  console.log('Initializing personal-tasks module'); 
}