import { EnergySite, createEnergySite } from '../index';

describe('@sbf/renewable-ops', () => {
  it('should create EnergySite entity', () => {
    const entity = createEnergySite({} as any);
    expect(entity).toBeDefined();
    expect(entity.type).toBe('renewable.energy_site');
    expect(entity.uid).toBeDefined();
    expect(entity.created).toBeDefined();
  });
});
