import { GuardShift, createGuardShift } from '../index';

describe('@sbf/modules-security-ops', () => {
  it('should create GuardShift entity', () => {
    const entity = createGuardShift({} as any);
    expect(entity).toBeDefined();
    expect(entity.type).toBe('security.guard_shift');
    expect(entity.uid).toBeDefined();
    expect(entity.created).toBeDefined();
  });
});
