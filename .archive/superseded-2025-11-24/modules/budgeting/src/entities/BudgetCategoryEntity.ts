/**
 * Base Entity interface (from Financial Framework)
 */
interface Entity {
  uid: string;
  type: string;
  title: string;
  lifecycle: { state: string };
  sensitivity: {
    level: string;
    privacy: {
      cloud_ai_allowed: boolean;
      local_ai_allowed: boolean;
      export_allowed: boolean;
    };
  };
  created: string;
  updated: string;
  metadata: Record<string, any>;
}

/**
 * Budget category metadata
 */
export interface BudgetCategoryMetadata {
  name: string;
  monthly_limit: number;
  currency: string;
  color?: string;              // For UI visualization
  icon?: string;               // Emoji or icon name
  parent_category?: string;    // For subcategories
  notes?: string;
}

/**
 * Budget category entity
 */
export interface BudgetCategoryEntity extends Entity {
  type: 'finance.budget_category';
  metadata: BudgetCategoryMetadata;
}

/**
 * Helper function to create a budget category
 */
export function createBudgetCategory(data: {
  uid: string;
  name: string;
  monthly_limit: number;
  currency: string;
  color?: string;
  icon?: string;
}): BudgetCategoryEntity {
  return {
    uid: data.uid,
    type: 'finance.budget_category',
    title: data.name,
    lifecycle: { state: 'permanent' },
    sensitivity: {
      level: 'normal',
      privacy: {
        cloud_ai_allowed: true,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      name: data.name,
      monthly_limit: data.monthly_limit,
      currency: data.currency,
      color: data.color,
      icon: data.icon,
    },
  };
}
