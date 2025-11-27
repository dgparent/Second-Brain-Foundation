import { EntityManager } from '@sbf/core-entity-manager';
import { BaseAIProvider } from '@sbf/aei';
import { 
  LearningResourceEntity, 
  createLearningResource, 
  updateResourceProgress,
  ResourceType,
  ResourceStatus
} from '@sbf/frameworks-knowledge-tracking';

export class LearningService {
  constructor(
    private entityManager: EntityManager,
    private aiProvider: BaseAIProvider
  ) {}

  async addResource(
    title: string,
    type: ResourceType,
    url?: string,
    topics: string[] = []
  ): Promise<LearningResourceEntity> {
    const resource = createLearningResource(title, type, {
      url,
      topics
    });
    
    await this.entityManager.create(resource);
    return resource;
  }

  async getResources(status?: ResourceStatus): Promise<LearningResourceEntity[]> {
    const entities = await this.entityManager.getAll();
    const resources = entities.filter(e => e.type === 'knowledge.resource') as LearningResourceEntity[];
    
    if (status) {
      return resources.filter(r => r.metadata.status === status);
    }
    
    return resources;
  }

  async updateProgress(uid: string, percent: number, status?: ResourceStatus): Promise<LearningResourceEntity> {
    const resource = await this.entityManager.get(uid) as LearningResourceEntity;
    if (!resource) throw new Error(`Resource ${uid} not found`);
    
    const updated = updateResourceProgress(resource, percent, status);
    await this.entityManager.update(uid, updated);
    
    return updated;
  }
}
