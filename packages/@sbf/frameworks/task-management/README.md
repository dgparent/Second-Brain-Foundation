# Task Management Framework

**Package:** `@sbf/frameworks-task-management`  
**Version:** 0.1.0  
**Status:** ✅ Complete

## Overview

A comprehensive task and project management framework for Second Brain Foundation. Provides entities, workflows, and utilities for managing tasks, projects, milestones with smart prioritization and tracking.

## Features

### ✅ Core Entities
- **TaskEntity** - Individual tasks with status, priority, assignments
- **ProjectEntity** - Projects with health tracking, budgets, phases
- **MilestoneEntity** - Project milestones with progress tracking

### ✅ Smart Workflows
- **TaskPrioritizationWorkflow** - Eisenhower Matrix + complexity scoring
- **ProjectTrackingWorkflow** - Health assessment, velocity tracking

### ✅ Utilities
- Kanban board grouping
- Task filtering and sorting
- Statistics and analytics
- Due date management

## Quick Start

```typescript
import {
  createTask,
  createProject,
  createMilestone,
  TaskPrioritizationWorkflow,
  ProjectTrackingWorkflow,
  groupByKanbanColumns
} from '@sbf/frameworks-task-management';

// Create a task
const task = createTask('Implement login feature', 'high', {
  description: 'Add OAuth2 authentication',
  due_date: '2025-12-01T00:00:00Z',
  estimated_hours: 8,
  tags: ['authentication', 'security']
});

// Create a project
const project = createProject('Website Redesign', {
  description: 'Complete overhaul of company website',
  start_date: '2025-11-01T00:00:00Z',
  target_end_date: '2026-02-01T00:00:00Z',
  budget_hours: 200
});

// Create a milestone
const milestone = createMilestone(
  'MVP Launch',
  '2025-12-15T00:00:00Z',
  {
    project_uid: project.uid,
    success_criteria: [
      'User authentication working',
      'Basic CRUD operations',
      '100 test users onboarded'
    ]
  }
);

// Prioritize tasks
const tasks = [task, /* ... more tasks */];
const prioritized = TaskPrioritizationWorkflow.prioritizeTasks(tasks);
const nextTasks = TaskPrioritizationWorkflow.getNextTasks(tasks, 5);

// Get project health
const health = ProjectTrackingWorkflow.assessProjectHealth(
  project,
  tasks,
  [milestone]
);

// Organize as Kanban board
const kanban = groupByKanbanColumns(tasks);
```

## Entity Types

### TaskEntity

```typescript
{
  uid: string;
  type: 'task.item';
  title: string;
  metadata: {
    status: 'backlog' | 'todo' | 'in-progress' | 'blocked' | 'review' | 'done' | 'archived';
    priority: 'critical' | 'high' | 'medium' | 'low';
    complexity?: 'trivial' | 'simple' | 'moderate' | 'complex' | 'epic';
    assignee_uid?: string;
    project_uid?: string;
    due_date?: string;
    estimated_hours?: number;
    actual_hours?: number;
    // ... more fields
  }
}
```

### ProjectEntity

```typescript
{
  uid: string;
  type: 'project.item';
  title: string;
  metadata: {
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'archived' | 'cancelled';
    phase?: 'initiation' | 'planning' | 'execution' | 'monitoring' | 'closure';
    health?: 'green' | 'yellow' | 'red';
    owner_uid?: string;
    start_date?: string;
    target_end_date?: string;
    budget_hours?: number;
    // ... more fields
  }
}
```

### MilestoneEntity

```typescript
{
  uid: string;
  type: 'milestone.item';
  title: string;
  metadata: {
    status: 'planned' | 'in-progress' | 'at-risk' | 'achieved' | 'missed' | 'cancelled';
    target_date: string;
    achieved_date?: string;
    project_uid?: string;
    success_criteria?: string[];
    // ... more fields
  }
}
```

## Workflows

### TaskPrioritizationWorkflow

Smart task prioritization using multiple factors:

```typescript
// Calculate priority score (0-100)
const score = TaskPrioritizationWorkflow.calculatePriorityScore(task);

// Get top priority tasks
const nextTasks = TaskPrioritizationWorkflow.getNextTasks(tasks, 5);

// Find overdue tasks
const overdue = TaskPrioritizationWorkflow.findOverdueTasks(tasks);

// Find tasks due soon
const dueSoon = TaskPrioritizationWorkflow.findTasksDueSoon(tasks, 7);
```

**Scoring Algorithm:**
- Base priority (0-40 points)
- Deadline urgency (0-30 points)
- In-progress boost (+15 points)
- Complexity preference (0-10 points)
- Blocked penalty (-15 points)

### ProjectTrackingWorkflow

Monitor project health and progress:

```typescript
// Calculate completion percentage
const completion = ProjectTrackingWorkflow.calculateProjectCompletion(
  project,
  tasks
);

// Assess project health
const health = ProjectTrackingWorkflow.assessProjectHealth(
  project,
  tasks,
  milestones
);

// Get comprehensive statistics
const stats = ProjectTrackingWorkflow.getProjectStats(
  project,
  tasks,
  milestones
);

// Calculate velocity
const velocity = ProjectTrackingWorkflow.calculateProjectVelocity(
  project,
  tasks,
  4  // weeks to analyze
);
```

**Health Assessment Factors:**
- Progress vs. timeline (30%)
- Overdue task ratio (30%)
- Milestone achievement (40%)

## Utilities

### Filtering

```typescript
import {
  filterByStatus,
  filterByPriority,
  filterByAssignee,
  filterByProject,
  filterActiveTasks,
  filterBlockedTasks
} from '@sbf/frameworks-task-management';

const todoTasks = filterByStatus(tasks, 'todo');
const highPriority = filterByPriority(tasks, 'high');
const myTasks = filterByAssignee(tasks, myUid);
```

### Grouping

```typescript
import {
  groupByKanbanColumns,
  groupByProject,
  groupByAssignee,
  groupByDueDate
} from '@sbf/frameworks-task-management';

// Kanban board
const kanban = groupByKanbanColumns(tasks);

// By project
const byProject = groupByProject(tasks);

// By due date
const byDueDate = groupByDueDate(tasks);
// Returns: { overdue, today, thisWeek, thisMonth, later, noDueDate }
```

### Sorting

```typescript
import {
  sortByPriority,
  sortByDueDate,
  sortByCreatedDate
} from '@sbf/frameworks-task-management';

const sorted = sortByPriority(tasks);
```

### Statistics

```typescript
import { calculateTaskStats } from '@sbf/frameworks-task-management';

const stats = calculateTaskStats(tasks);
// Returns: {
//   total, by_status, by_priority,
//   overdue, due_today, due_this_week,
//   blocked, avg_completion_time_hours,
//   total_estimated_hours, total_actual_hours
// }
```

## Plugin Opportunities

This framework enables multiple domain-specific plugins:

### 1. Personal Task Manager Plugin (30 mins)
- Daily task list view
- Calendar integration
- Habit tracking
- Pomodoro timer

### 2. Team Project Management Plugin (1 hour)
- Sprint planning
- Burndown charts
- Team capacity planning
- Standup reports

### 3. Client Work Tracker Plugin (1 hour)
- Client-specific projects
- Time billing
- Invoice generation
- Status reports

### 4. Product Development Plugin (1 hour)
- Feature roadmap
- Bug tracking
- Release planning
- User story management

## Integration Examples

### With VA Dashboard

```typescript
// Extract tasks from emails
const extractedTasks = await extractTasksFromEmail(emailText);
extractedTasks.forEach(task => {
  const taskEntity = createTask(task.title, task.priority, {
    description: task.description,
    due_date: task.dueDate,
    project_uid: clientProject.uid
  });
  
  // Save to memory engine
  await memoryEngine.createEntity(taskEntity);
});
```

### With Calendar

```typescript
// Sync tasks with calendar
const tasksWithDueDates = filterActiveTasks(tasks).filter(
  t => t.metadata.due_date
);

tasksWithDueDates.forEach(task => {
  createCalendarEvent({
    title: task.title,
    date: task.metadata.due_date,
    type: 'task-deadline'
  });
});
```

## Code Reuse

**Framework Code:** ~600 lines  
**Per-Plugin Code:** ~100-150 lines  
**Code Reuse:** **85-90%** ✅

## Architecture

```
task-management/
├── src/
│   ├── entities/
│   │   ├── TaskEntity.ts           # Task entity + helpers
│   │   ├── ProjectEntity.ts        # Project entity + helpers
│   │   └── MilestoneEntity.ts      # Milestone entity + helpers
│   ├── workflows/
│   │   ├── TaskPrioritizationWorkflow.ts   # Smart prioritization
│   │   └── ProjectTrackingWorkflow.ts      # Project analytics
│   ├── utils/
│   │   └── task-utils.ts           # Filtering, grouping, stats
│   └── index.ts                    # Main exports
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT

---

**Created:** 2025-11-21  
**Status:** ✅ Production Ready  
**Part of:** Second Brain Foundation Phase 6
