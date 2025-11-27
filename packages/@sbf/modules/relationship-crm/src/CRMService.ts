import { EntityManager } from '@sbf/core-entity-manager';
import { BaseAIProvider } from '@sbf/aei';
import { 
  SimpleEntity,
  createContactEntity,
  createInteractionEntity,
  ContactMetadata,
  InteractionMetadata
} from '@sbf/frameworks-relationship-tracking';

export class CRMService {
  constructor(
    private entityManager: EntityManager,
    private aiProvider: BaseAIProvider
  ) {}

  /**
   * Create a new contact
   */
  async createContact(
    fullName: string,
    category: ContactMetadata['category'],
    email?: string,
    phone?: string,
    company?: string,
    jobTitle?: string,
    notes?: string
  ): Promise<SimpleEntity> {
    const uid = `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const contact = createContactEntity({
      uid,
      full_name: fullName,
      category,
      email,
      phone,
      company,
      job_title: jobTitle,
      notes
    });

    await this.entityManager.create(contact as any);
    return contact;
  }

  /**
   * Log an interaction
   */
  async logInteraction(
    title: string,
    type: InteractionMetadata['interaction_type'],
    date: string,
    contactUids: string[],
    summary?: string,
    notes?: string
  ): Promise<SimpleEntity> {
    const uid = `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const interaction = createInteractionEntity({
      uid,
      title,
      interaction_type: type,
      date,
      contact_uids: contactUids,
      summary,
      notes
    });

    await this.entityManager.create(interaction as any);
    
    // Update last contact date for all contacts
    for (const contactUid of contactUids) {
      await this.updateLastContactDate(contactUid, date);
    }

    return interaction;
  }

  /**
   * Update last contact date
   */
  private async updateLastContactDate(contactUid: string, date: string): Promise<void> {
    const contact = await this.entityManager.get(contactUid);
    if (contact && contact.type === 'relationship.contact') {
      const currentLastContact = contact.metadata.last_contact_date;
      
      // Only update if new date is more recent
      if (!currentLastContact || new Date(date) > new Date(currentLastContact)) {
        await this.entityManager.update(contactUid, {
          metadata: {
            ...contact.metadata,
            last_contact_date: date
          }
        });
      }
    }
  }

  /**
   * Get all contacts
   */
  async getContacts(): Promise<SimpleEntity[]> {
    const entities = await this.entityManager.getAll();
    return entities.filter(e => e.type === 'relationship.contact') as unknown as SimpleEntity[];
  }

  /**
   * Get interactions for a contact
   */
  async getInteractions(contactUid?: string): Promise<SimpleEntity[]> {
    const entities = await this.entityManager.getAll();
    const interactions = entities.filter(e => e.type === 'relationship.interaction') as unknown as SimpleEntity[];
    
    if (contactUid) {
      return interactions.filter(i => {
        const uids = i.metadata.contact_uids as string[] || [];
        return uids.includes(contactUid);
      });
    }
    
    return interactions;
  }
}
