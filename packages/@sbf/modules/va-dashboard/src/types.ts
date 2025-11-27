
import { Entity } from '@sbf/shared';

export type VAIntentType = 
  | 'create_note'
  | 'create_task'
  | 'search'
  | 'summarize'
  | 'answer_question'
  | 'unknown';

export interface VAIntent {
  type: VAIntentType;
  confidence: number;
  entities: Record<string, any>;
  originalQuery: string;
}

export interface VAResponse {
  success: boolean;
  message: string;
  data?: any;
  actionTaken?: string;
}

export interface VAAction {
  id: string;
  name: string;
  description: string;
  execute(intent: VAIntent): Promise<VAResponse>;
  canHandle(intent: VAIntent): boolean;
}
