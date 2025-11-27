import { EntityManager } from '@sbf/core-entity-manager';
import { BaseAIProvider } from '@sbf/aei';
import { PropertyEntity, createProperty, PropertyMetadata } from './entities/PropertyEntity';

export class PropertyService {
  constructor(
    private entityManager: EntityManager,
    private aiProvider: BaseAIProvider
  ) {}

  async addProperty(
    title: string,
    address: string,
    propertyType: PropertyMetadata['propertyType'],
    purchasePrice?: number,
    purchaseDate?: string
  ): Promise<PropertyEntity> {
    const uid = `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const property = createProperty({
      uid,
      title,
      address,
      propertyType,
      purchasePrice,
      purchaseDate
    });

    await this.entityManager.create(property);
    return property;
  }

  async getProperties(status?: string): Promise<PropertyEntity[]> {
    const entities = await this.entityManager.getAll();
    const properties = entities.filter(e => e.type === 'property.asset') as PropertyEntity[];
    
    if (status) {
      return properties.filter(p => p.metadata.status === status);
    }
    
    return properties;
  }

  async updatePropertyStatus(uid: string, status: PropertyMetadata['status']): Promise<PropertyEntity> {
    const property = await this.entityManager.get(uid) as PropertyEntity;
    if (!property) throw new Error(`Property ${uid} not found`);
    
    const updated = {
      ...property,
      metadata: {
        ...property.metadata,
        status,
        updated: new Date().toISOString()
      }
    };
    
    await this.entityManager.update(uid, updated);
    return updated;
  }
}
