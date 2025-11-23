/**
 * Privacy Enforcement Layer - Types and Interfaces
 * Defines privacy levels, policies, and audit structures
 */

export enum PrivacyLevel {
  Public = 0,
  Personal = 1,
  Private = 2,
  Confidential = 3,
}

export enum AIProvider {
  None = 'none',
  LocalLLM = 'local',
  OpenAI = 'openai',
  Anthropic = 'anthropic',
  Google = 'google',
  Custom = 'custom',
}

export interface PrivacyMetadata {
  level: PrivacyLevel;
  inheritFromParent?: boolean;
  customRules?: string[];
  updatedAt?: Date;
  updatedBy?: string;
}

export interface AIProviderPolicy {
  provider: AIProvider;
  allowedPrivacyLevels: PrivacyLevel[];
  dataRetention: boolean;
  thirdPartySharing: boolean;
  encryptionRequired: boolean;
}

export interface PrivacyRule {
  id: string;
  name: string;
  description: string;
  condition: (entity: any, context: any) => boolean;
  action: 'allow' | 'deny' | 'filter';
  filterFn?: (content: string) => string;
}

export interface PrivacyAuditEntry {
  id: string;
  timestamp: Date;
  entityId: string;
  entityType: string;
  action: 'access' | 'filter' | 'deny';
  aiProvider: AIProvider;
  privacyLevel: PrivacyLevel;
  confidenceScore?: number;
  wasFiltered: boolean;
  violations: string[];
  userId: string;
}

export interface PrivacyFilterResult {
  filtered: boolean;
  originalContent: string;
  filteredContent: string;
  removedSections: string[];
  privacyLevel: PrivacyLevel;
}

export interface PrivacyViolation {
  id: string;
  timestamp: Date;
  entityId: string;
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  aiProvider?: AIProvider;
}

export const DEFAULT_AI_POLICIES: Record<AIProvider, AIProviderPolicy> = {
  [AIProvider.None]: {
    provider: AIProvider.None,
    allowedPrivacyLevels: [],
    dataRetention: false,
    thirdPartySharing: false,
    encryptionRequired: false,
  },
  [AIProvider.LocalLLM]: {
    provider: AIProvider.LocalLLM,
    allowedPrivacyLevels: [PrivacyLevel.Public, PrivacyLevel.Personal, PrivacyLevel.Private],
    dataRetention: false,
    thirdPartySharing: false,
    encryptionRequired: true,
  },
  [AIProvider.OpenAI]: {
    provider: AIProvider.OpenAI,
    allowedPrivacyLevels: [PrivacyLevel.Public, PrivacyLevel.Personal],
    dataRetention: true,
    thirdPartySharing: false,
    encryptionRequired: true,
  },
  [AIProvider.Anthropic]: {
    provider: AIProvider.Anthropic,
    allowedPrivacyLevels: [PrivacyLevel.Public, PrivacyLevel.Personal],
    dataRetention: true,
    thirdPartySharing: false,
    encryptionRequired: true,
  },
  [AIProvider.Google]: {
    provider: AIProvider.Google,
    allowedPrivacyLevels: [PrivacyLevel.Public, PrivacyLevel.Personal],
    dataRetention: true,
    thirdPartySharing: true,
    encryptionRequired: true,
  },
  [AIProvider.Custom]: {
    provider: AIProvider.Custom,
    allowedPrivacyLevels: [PrivacyLevel.Public, PrivacyLevel.Personal],
    dataRetention: false,
    thirdPartySharing: false,
    encryptionRequired: true,
  },
};
