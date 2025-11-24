import { ConstructionProject, createConstructionProject } from '../index';

describe('@sbf/modules-construction-ops', () => {
  it('should create ConstructionProject entity', () => {
    const entity = createConstructionProject({} as any);
    expect(entity).toBeDefined();
    expect(entity.type).toBe('construction.construction_project');
    expect(entity.uid).toBeDefined();
    expect(entity.created).toBeDefined();
  });
});
