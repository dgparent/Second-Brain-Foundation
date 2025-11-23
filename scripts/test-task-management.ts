/**
 * Test Script for Task Management Framework
 * Demonstrates task and project management capabilities
 */

import {
  createTask,
  createProject,
  createMilestone,
  updateTaskStatus,
  updateProjectProgress,
  TaskPrioritizationWorkflow,
  ProjectTrackingWorkflow,
  groupByKanbanColumns,
  groupByDueDate,
  calculateTaskStats,
  filterActiveTasks
} from '../packages/@sbf/frameworks/task-management/dist/index.js';

console.log('=== Task Management Framework Test ===\n');

// Create a project
console.log('1. Creating project...');
const project = createProject('Website Redesign', {
  description: 'Complete overhaul of company website',
  start_date: '2025-11-01T00:00:00Z',
  target_end_date: '2026-02-01T00:00:00Z',
  budget_hours: 200,
  tags: ['web-development', 'design']
});
console.log(`   Created project: ${project.title} (${project.uid})`);

// Create milestones
console.log('\n2. Creating milestones...');
const milestone1 = createMilestone('MVP Launch', '2025-12-15T00:00:00Z', {
  project_uid: project.uid,
  success_criteria: [
    'User authentication working',
    'Basic CRUD operations',
    '100 test users onboarded'
  ]
});
console.log(`   Created milestone: ${milestone1.title}`);

const milestone2 = createMilestone('Full Launch', '2026-01-31T00:00:00Z', {
  project_uid: project.uid,
  success_criteria: [
    'All features complete',
    'Performance optimized',
    '1000+ users migrated'
  ]
});
console.log(`   Created milestone: ${milestone2.title}`);

// Create tasks
console.log('\n3. Creating tasks...');
const tasks = [
  createTask('Set up development environment', 'high', {
    project_uid: project.uid,
    milestone_uid: milestone1.uid,
    complexity: 'simple',
    estimated_hours: 4,
    due_date: '2025-11-22T00:00:00Z',
    tags: ['setup', 'infrastructure']
  }),
  createTask('Design database schema', 'critical', {
    project_uid: project.uid,
    milestone_uid: milestone1.uid,
    complexity: 'moderate',
    estimated_hours: 8,
    due_date: '2025-11-23T00:00:00Z',
    tags: ['database', 'architecture']
  }),
  createTask('Implement user authentication', 'high', {
    project_uid: project.uid,
    milestone_uid: milestone1.uid,
    complexity: 'complex',
    estimated_hours: 16,
    due_date: '2025-11-30T00:00:00Z',
    tags: ['authentication', 'security']
  }),
  createTask('Create homepage design', 'medium', {
    project_uid: project.uid,
    complexity: 'moderate',
    estimated_hours: 12,
    due_date: '2025-11-25T00:00:00Z',
    tags: ['design', 'ui']
  }),
  createTask('Set up CI/CD pipeline', 'medium', {
    project_uid: project.uid,
    complexity: 'moderate',
    estimated_hours: 6,
    due_date: '2025-11-24T00:00:00Z',
    tags: ['devops', 'automation']
  }),
  createTask('Write API documentation', 'low', {
    project_uid: project.uid,
    complexity: 'simple',
    estimated_hours: 4,
    due_date: '2025-12-10T00:00:00Z',
    tags: ['documentation']
  }),
  createTask('Perform security audit', 'critical', {
    project_uid: project.uid,
    milestone_uid: milestone1.uid,
    complexity: 'complex',
    estimated_hours: 12,
    due_date: '2025-12-12T00:00:00Z',
    tags: ['security', 'audit']
  })
];

console.log(`   Created ${tasks.length} tasks`);

// Update some task statuses
console.log('\n4. Updating task statuses...');
tasks[0] = updateTaskStatus(tasks[0], 'done');
tasks[0].metadata.actual_hours = 3;
tasks[0].metadata.completed_date = '2025-11-21T10:00:00Z';
console.log(`   ✓ ${tasks[0].title} -> DONE`);

tasks[1] = updateTaskStatus(tasks[1], 'in-progress');
tasks[1].metadata.actual_hours = 4;
console.log(`   ⏳ ${tasks[1].title} -> IN PROGRESS`);

tasks[2] = updateTaskStatus(tasks[2], 'todo');
console.log(`   📋 ${tasks[2].title} -> TODO`);

// Task Prioritization
console.log('\n5. Task Prioritization Analysis:');
const prioritized = TaskPrioritizationWorkflow.prioritizeTasks(tasks);
console.log('   Top 3 priority tasks:');
prioritized.slice(0, 3).forEach((task, index) => {
  const score = TaskPrioritizationWorkflow.calculatePriorityScore(task);
  console.log(`   ${index + 1}. [${score}] ${task.title} (${task.metadata.priority}, ${task.metadata.status})`);
});

const nextTasks = TaskPrioritizationWorkflow.getNextTasks(tasks, 3);
console.log('\n   Recommended next tasks to work on:');
nextTasks.forEach((task, index) => {
  console.log(`   ${index + 1}. ${task.title} (${task.metadata.priority})`);
});

// Kanban board
console.log('\n6. Kanban Board View:');
const kanban = groupByKanbanColumns(tasks);
kanban.forEach(column => {
  if (column.tasks.length > 0) {
    console.log(`   ${column.name} (${column.tasks.length}):` + 
      (column.limit ? ` [WIP limit: ${column.limit}]` : ''));
    column.tasks.forEach(task => {
      console.log(`     - ${task.title}`);
    });
  }
});

// Due date grouping
console.log('\n7. Tasks by Due Date:');
const byDueDate = groupByDueDate(tasks);
const dueDateCategories = [
  { key: 'overdue', label: 'Overdue' },
  { key: 'today', label: 'Due Today' },
  { key: 'thisWeek', label: 'Due This Week' },
  { key: 'thisMonth', label: 'Due This Month' }
] as const;

dueDateCategories.forEach(({ key, label }) => {
  const taskList = byDueDate[key];
  if (taskList.length > 0) {
    console.log(`   ${label} (${taskList.length}):`);
    taskList.forEach(task => {
      console.log(`     - ${task.title} (due: ${task.metadata.due_date})`);
    });
  }
});

// Project statistics
console.log('\n8. Project Health & Statistics:');
const projectStats = ProjectTrackingWorkflow.getProjectStats(
  project,
  tasks,
  [milestone1, milestone2]
);
console.log(`   Tasks: ${projectStats.task_count} total`);
console.log(`   Status breakdown:`);
Object.entries(projectStats.tasks_by_status).forEach(([status, count]) => {
  if (count > 0) {
    console.log(`     - ${status}: ${count}`);
  }
});
console.log(`   Completion: ${projectStats.completion_percent}%`);
console.log(`   Health: ${projectStats.health.toUpperCase()}`);
console.log(`   Hours: ${projectStats.actual_hours}/${projectStats.estimated_hours} (${projectStats.budget_status}%)`);

// Task statistics
console.log('\n9. Task Statistics:');
const taskStats = calculateTaskStats(tasks);
console.log(`   Total tasks: ${taskStats.total}`);
console.log(`   By priority:`);
Object.entries(taskStats.by_priority).forEach(([priority, count]) => {
  console.log(`     - ${priority}: ${count}`);
});
console.log(`   Overdue: ${taskStats.overdue}`);
console.log(`   Due this week: ${taskStats.due_this_week}`);
console.log(`   Total estimated hours: ${taskStats.total_estimated_hours}`);
console.log(`   Total actual hours: ${taskStats.total_actual_hours}`);

console.log('\n✅ Task Management Framework test complete!');
console.log('\n📊 Summary:');
console.log(`   - Created 1 project with ${tasks.length} tasks and 2 milestones`);
console.log(`   - Demonstrated task prioritization with smart scoring`);
console.log(`   - Organized tasks in Kanban board format`);
console.log(`   - Grouped tasks by due date for time management`);
console.log(`   - Calculated project health and statistics`);
console.log(`   - Generated comprehensive task analytics`);
