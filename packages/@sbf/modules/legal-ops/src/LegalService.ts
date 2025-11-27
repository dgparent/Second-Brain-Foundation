import { EntityManager } from '@sbf/core-entity-manager';
import { BaseAIProvider } from '@sbf/aei';
import { CaseEntity, createCase, CaseMetadata } from './entities/CaseEntity';

export class LegalService {
  constructor(
    private entityManager: EntityManager,
    private aiProvider: BaseAIProvider
  ) {}

  async createCase(
    title: string,
    caseNumber: string,
    caseType: CaseMetadata['caseType'],
    client: string,
    description?: string
  ): Promise<CaseEntity> {
    const uid = `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newCase = createCase({
      uid,
      title,
      caseNumber,
      caseType,
      client,
      description
    });

    await this.entityManager.create(newCase);
    return newCase;
  }

  async getCases(status?: string): Promise<CaseEntity[]> {
    const entities = await this.entityManager.getAll();
    const cases = entities.filter(e => e.type === 'legal.case') as CaseEntity[];
    
    if (status) {
      return cases.filter(c => c.metadata.status === status);
    }
    
    return cases;
  }

  async updateCaseStatus(uid: string, status: CaseMetadata['status']): Promise<CaseEntity> {
    const caseEntity = await this.entityManager.get(uid) as CaseEntity;
    if (!caseEntity) throw new Error(`Case ${uid} not found`);
    
    const updated = {
      ...caseEntity,
      metadata: {
        ...caseEntity.metadata,
        status,
        updated: new Date().toISOString()
      }
    };
    
    await this.entityManager.update(uid, updated);
    return updated;
  }
}
