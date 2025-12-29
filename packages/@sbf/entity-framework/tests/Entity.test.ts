/**
 * Tests for Entity classes
 */

import { Entity, EntityType, EntityRelationship } from '../src/entities';
import { LifecycleState } from '../src/types';

describe('Entity', () => {
  describe('constructor', () => {
    it('should create entity with defaults', () => {
      const entity = new Entity({
        tenantId: 'tenant-123',
        uid: 'person-john-001',
        typeSlug: 'person',
        name: 'John Smith',
      });
      
      expect(entity.sensitivity).toBe('personal');
      expect(entity.truthLevel).toBe('U1');
      expect(entity.lifecycleState).toBe(LifecycleState.CAPTURED);
      expect(entity.capturedAt).toBeInstanceOf(Date);
    });
    
    it('should use provided values', () => {
      const entity = new Entity({
        tenantId: 'tenant-123',
        uid: 'project-secret-001',
        typeSlug: 'project',
        name: 'Secret Project',
        sensitivity: 'confidential',
        truthLevel: 'L2',
      });
      
      expect(entity.sensitivity).toBe('confidential');
      expect(entity.truthLevel).toBe('L2');
    });
  });
  
  describe('getAgeInHours', () => {
    it('should calculate age correctly', () => {
      const entity = new Entity({
        tenantId: 'tenant-123',
        uid: 'person-test-001',
        typeSlug: 'person',
        name: 'Test',
        capturedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      });
      
      const age = entity.getAgeInHours();
      expect(age).toBeGreaterThanOrEqual(23.9);
      expect(age).toBeLessThanOrEqual(24.1);
    });
  });
  
  describe('isReadyForTransition', () => {
    it('should return true for old captured entities', () => {
      const entity = new Entity({
        tenantId: 'tenant-123',
        uid: 'person-test-001',
        typeSlug: 'person',
        name: 'Test',
        lifecycleState: LifecycleState.CAPTURED,
        capturedAt: new Date(Date.now() - 50 * 60 * 60 * 1000), // 50 hours ago
      });
      
      expect(entity.isReadyForTransition()).toBe(true);
    });
    
    it('should return false for recent entities', () => {
      const entity = new Entity({
        tenantId: 'tenant-123',
        uid: 'person-test-001',
        typeSlug: 'person',
        name: 'Test',
        lifecycleState: LifecycleState.CAPTURED,
        capturedAt: new Date(), // now
      });
      
      expect(entity.isReadyForTransition()).toBe(false);
    });
    
    it('should return false for non-captured entities', () => {
      const entity = new Entity({
        tenantId: 'tenant-123',
        uid: 'person-test-001',
        typeSlug: 'person',
        name: 'Test',
        lifecycleState: LifecycleState.PERMANENT,
        capturedAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
      });
      
      expect(entity.isReadyForTransition()).toBe(false);
    });
  });
  
  describe('validate', () => {
    it('should validate complete entity', () => {
      const entity = new Entity({
        tenantId: 'tenant-123',
        uid: 'person-john-001',
        typeSlug: 'person',
        name: 'John Smith',
      });
      
      const result = entity.validate();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should detect missing tenant ID', () => {
      const entity = new Entity({
        uid: 'person-john-001',
        typeSlug: 'person',
        name: 'John',
      });
      
      const result = entity.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tenant ID is required');
    });
    
    it('should detect invalid UID format', () => {
      const entity = new Entity({
        tenantId: 'tenant-123',
        uid: 'invalid',
        typeSlug: 'person',
        name: 'John',
      });
      
      const result = entity.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('UID must be in format {type}-{slug}-{counter}');
    });
    
    it('should detect empty name', () => {
      const entity = new Entity({
        tenantId: 'tenant-123',
        uid: 'person-john-001',
        typeSlug: 'person',
        name: '   ',
      });
      
      const result = entity.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name is required');
    });
  });
  
  describe('fromRow/toRow', () => {
    it('should round-trip through database format', () => {
      const original = new Entity({
        id: 'entity-123',
        tenantId: 'tenant-123',
        uid: 'person-john-001',
        typeSlug: 'person',
        name: 'John Smith',
        content: 'Bio content',
        sensitivity: 'confidential',
        truthLevel: 'L1',
        lifecycleState: LifecycleState.PERMANENT,
        metadata: { role: 'Developer' },
      });
      
      const row = original.toRow();
      const restored = Entity.fromRow(row);
      
      expect(restored.uid).toBe(original.uid);
      expect(restored.name).toBe(original.name);
      expect(restored.sensitivity).toBe(original.sensitivity);
      expect(restored.truthLevel).toBe(original.truthLevel);
      expect(restored.lifecycleState).toBe(original.lifecycleState);
    });
  });
});

describe('EntityType', () => {
  describe('validate', () => {
    it('should validate complete entity type', () => {
      const type = new EntityType({
        name: 'Person',
        slug: 'person',
        icon: 'user',
        color: '#3B82F6',
        folderPath: 'People/',
        template: '# {{name}}',
      });
      
      const result = type.validate();
      expect(result.valid).toBe(true);
    });
    
    it('should reject invalid slug', () => {
      const type = new EntityType({
        name: 'Person',
        slug: 'Person', // uppercase not allowed
        icon: 'user',
        color: '#3B82F6',
        folderPath: 'People/',
        template: '# {{name}}',
      });
      
      const result = type.validate();
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Slug'))).toBe(true);
    });
    
    it('should reject invalid color', () => {
      const type = new EntityType({
        name: 'Person',
        slug: 'person',
        icon: 'user',
        color: 'blue', // not hex
        folderPath: 'People/',
        template: '# {{name}}',
      });
      
      const result = type.validate();
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Color'))).toBe(true);
    });
  });
});

describe('EntityRelationship', () => {
  describe('validate', () => {
    it('should validate complete relationship', () => {
      const rel = new EntityRelationship({
        tenantId: 'tenant-123',
        sourceUid: 'person-john-001',
        targetUid: 'project-website-001',
        relationshipType: 'works_on',
      });
      
      const result = rel.validate();
      expect(result.valid).toBe(true);
    });
    
    it('should reject self-referential relationship', () => {
      const rel = new EntityRelationship({
        tenantId: 'tenant-123',
        sourceUid: 'person-john-001',
        targetUid: 'person-john-001',
        relationshipType: 'related_to',
      });
      
      const result = rel.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Cannot create self-referential relationship');
    });
    
    it('should validate confidence range', () => {
      const rel = new EntityRelationship({
        tenantId: 'tenant-123',
        sourceUid: 'person-john-001',
        targetUid: 'project-website-001',
        relationshipType: 'works_on',
        confidence: 1.5, // invalid
      });
      
      const result = rel.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Confidence must be between 0 and 1');
    });
  });
  
  describe('getInverseType', () => {
    it('should return inverse for hierarchical relationships', () => {
      const rel = new EntityRelationship({
        tenantId: 'tenant-123',
        sourceUid: 'topic-parent-001',
        targetUid: 'topic-child-001',
        relationshipType: 'parent_of',
      });
      
      expect(rel.getInverseType()).toBe('child_of');
    });
    
    it('should return null for non-invertible relationships', () => {
      const rel = new EntityRelationship({
        tenantId: 'tenant-123',
        sourceUid: 'person-john-001',
        targetUid: 'project-website-001',
        relationshipType: 'works_on',
      });
      
      expect(rel.getInverseType()).toBeNull();
    });
  });
});
