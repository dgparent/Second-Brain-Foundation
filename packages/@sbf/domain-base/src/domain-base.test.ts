/**
 * @sbf/domain-base - Unit Tests
 */

import {
  BaseEntity,
  EmbeddableEntity,
  SingletonEntity,
  now,
  isValidISO8601,
  parseISO8601,
  addDuration,
  Duration,
  modelDumpForSave,
  rowToEntity,
  toSnakeCase,
  toCamelCase,
  deepClone,
  deepEqual,
  DatabaseAdapter,
  EmbeddingProvider,
} from './index';

// Mock database adapter
function createMockDb(): DatabaseAdapter & { 
  _data: Map<string, Record<string, unknown>[]>;
  _tenantId: string | null;
} {
  const data = new Map<string, Record<string, unknown>[]>();
  let tenantId: string | null = null;
  
  return {
    _data: data,
    _tenantId: null,
    
    async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
      const table = sql.match(/FROM (\w+)/i)?.[1];
      if (!table) return [] as T[];
      const rows = data.get(table) || [];
      return rows as T[];
    },
    
    async queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
      const table = sql.match(/FROM (\w+)/i)?.[1];
      if (!table) return null;
      const rows = data.get(table) || [];
      return (rows[0] as T) || null;
    },
    
    async insert(table: string, insertData: Record<string, unknown>): Promise<string> {
      const rows = data.get(table) || [];
      rows.push({ ...insertData, id: insertData.id || 'new-id' });
      data.set(table, rows);
      return insertData.id as string || 'new-id';
    },
    
    async update(table: string, id: string, updateData: Record<string, unknown>): Promise<number> {
      const rows = data.get(table) || [];
      const index = rows.findIndex(r => r.id === id);
      if (index >= 0) {
        rows[index] = { ...rows[index], ...updateData };
        return 1;
      }
      return 0;
    },
    
    async delete(table: string, id: string): Promise<number> {
      const rows = data.get(table) || [];
      const index = rows.findIndex(r => r.id === id);
      if (index >= 0) {
        rows.splice(index, 1);
        data.set(table, rows);
        return 1;
      }
      return 0;
    },
    
    async setTenantContext(tid: string): Promise<void> {
      tenantId = tid;
      this._tenantId = tid;
    },
    
    async beginTransaction(): Promise<void> {},
    async commitTransaction(): Promise<void> {},
    async rollbackTransaction(): Promise<void> {},
  };
}

// Mock embedding provider
function createMockEmbeddingProvider(): EmbeddingProvider {
  return {
    async embed(text: string): Promise<number[]> {
      // Simple mock: return array based on text length
      return Array(384).fill(0).map((_, i) => Math.sin(text.length + i));
    },
    
    async embedBatch(texts: string[]): Promise<number[][]> {
      return Promise.all(texts.map(t => this.embed(t)));
    },
    
    getDimension(): number {
      return 384;
    },
  };
}

// Test entity classes
class TestEntity extends BaseEntity {
  static tableName = 'test_entities';
  name: string = '';
  
  constructor(data: Partial<TestEntity> = {}) {
    super(data);
    this.name = data.name || '';
  }
}

class TestEmbeddableEntity extends EmbeddableEntity {
  static tableName = 'embeddable_entities';
  static autoEmbedding = true;
  content: string = '';
  
  constructor(data: Partial<TestEmbeddableEntity> = {}) {
    super(data);
    this.content = data.content || '';
  }
  
  getEmbeddingContent(): string {
    return this.content;
  }
}

class TestSingletonEntity extends SingletonEntity {
  static tableName = 'singleton_entities';
  static recordIdField = 'config_key';
  configKey: string = '';
  value: string = '';
  
  constructor(data: Partial<TestSingletonEntity> = {}) {
    super(data);
    this.configKey = data.configKey || '';
    this.value = data.value || '';
  }
  
  getRecordId(): string {
    return this.configKey;
  }
}

describe('Timestamp Utilities', () => {
  describe('now', () => {
    it('should return valid ISO8601 timestamp', () => {
      const timestamp = now();
      expect(isValidISO8601(timestamp)).toBe(true);
    });
  });
  
  describe('isValidISO8601', () => {
    it('should validate correct timestamps', () => {
      expect(isValidISO8601('2025-12-28T10:00:00.000Z')).toBe(true);
    });
    
    it('should reject invalid timestamps', () => {
      expect(isValidISO8601('not-a-date')).toBe(false);
      expect(isValidISO8601('2025-13-01')).toBe(false);
    });
  });
  
  describe('parseISO8601', () => {
    it('should parse valid timestamp', () => {
      const date = parseISO8601('2025-12-28T10:00:00.000Z');
      expect(date).toBeInstanceOf(Date);
      expect(date.getUTCFullYear()).toBe(2025);
    });
    
    it('should throw for invalid timestamp', () => {
      expect(() => parseISO8601('invalid')).toThrow();
    });
  });
  
  describe('addDuration', () => {
    it('should add duration to timestamp', () => {
      const start = '2025-12-28T10:00:00.000Z';
      const result = addDuration(start, Duration.HOUR);
      expect(result).toBe('2025-12-28T11:00:00.000Z');
    });
  });
});

describe('Serialization Utilities', () => {
  describe('toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(toSnakeCase('createdAt')).toBe('created_at');
      expect(toSnakeCase('tenantId')).toBe('tenant_id');
      expect(toSnakeCase('simple')).toBe('simple');
    });
  });
  
  describe('toCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(toCamelCase('created_at')).toBe('createdAt');
      expect(toCamelCase('tenant_id')).toBe('tenantId');
      expect(toCamelCase('simple')).toBe('simple');
    });
  });
  
  describe('modelDumpForSave', () => {
    it('should convert entity for database save', () => {
      const entity = {
        id: '123',
        createdAt: '2025-12-28T10:00:00.000Z',
        tenantId: 'tenant-1',
        _internal: 'skip',
      };
      
      const result = modelDumpForSave(entity);
      
      expect(result.id).toBe('123');
      expect(result.created_at).toBe('2025-12-28T10:00:00.000Z');
      expect(result.tenant_id).toBe('tenant-1');
      expect(result._internal).toBeUndefined();
    });
  });
  
  describe('rowToEntity', () => {
    it('should convert database row to entity', () => {
      const row = {
        id: '123',
        created_at: '2025-12-28T10:00:00.000Z',
        tenant_id: 'tenant-1',
      };
      
      const result = rowToEntity<{ id: string; createdAt: string; tenantId: string }>(row);
      
      expect(result.id).toBe('123');
      expect(result.createdAt).toBe('2025-12-28T10:00:00.000Z');
      expect(result.tenantId).toBe('tenant-1');
    });
  });
  
  describe('deepClone', () => {
    it('should deeply clone objects', () => {
      const original = { a: 1, b: { c: 2 }, d: [1, 2, 3] };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.d).not.toBe(original.d);
    });
  });
  
  describe('deepEqual', () => {
    it('should compare objects deeply', () => {
      expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(deepEqual([1, 2], [1, 2])).toBe(true);
      expect(deepEqual([1, 2], [1, 3])).toBe(false);
    });
  });
});

describe('BaseEntity', () => {
  let db: ReturnType<typeof createMockDb>;
  
  beforeEach(() => {
    db = createMockDb();
    TestEntity.configure(db, 'tenant-123');
  });
  
  describe('constructor', () => {
    it('should generate ID for new entity', () => {
      const entity = new TestEntity({ name: 'Test' });
      expect(entity.id).toBeDefined();
      expect(entity.id.length).toBe(36); // UUID format
    });
    
    it('should set timestamps', () => {
      const entity = new TestEntity({ name: 'Test' });
      expect(entity.createdAt).toBeDefined();
      expect(entity.updatedAt).toBeDefined();
    });
    
    it('should mark as new', () => {
      const entity = new TestEntity({ name: 'Test' });
      expect(entity.isNew()).toBe(true);
    });
    
    it('should mark as not new when ID is provided', () => {
      const entity = new TestEntity({
        id: 'existing-id',
        name: 'Test',
        createdAt: now(),
        updatedAt: now(),
        tenantId: 'tenant-1',
      });
      expect(entity.isNew()).toBe(false);
    });
  });
  
  describe('save', () => {
    it('should insert new entity', async () => {
      const entity = new TestEntity({ name: 'Test' });
      await entity.save();
      
      expect(entity.isNew()).toBe(false);
      expect(db._data.get('test_entities')).toHaveLength(1);
    });
    
    it('should update existing entity', async () => {
      const entity = new TestEntity({ name: 'Test' });
      await entity.save();
      
      entity.name = 'Updated';
      await entity.save();
      
      expect(db._data.get('test_entities')).toHaveLength(1);
    });
    
    it('should update updatedAt timestamp', async () => {
      const entity = new TestEntity({ name: 'Test' });
      const originalUpdatedAt = entity.updatedAt;
      
      // Wait a tiny bit to ensure different timestamp
      await new Promise(r => setTimeout(r, 10));
      await entity.save();
      
      expect(entity.updatedAt).not.toBe(originalUpdatedAt);
    });
  });
  
  describe('delete', () => {
    it('should delete entity', async () => {
      const entity = new TestEntity({ name: 'Test' });
      await entity.save();
      
      const result = await entity.delete();
      
      expect(result).toBe(true);
      expect(db._data.get('test_entities')).toHaveLength(0);
    });
  });
  
  describe('toJSON', () => {
    it('should exclude internal fields', () => {
      const entity = new TestEntity({ name: 'Test' });
      const json = entity.toJSON();
      
      expect(json.name).toBe('Test');
      expect(json._isNew).toBeUndefined();
      expect(json._original).toBeUndefined();
    });
  });
});

describe('EmbeddableEntity', () => {
  let db: ReturnType<typeof createMockDb>;
  let embeddingProvider: EmbeddingProvider;
  
  beforeEach(() => {
    db = createMockDb();
    embeddingProvider = createMockEmbeddingProvider();
    TestEmbeddableEntity.configure(db, 'tenant-123');
    TestEmbeddableEntity.configureEmbedding(embeddingProvider);
  });
  
  describe('getEmbeddingContent', () => {
    it('should return content for embedding', () => {
      const entity = new TestEmbeddableEntity({ content: 'Test content' });
      expect(entity.getEmbeddingContent()).toBe('Test content');
    });
  });
  
  describe('generateEmbedding', () => {
    it('should generate embedding vector', async () => {
      const entity = new TestEmbeddableEntity({ content: 'Test content' });
      await entity.generateEmbedding();
      
      expect(entity.embedding).toBeDefined();
      expect(entity.embedding).toHaveLength(384);
      expect(entity.embeddingGeneratedAt).toBeDefined();
      expect(entity.embeddingContentHash).toBeDefined();
    });
    
    it('should throw for empty content', async () => {
      const entity = new TestEmbeddableEntity({ content: '' });
      await expect(entity.generateEmbedding()).rejects.toThrow();
    });
  });
  
  describe('needsReembedding', () => {
    it('should return true for new entity', () => {
      const entity = new TestEmbeddableEntity({ content: 'Test' });
      expect(entity.needsReembedding()).toBe(true);
    });
    
    it('should return false after embedding', async () => {
      const entity = new TestEmbeddableEntity({ content: 'Test' });
      await entity.generateEmbedding();
      expect(entity.needsReembedding()).toBe(false);
    });
    
    it('should return true when content changes', async () => {
      const entity = new TestEmbeddableEntity({ content: 'Test' });
      await entity.generateEmbedding();
      
      entity.content = 'Changed content';
      expect(entity.needsReembedding()).toBe(true);
    });
  });
  
  describe('save with autoEmbedding', () => {
    it('should generate embedding on save', async () => {
      const entity = new TestEmbeddableEntity({ content: 'Test content' });
      await entity.save();
      
      expect(entity.embedding).toBeDefined();
      expect(entity.embedding).toHaveLength(384);
    });
    
    it('should skip embedding when option set', async () => {
      const entity = new TestEmbeddableEntity({ content: 'Test content' });
      await entity.save({ skipEmbedding: true });
      
      expect(entity.embedding).toBeUndefined();
    });
  });
});

describe('SingletonEntity', () => {
  let db: ReturnType<typeof createMockDb>;
  
  beforeEach(() => {
    db = createMockDb();
    TestSingletonEntity.configure(db, 'tenant-123');
    TestSingletonEntity.clearCache();
  });
  
  describe('getInstance', () => {
    it('should create new instance if not exists', async () => {
      const instance = await (TestSingletonEntity as any).getInstance('config-key-1', {
        defaults: { value: 'default' },
      });
      
      expect(instance).toBeInstanceOf(TestSingletonEntity);
      expect(instance.configKey).toBe('config-key-1');
      expect(instance.value).toBe('default');
    });
    
    it('should return cached instance', async () => {
      const first = await (TestSingletonEntity as any).getInstance('config-key-1', {
        defaults: { value: 'first' },
      });
      await first.save();
      
      const second = await (TestSingletonEntity as any).getInstance('config-key-1');
      
      expect(second).toBe(first);
    });
  });
  
  describe('getRecordId', () => {
    it('should return the record identifier', () => {
      const instance = new TestSingletonEntity({ configKey: 'test-key' });
      expect(instance.getRecordId()).toBe('test-key');
    });
  });
});
