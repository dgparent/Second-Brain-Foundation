import { Entity } from '@sbf/shared';

export interface LegalEntity extends Entity {
  metadata: {
    client?: string;
    jurisdiction?: string;
    status: string;
    [key: string]: any;
  };
}

export function createLegalPrivacy() {
  return {
    level: 'confidential' as const,
    privacy: {
      cloud_ai_allowed: false,
      local_ai_allowed: true,
      export_allowed: true,
    },
  };
}
