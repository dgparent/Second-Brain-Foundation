import { Entity, createHealthPrivacy } from './HealthEventEntity';

export interface MedicationMetadata {
  name: string;
  dosage: string;
  frequency: string; // e.g., "daily", "weekly", "as_needed"
  instructions?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface MedicationEntity extends Entity {
  type: 'health.medication';
  metadata: MedicationMetadata;
}

export function createMedication(data: {
  uid: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
  isActive?: boolean;
}): MedicationEntity {
  return {
    uid: data.uid,
    type: 'health.medication',
    title: data.name,
    lifecycle: { state: 'permanent' as const },
    sensitivity: createHealthPrivacy('personal'),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      instructions: data.instructions,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive ?? true,
    },
  };
}
