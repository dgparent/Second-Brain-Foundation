/**
 * Constants Tests
 *
 * Tests for the privacy constants and utility functions.
 */

import {
  SensitivityLevel,
  DEFAULT_PERMISSIONS,
  SENSITIVITY_HIERARCHY,
  getSensitivityIndex,
  isMoreRestrictive,
  getMostRestrictive,
  getMostRestrictiveFromArray,
  isCloudProvider,
  isLocalProvider,
} from '../src';

describe('DEFAULT_PERMISSIONS', () => {
  it('should have all four sensitivity levels', () => {
    expect(DEFAULT_PERMISSIONS[SensitivityLevel.PUBLIC]).toBeDefined();
    expect(DEFAULT_PERMISSIONS[SensitivityLevel.PERSONAL]).toBeDefined();
    expect(DEFAULT_PERMISSIONS[SensitivityLevel.CONFIDENTIAL]).toBeDefined();
    expect(DEFAULT_PERMISSIONS[SensitivityLevel.SECRET]).toBeDefined();
  });

  describe('PUBLIC permissions', () => {
    const perms = DEFAULT_PERMISSIONS[SensitivityLevel.PUBLIC];

    it('should allow all AI access', () => {
      expect(perms.cloud_ai_allowed).toBe(true);
      expect(perms.local_ai_allowed).toBe(true);
    });

    it('should allow all operations', () => {
      expect(perms.export_allowed).toBe(true);
      expect(perms.sync_allowed).toBe(true);
      expect(perms.share_allowed).toBe(true);
      expect(perms.index_allowed).toBe(true);
    });
  });

  describe('PERSONAL permissions (default per FR16)', () => {
    const perms = DEFAULT_PERMISSIONS[SensitivityLevel.PERSONAL];

    it('should block cloud AI per FR18', () => {
      expect(perms.cloud_ai_allowed).toBe(false);
    });

    it('should allow local AI', () => {
      expect(perms.local_ai_allowed).toBe(true);
    });

    it('should allow export and sync', () => {
      expect(perms.export_allowed).toBe(true);
      expect(perms.sync_allowed).toBe(true);
    });

    it('should block sharing', () => {
      expect(perms.share_allowed).toBe(false);
    });

    it('should allow indexing', () => {
      expect(perms.index_allowed).toBe(true);
    });
  });

  describe('CONFIDENTIAL permissions', () => {
    const perms = DEFAULT_PERMISSIONS[SensitivityLevel.CONFIDENTIAL];

    it('should block cloud AI', () => {
      expect(perms.cloud_ai_allowed).toBe(false);
    });

    it('should allow local AI', () => {
      expect(perms.local_ai_allowed).toBe(true);
    });

    it('should block export and sync', () => {
      expect(perms.export_allowed).toBe(false);
      expect(perms.sync_allowed).toBe(false);
    });

    it('should block sharing', () => {
      expect(perms.share_allowed).toBe(false);
    });

    it('should allow local indexing', () => {
      expect(perms.index_allowed).toBe(true);
    });
  });

  describe('SECRET permissions (FR19)', () => {
    const perms = DEFAULT_PERMISSIONS[SensitivityLevel.SECRET];

    it('should block ALL AI per FR19', () => {
      expect(perms.cloud_ai_allowed).toBe(false);
      expect(perms.local_ai_allowed).toBe(false);
    });

    it('should block all operations', () => {
      expect(perms.export_allowed).toBe(false);
      expect(perms.sync_allowed).toBe(false);
      expect(perms.share_allowed).toBe(false);
      expect(perms.index_allowed).toBe(false);
    });
  });
});

describe('SENSITIVITY_HIERARCHY', () => {
  it('should be ordered from least to most restrictive', () => {
    expect(SENSITIVITY_HIERARCHY).toEqual([
      SensitivityLevel.PUBLIC,
      SensitivityLevel.PERSONAL,
      SensitivityLevel.CONFIDENTIAL,
      SensitivityLevel.SECRET,
    ]);
  });
});

describe('getSensitivityIndex', () => {
  it('should return 0 for public', () => {
    expect(getSensitivityIndex(SensitivityLevel.PUBLIC)).toBe(0);
  });

  it('should return 1 for personal', () => {
    expect(getSensitivityIndex(SensitivityLevel.PERSONAL)).toBe(1);
  });

  it('should return 2 for confidential', () => {
    expect(getSensitivityIndex(SensitivityLevel.CONFIDENTIAL)).toBe(2);
  });

  it('should return 3 for secret', () => {
    expect(getSensitivityIndex(SensitivityLevel.SECRET)).toBe(3);
  });
});

describe('isMoreRestrictive', () => {
  it('should return true when first level is more restrictive', () => {
    expect(isMoreRestrictive(SensitivityLevel.SECRET, SensitivityLevel.PUBLIC)).toBe(true);
    expect(isMoreRestrictive(SensitivityLevel.CONFIDENTIAL, SensitivityLevel.PERSONAL)).toBe(true);
    expect(isMoreRestrictive(SensitivityLevel.PERSONAL, SensitivityLevel.PUBLIC)).toBe(true);
  });

  it('should return false when first level is less restrictive', () => {
    expect(isMoreRestrictive(SensitivityLevel.PUBLIC, SensitivityLevel.SECRET)).toBe(false);
    expect(isMoreRestrictive(SensitivityLevel.PERSONAL, SensitivityLevel.CONFIDENTIAL)).toBe(false);
  });

  it('should return false when levels are equal', () => {
    expect(isMoreRestrictive(SensitivityLevel.PERSONAL, SensitivityLevel.PERSONAL)).toBe(false);
  });
});

describe('getMostRestrictive', () => {
  it('should return the more restrictive of two levels', () => {
    expect(getMostRestrictive(SensitivityLevel.PUBLIC, SensitivityLevel.SECRET)).toBe(SensitivityLevel.SECRET);
    expect(getMostRestrictive(SensitivityLevel.SECRET, SensitivityLevel.PUBLIC)).toBe(SensitivityLevel.SECRET);
    expect(getMostRestrictive(SensitivityLevel.PERSONAL, SensitivityLevel.CONFIDENTIAL)).toBe(SensitivityLevel.CONFIDENTIAL);
  });

  it('should return either when levels are equal', () => {
    expect(getMostRestrictive(SensitivityLevel.PERSONAL, SensitivityLevel.PERSONAL)).toBe(SensitivityLevel.PERSONAL);
  });
});

describe('getMostRestrictiveFromArray', () => {
  it('should return the most restrictive level from an array', () => {
    expect(getMostRestrictiveFromArray([
      SensitivityLevel.PUBLIC,
      SensitivityLevel.PERSONAL,
      SensitivityLevel.CONFIDENTIAL,
    ])).toBe(SensitivityLevel.CONFIDENTIAL);
  });

  it('should return secret if present', () => {
    expect(getMostRestrictiveFromArray([
      SensitivityLevel.PUBLIC,
      SensitivityLevel.SECRET,
      SensitivityLevel.PERSONAL,
    ])).toBe(SensitivityLevel.SECRET);
  });

  it('should return personal for empty array', () => {
    expect(getMostRestrictiveFromArray([])).toBe(SensitivityLevel.PERSONAL);
  });

  it('should handle single element array', () => {
    expect(getMostRestrictiveFromArray([SensitivityLevel.PUBLIC])).toBe(SensitivityLevel.PUBLIC);
  });
});

describe('isCloudProvider', () => {
  it('should identify cloud providers', () => {
    expect(isCloudProvider('openai')).toBe(true);
    expect(isCloudProvider('anthropic')).toBe(true);
    expect(isCloudProvider('google')).toBe(true);
    expect(isCloudProvider('azure')).toBe(true);
    expect(isCloudProvider('cohere')).toBe(true);
  });

  it('should be case-insensitive', () => {
    expect(isCloudProvider('OpenAI')).toBe(true);
    expect(isCloudProvider('ANTHROPIC')).toBe(true);
  });

  it('should return false for local providers', () => {
    expect(isCloudProvider('ollama')).toBe(false);
    expect(isCloudProvider('llama.cpp')).toBe(false);
  });
});

describe('isLocalProvider', () => {
  it('should identify local providers', () => {
    expect(isLocalProvider('ollama')).toBe(true);
    expect(isLocalProvider('llama.cpp')).toBe(true);
    expect(isLocalProvider('gpt4all')).toBe(true);
    expect(isLocalProvider('localai')).toBe(true);
  });

  it('should be case-insensitive', () => {
    expect(isLocalProvider('Ollama')).toBe(true);
    expect(isLocalProvider('LOCALAI')).toBe(true);
  });

  it('should return false for cloud providers', () => {
    expect(isLocalProvider('openai')).toBe(false);
    expect(isLocalProvider('anthropic')).toBe(false);
  });
});
