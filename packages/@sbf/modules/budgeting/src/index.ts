export const MODULE_NAME = '@sbf/budgeting';

export * from './BudgetService';
export { 
  FinancialAccountEntity, 
  FinancialEventEntity,
  FinancialAccountMetadata 
} from '@sbf/frameworks-financial-tracking';

export function init() { 
  console.log('Initializing budgeting module'); 
}