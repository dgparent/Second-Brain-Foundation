import { TaskEntity, TaskStatus, TaskPriority } from '../entities/TaskEntity';

/**
 * Task filtering utilities
 */

export function filterByStatus(tasks: TaskEntity[], status: TaskStatus): TaskEntity[] {
  return tasks.filter(task => task.metadata.status === status);
}

export function filterByPriority(tasks: TaskEntity[], priority: TaskPriority): TaskEntity[] {
  return tasks.filter(task => task.metadata.priority === priority);
}

export function filterByAssignee(tasks: TaskEntity[], assigneeUid: string): TaskEntity[] {
  return tasks.filter(task => task.metadata.assignee_uid === assigneeUid);
}

export function filterByProject(tasks: TaskEntity[], projectUid: string): TaskEntity[] {
  return tasks.filter(task => task.metadata.project_uid === projectUid);
}

export function filterByTags(tasks: TaskEntity[], tags: string[]): TaskEntity[] {
  return tasks.filter(task => 
    tags.some(tag => task.metadata.tags.includes(tag))
  );
}

export function filterActiveTasks(tasks: TaskEntity[]): TaskEntity[] {
  return tasks.filter(task => 
    task.metadata.status !== 'done' && 
    task.metadata.status !== 'archived'
  );
}

export function filterBlockedTasks(tasks: TaskEntity[]): TaskEntity[] {
  return tasks.filter(task => 
    task.metadata.blocked_by_uids && 
    task.metadata.blocked_by_uids.length > 0
  );
}

/**
 * Kanban board grouping
 */
export interface KanbanColumn {
  status: TaskStatus;
  name: string;
  tasks: TaskEntity[];
  limit?: number;  // WIP limit
}

export function groupByKanbanColumns(tasks: TaskEntity[]): KanbanColumn[] {
  const columns: KanbanColumn[] = [
    { status: 'backlog', name: 'Backlog', tasks: [] },
    { status: 'todo', name: 'To Do', tasks: [], limit: 10 },
    { status: 'in-progress', name: 'In Progress', tasks: [], limit: 3 },
    { status: 'blocked', name: 'Blocked', tasks: [] },
    { status: 'review', name: 'Review', tasks: [], limit: 5 },
    { status: 'done', name: 'Done', tasks: [] }
  ];
  
  tasks.forEach(task => {
    const column = columns.find(col => col.status === task.metadata.status);
    if (column) {
      column.tasks.push(task);
    }
  });
  
  return columns;
}

/**
 * Task grouping utilities
 */

export function groupByProject(tasks: TaskEntity[]): Map<string, TaskEntity[]> {
  const groups = new Map<string, TaskEntity[]>();
  
  tasks.forEach(task => {
    const projectUid = task.metadata.project_uid || 'no-project';
    if (!groups.has(projectUid)) {
      groups.set(projectUid, []);
    }
    groups.get(projectUid)!.push(task);
  });
  
  return groups;
}

export function groupByAssignee(tasks: TaskEntity[]): Map<string, TaskEntity[]> {
  const groups = new Map<string, TaskEntity[]>();
  
  tasks.forEach(task => {
    const assigneeUid = task.metadata.assignee_uid || 'unassigned';
    if (!groups.has(assigneeUid)) {
      groups.set(assigneeUid, []);
    }
    groups.get(assigneeUid)!.push(task);
  });
  
  return groups;
}

export function groupByDueDate(tasks: TaskEntity[]): {
  overdue: TaskEntity[];
  today: TaskEntity[];
  thisWeek: TaskEntity[];
  thisMonth: TaskEntity[];
  later: TaskEntity[];
  noDueDate: TaskEntity[];
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const groups = {
    overdue: [] as TaskEntity[],
    today: [] as TaskEntity[],
    thisWeek: [] as TaskEntity[],
    thisMonth: [] as TaskEntity[],
    later: [] as TaskEntity[],
    noDueDate: [] as TaskEntity[]
  };
  
  tasks.forEach(task => {
    if (!task.metadata.due_date) {
      groups.noDueDate.push(task);
      return;
    }
    
    const dueDate = new Date(task.metadata.due_date);
    
    if (dueDate < today) {
      groups.overdue.push(task);
    } else if (dueDate.toDateString() === today.toDateString()) {
      groups.today.push(task);
    } else if (dueDate <= endOfWeek) {
      groups.thisWeek.push(task);
    } else if (dueDate <= endOfMonth) {
      groups.thisMonth.push(task);
    } else {
      groups.later.push(task);
    }
  });
  
  return groups;
}

/**
 * Task sorting utilities
 */

export function sortByPriority(tasks: TaskEntity[]): TaskEntity[] {
  const priorityOrder: Record<TaskPriority, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };
  
  return [...tasks].sort((a, b) => 
    priorityOrder[b.metadata.priority] - priorityOrder[a.metadata.priority]
  );
}

export function sortByDueDate(tasks: TaskEntity[]): TaskEntity[] {
  return [...tasks].sort((a, b) => {
    if (!a.metadata.due_date && !b.metadata.due_date) return 0;
    if (!a.metadata.due_date) return 1;
    if (!b.metadata.due_date) return -1;
    
    return new Date(a.metadata.due_date).getTime() - new Date(b.metadata.due_date).getTime();
  });
}

export function sortByCreatedDate(tasks: TaskEntity[]): TaskEntity[] {
  return [...tasks].sort((a, b) => 
    new Date(b.metadata.created_date).getTime() - new Date(a.metadata.created_date).getTime()
  );
}

/**
 * Task statistics
 */

export function calculateTaskStats(tasks: TaskEntity[]) {
  const stats = {
    total: tasks.length,
    by_status: {} as Record<TaskStatus, number>,
    by_priority: {} as Record<TaskPriority, number>,
    overdue: 0,
    due_today: 0,
    due_this_week: 0,
    blocked: 0,
    avg_completion_time_hours: 0,
    total_estimated_hours: 0,
    total_actual_hours: 0
  };
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  let completionTimes: number[] = [];
  
  tasks.forEach(task => {
    // Count by status
    stats.by_status[task.metadata.status] = (stats.by_status[task.metadata.status] || 0) + 1;
    
    // Count by priority
    stats.by_priority[task.metadata.priority] = (stats.by_priority[task.metadata.priority] || 0) + 1;
    
    // Count overdue
    if (task.metadata.due_date && new Date(task.metadata.due_date) < today) {
      stats.overdue++;
    }
    
    // Count due today
    if (task.metadata.due_date && new Date(task.metadata.due_date).toDateString() === today.toDateString()) {
      stats.due_today++;
    }
    
    // Count due this week
    if (task.metadata.due_date) {
      const dueDate = new Date(task.metadata.due_date);
      if (dueDate >= today && dueDate <= endOfWeek) {
        stats.due_this_week++;
      }
    }
    
    // Count blocked
    if (task.metadata.blocked_by_uids && task.metadata.blocked_by_uids.length > 0) {
      stats.blocked++;
    }
    
    // Sum hours
    stats.total_estimated_hours += task.metadata.estimated_hours || 0;
    stats.total_actual_hours += task.metadata.actual_hours || 0;
    
    // Calculate completion time
    if (task.metadata.completed_date) {
      const created = new Date(task.metadata.created_date).getTime();
      const completed = new Date(task.metadata.completed_date).getTime();
      const hoursToComplete = (completed - created) / (1000 * 60 * 60);
      completionTimes.push(hoursToComplete);
    }
  });
  
  // Average completion time
  if (completionTimes.length > 0) {
    stats.avg_completion_time_hours = 
      completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length;
  }
  
  return stats;
}
