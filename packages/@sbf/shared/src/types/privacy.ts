/**
 * Privacy & Sensitivity Management
 * Context-aware AI permissions
 */

export type SensitivityLevel = 'public' | 'personal' | 'confidential' | 'secret';

export interface PrivacySettings {
  cloud_ai_allowed: boolean;
  local_ai_allowed: boolean;
  export_allowed: boolean;
  sync_allowed?: boolean;
  share_allowed?: boolean;
}

export interface Sensitivity {
  level: SensitivityLevel;
  privacy: PrivacySettings;
  custom_rules?: PrivacyRule[];
}

export interface PrivacyRule {
  condition: string;       // e.g., "entity.type === 'va-client'"
  action: 'allow' | 'deny' | 'redact';
  scope: keyof PrivacySettings;
  priority: number;        // Higher priority rules override lower
}

export const SENSITIVITY_DEFAULTS: Record<SensitivityLevel, PrivacySettings> = {
  public: {
    cloud_ai_allowed: true,
    local_ai_allowed: true,
    export_allowed: true,
    sync_allowed: true,
    share_allowed: true,
  },
  personal: {
    cloud_ai_allowed: false,
    local_ai_allowed: true,
    export_allowed: true,
    sync_allowed: true,
    share_allowed: false,
  },
  confidential: {
    cloud_ai_allowed: false,
    local_ai_allowed: true,
    export_allowed: false,
    sync_allowed: false,
    share_allowed: false,
  },
  secret: {
    cloud_ai_allowed: false,
    local_ai_allowed: false,
    export_allowed: false,
    sync_allowed: false,
    share_allowed: false,
  },
};

export interface PrivacyContext {
  user_id: string;
  location: 'local' | 'cloud' | 'export' | 'share';
  ai_provider?: 'local' | 'cloud';
  purpose: string;
}

export interface PrivacyCheckResult {
  allowed: boolean;
  reason?: string;
  redacted_fields?: string[];
  applied_rules?: PrivacyRule[];
}
