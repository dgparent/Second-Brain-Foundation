export const MODULE_NAME = '@sbf/va-dashboard';

export * from './types';
export * from './VAService';
export * from './IntentClassifier';
export * from './actions/BaseAction';
export * from './actions/CreateNoteAction';

export function init() { 
  console.log('Initializing va-dashboard module'); 
}
