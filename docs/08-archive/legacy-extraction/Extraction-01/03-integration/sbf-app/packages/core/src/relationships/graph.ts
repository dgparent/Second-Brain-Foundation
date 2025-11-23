/**
 * Relationship Graph
 */

import { Relationship } from '../types';

export interface GraphInterface {
  addRelationship(fromUid: string, relationship: Relationship): Promise<void>;
  getRelationships(uid: string): Promise<Relationship[]>;
  traverse(uid: string, relationshipType?: string): Promise<string[]>;
}
