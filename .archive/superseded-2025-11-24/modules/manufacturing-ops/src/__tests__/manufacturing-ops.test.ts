import { ProductionBatch, createProductionBatch } from '../index';

describe('@sbf/modules-manufacturing-ops', () => {
  it('should create ProductionBatch entity', () => {
    const entity = createProductionBatch({} as any);
    expect(entity).toBeDefined();
    expect(entity.type).toBe('manufacturing.production_batch');
    expect(entity.uid).toBeDefined();
    expect(entity.created).toBeDefined();
  });
});
