import { EntityManager } from '@sbf/core-entity-manager';
import { 
  MedicationEntity, 
  createMedication, 
  MedicationMetadata
} from '@sbf/frameworks-health-tracking';

export class MedicationService {
  constructor(private entityManager: EntityManager) {}

  async addMedication(
    name: string,
    dosage: string,
    frequency: string,
    startDate: string = new Date().toISOString().split('T')[0],
    instructions?: string,
    endDate?: string
  ): Promise<MedicationEntity> {
    const uid = `med-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const medication = createMedication({
      uid,
      name,
      dosage,
      frequency,
      startDate,
      instructions,
      endDate,
      isActive: true
    });

    await this.entityManager.create(medication);
    return medication;
  }

  async getActiveMedications(): Promise<MedicationEntity[]> {
    const entities = await this.entityManager.getAll();
    const medications = entities.filter(e => e.type === 'health.medication') as MedicationEntity[];
    return medications.filter(m => m.metadata.isActive);
  }

  async logDose(medicationId: string, timestamp: Date): Promise<void> {
      // TODO: Implement logging a dose as a HealthEventEntity
      console.log(`Logged dose for ${medicationId} at ${timestamp}`);
  }
}
