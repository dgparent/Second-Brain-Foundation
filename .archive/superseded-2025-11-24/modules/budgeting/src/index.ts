// Entities
export * from './entities/TransactionEntity';
export * from './entities/BudgetCategoryEntity';
export * from './entities/BillEntity';

// Workflows
export * from './workflows/BudgetingWorkflow';

// Utils
export * from './utils/helpers';

// Plugin metadata
export const BudgetingPlugin = {
  id: 'sbf-budgeting',
  name: 'Budgeting & Cash Flow Management',
  version: '0.1.0',
  domain: 'finance',
  description: 'Track transactions, manage budgets, monitor bills and subscriptions',
  
  entityTypes: [
    'finance.transaction',
    'finance.budget_category',
    'finance.bill',
  ],
  
  features: [
    'Transaction tracking with auto-categorization',
    'Monthly budget management',
    'Recurring bill tracking',
    'Spending analytics by category and merchant',
    'Budget alerts and notifications',
    'CSV import from banks',
  ],
  
  integrations: [
    'Bank CSV exports',
    'Financial aggregators (Plaid, Flinks)',
  ],
};
