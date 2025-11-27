import { LegalEntity, createLegalPrivacy } from './LegalEntity';

export interface CaseMetadata {
  caseNumber: string;
  caseType: 'litigation' | 'transaction' | 'advisory' | 'compliance';
  status: 'open' | 'closed' | 'pending' | 'archived';
  client: string;
  opposingParty?: string;
  jurisdiction?: string;
  filingDate?: string;
  description?: string;
  assignedAttorney?: string;
}

export interface CaseEntity extends LegalEntity {
  type: 'legal.case';
  metadata: CaseMetadata;
}

export function createCase(data: {
  uid: string;
  title: string;
  caseNumber: string;
  caseType: CaseMetadata['caseType'];
  client: string;
  description?: string;
}): CaseEntity {
  return {
    uid: data.uid,
    type: 'legal.case',
    title: data.title,
    lifecycle: { state: 'permanent' },
    sensitivity: createLegalPrivacy(),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      caseNumber: data.caseNumber,
      caseType: data.caseType,
      status: 'open',
      client: data.client,
      description: data.description,
    },
  };
}
