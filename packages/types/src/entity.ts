import { EntityType } from './generated-ontology';

export interface Entity {
  id: string;
  tenantId: string;
  type: EntityType;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateEntityInput {
  type: EntityType;
  name: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdateEntityInput {
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
}
