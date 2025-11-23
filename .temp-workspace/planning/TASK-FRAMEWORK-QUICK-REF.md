# Task Management Framework - Quick Reference

## 🚀 Quick Start

```bash
# Build the framework
npm run build

# Run the test
npm run test:task
```

## 📦 Installation

```typescript
import {
  createTask,
  createProject,
  createMilestone,
  TaskPrioritizationWorkflow,
  ProjectTrackingWorkflow
} from '@sbf/frameworks-task-management';
```

## 🎯 Common Use Cases

### Create a Task
```typescript
const task = createTask('Fix login bug', 'high', {
  description: 'Users unable to login with OAuth',
  due_date: '2025-11-30T00:00:00Z',
  estimated_hours: 4,
  complexity: 'moderate',
  tags: ['bug', 'authentication']
});
```

### Create a Project
```typescript
const project = createProject('Mobile App Rewrite', {
  start_date: '2025-12-01T00:00:00Z',
  target_end_date: '2026-03-31T00:00:00Z',
  budget_hours: 500,
  health: 'green'
});
```

### Prioritize Tasks
```typescript
const nextTasks = TaskPrioritizationWorkflow.getNextTasks(allTasks, 5);
// Returns top 5 tasks to work on, considering priority, deadlines, blockers
```

### Check Project Health
```typescript
const health = ProjectTrackingWorkflow.assessProjectHealth(
  project,
  tasks,
  milestones
);
// Returns: 'green' | 'yellow' | 'red'
```

### Organize as Kanban
```typescript
const kanban = groupByKanbanColumns(tasks);
// Returns columns: backlog, todo, in-progress, blocked, review, done
```

## 📊 Priority Scoring

Tasks are scored 0-100 based on:
- **Base Priority** (40 pts): critical=40, high=30, medium=20, low=10
- **Deadline Urgency** (30 pts): overdue=30, due today=25, this week=20
- **In-Progress Boost** (15 pts): tasks already started
- **Complexity** (10 pts): prefer simpler tasks
- **Blocked Penalty** (-15 pts): reduce priority if blocked

## 🏥 Project Health

Health calculated from:
- **Progress vs Timeline** (30%): Are we on schedule?
- **Overdue Tasks** (30%): How many tasks are late?
- **Milestones** (40%): Are we hitting our goals?

Result: Green (≥70), Yellow (40-69), Red (<40)

## 🔧 Utilities

```typescript
// Filter
filterByStatus(tasks, 'in-progress')
filterByPriority(tasks, 'high')
filterByAssignee(tasks, userUid)

// Group
groupByKanbanColumns(tasks)
groupByDueDate(tasks)  // overdue, today, thisWeek, thisMonth, later
groupByProject(tasks)

// Sort
sortByPriority(tasks)
sortByDueDate(tasks)

// Statistics
calculateTaskStats(tasks)  // comprehensive analytics
```

## 📝 Entity Types

### TaskEntity
```typescript
{
  uid: string;
  type: 'task.item';
  title: string;
  metadata: {
    status: TaskStatus;  // backlog → todo → in-progress → done
    priority: TaskPriority;  // critical, high, medium, low
    complexity?: TaskComplexity;  // trivial → epic
    due_date?: string;
    estimated_hours?: number;
    actual_hours?: number;
    assignee_uid?: string;
    project_uid?: string;
    blocked_by_uids?: string[];
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
    status: ProjectStatus;  // planning → active → completed
    health?: 'green' | 'yellow' | 'red';
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
    status: MilestoneStatus;  // planned → achieved
    target_date: string;
    achieved_date?: string;
    project_uid?: string;
    success_criteria?: string[];
    // ... more fields
  }
}
```

## 🎯 Example module: Personal Task Manager

```typescript
import {
  createTask,
  filterActiveTasks,
  groupByDueDate,
  TaskPrioritizationWorkflow
} from '@sbf/frameworks-task-management';

class PersonalTaskManager {
  async getTodaysTasks() {
    const allTasks = await this.loadTasks();
    const active = filterActiveTasks(allTasks);
    const byDate = groupByDueDate(active);
    return byDate.today;
  }

  async getRecommendedTasks() {
    const allTasks = await this.loadTasks();
    return TaskPrioritizationWorkflow.getNextTasks(allTasks, 5);
  }

  async getDailyView() {
    const tasks = await this.loadTasks();
    const byDate = groupByDueDate(tasks);

    return {
      overdue: byDate.overdue,
      today: byDate.today,
      upcoming: byDate.thisWeek,
      nextTasks: TaskPrioritizationWorkflow.getNextTasks(tasks, 3)
    };
  }
}
```

## 📚 Documentation

- Full README: `packages/@sbf/frameworks/task-management/README.md`
- Test Script: `scripts/test-task-management.ts`
- Complete Guide: `TASK-MANAGEMENT-COMPLETE.md`

## 🏆 Built With

- TypeScript (strict mode)
- Full type safety
- Zero dependencies (uses only @sbf/shared)
- 600+ lines of reusable code
- 85%+ code reuse for modules

---

**Quick Help:**
- Questions? Check the full README
- Need examples? Run `npm run test:task`
- Building a module? See `module-DEVELOPMENT-GUIDE.md`

✨ **Happy task managing!**
