
import { VAAction, VAIntent, VAResponse } from '../types';
import { EntityManager } from '@sbf/core-entity-manager';

export abstract class BaseAction implements VAAction {
  abstract id: string;
  abstract name: string;
  abstract description: string;

  constructor(protected entityManager: EntityManager) {}

  abstract execute(intent: VAIntent): Promise<VAResponse>;
  abstract canHandle(intent: VAIntent): boolean;
}
