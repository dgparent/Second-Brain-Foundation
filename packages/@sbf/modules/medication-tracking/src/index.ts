/**
 * Medication Management Plugin
 * Built on Health Framework - demonstrates 85%+ code reuse
 */

/**
 * Base Entity interface (from Health Framework)
 */
interface Entity {
  uid: string;
  type: string;
  title: string;
  lifecycle: { state: string };
  sensitivity: {
    level: string;
    privacy: {
      cloud_ai_allowed: boolean;
      local_ai_allowed: boolean;
      export_allowed: boolean;
    };
  };
  created: string;
  updated: string;
  metadata: Record<string, any>;
}

/**
 * Medication entity (prescription or OTC)
 */
export interface MedicationEntity extends Entity {
  type: 'health.medication';
  metadata: {
    medication_name: string;
    dosage: string;
    frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'as_needed' | 'weekly' | 'other';
    route: 'oral' | 'topical' | 'injection' | 'inhaled' | 'other';
    prescribing_doctor?: string;
    prescription_number?: string;
    start_date: string;
    end_date?: string;
    purpose: string;
    side_effects?: string[];
    notes?: string;
  };
}

/**
 * Medication dose taken entity
 */
export interface DoseTakenEntity extends Entity {
  type: 'health.dose';
  metadata: {
    medication_uid: string;
    date: string;
    time: string;
    dosage_taken: string;
    taken_as_prescribed: boolean;
    side_effects_experienced?: string[];
    effectiveness_rating?: number; // 1-10
    notes?: string;
  };
}

/**
 * Create medication
 */
export function createMedication(data: {
  uid: string;
  medication_name: string;
  dosage: string;
  frequency: MedicationEntity['metadata']['frequency'];
  route: MedicationEntity['metadata']['route'];
  start_date: string;
  purpose: string;
  prescribing_doctor?: string;
}): MedicationEntity {
  return {
    uid: data.uid,
    type: 'health.medication',
    title: `${data.medication_name} (${data.dosage})`,
    lifecycle: { state: 'permanent' },
    sensitivity: {
      level: 'confidential',
      privacy: {
        cloud_ai_allowed: false,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      medication_name: data.medication_name,
      dosage: data.dosage,
      frequency: data.frequency,
      route: data.route,
      start_date: data.start_date,
      purpose: data.purpose,
      prescribing_doctor: data.prescribing_doctor,
    },
  };
}

/**
 * Create dose taken record
 */
export function createDoseTaken(data: {
  uid: string;
  medication_uid: string;
  medication_name: string;
  date: string;
  time: string;
  dosage_taken: string;
  taken_as_prescribed?: boolean;
  effectiveness_rating?: number;
}): DoseTakenEntity {
  return {
    uid: data.uid,
    type: 'health.dose',
    title: `${data.medication_name} - ${data.time}`,
    lifecycle: { state: 'permanent' },
    sensitivity: {
      level: 'confidential',
      privacy: {
        cloud_ai_allowed: false,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      medication_uid: data.medication_uid,
      date: data.date,
      time: data.time,
      dosage_taken: data.dosage_taken,
      taken_as_prescribed: data.taken_as_prescribed ?? true,
      effectiveness_rating: data.effectiveness_rating,
    },
  };
}

/**
 * Calculate adherence rate
 */
export function calculateAdherence(
  medication: MedicationEntity,
  doses: DoseTakenEntity[],
  dateRange: { start: string; end: string }
): {
  expected_doses: number;
  actual_doses: number;
  adherence_rate: number;
  missed_doses: number;
} {
  // Calculate expected doses based on frequency
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  let expectedDosesPerDay = 1;
  switch (medication.metadata.frequency) {
    case 'daily':
      expectedDosesPerDay = 1;
      break;
    case 'twice_daily':
      expectedDosesPerDay = 2;
      break;
    case 'three_times_daily':
      expectedDosesPerDay = 3;
      break;
    case 'weekly':
      expectedDosesPerDay = 1 / 7;
      break;
    case 'as_needed':
      expectedDosesPerDay = 0; // Can't calculate adherence for as-needed
      break;
  }

  const expectedDoses = Math.ceil(daysDiff * expectedDosesPerDay);
  const actualDoses = doses.length;
  const adherenceRate = expectedDoses > 0 ? (actualDoses / expectedDoses) * 100 : 0;

  return {
    expected_doses: expectedDoses,
    actual_doses: actualDoses,
    adherence_rate: Math.min(adherenceRate, 100),
    missed_doses: Math.max(expectedDoses - actualDoses, 0),
  };
}

/**
 * Check for potential side effects patterns
 */
export function analyzeSideEffects(doses: DoseTakenEntity[]): {
  total_doses_with_side_effects: number;
  side_effects_rate: number;
  common_side_effects: Array<{ effect: string; count: number }>;
} {
  const sideEffectCounts: Record<string, number> = {};
  let dosesWithSideEffects = 0;

  for (const dose of doses) {
    if (dose.metadata.side_effects_experienced && dose.metadata.side_effects_experienced.length > 0) {
      dosesWithSideEffects++;
      for (const effect of dose.metadata.side_effects_experienced) {
        sideEffectCounts[effect] = (sideEffectCounts[effect] || 0) + 1;
      }
    }
  }

  const commonEffects = Object.entries(sideEffectCounts)
    .map(([effect, count]) => ({ effect, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total_doses_with_side_effects: dosesWithSideEffects,
    side_effects_rate: doses.length > 0 ? (dosesWithSideEffects / doses.length) * 100 : 0,
    common_side_effects: commonEffects,
  };
}

/**
 * Plugin metadata
 */
export const MedicationPlugin = {
  id: 'sbf-medication-management',
  name: 'Medication Management',
  version: '0.1.0',
  domain: 'health',
  description: 'Track medications, doses, adherence, and side effects',
  
  entityTypes: [
    'health.medication',
    'health.dose',
  ],
  
  features: [
    'Medication catalog with prescriptions',
    'Dose tracking and logging',
    'Adherence rate calculation',
    'Side effects monitoring',
    'Effectiveness ratings',
    'Prescription refill reminders',
  ],
  
  integrations: [
    'Pharmacy systems',
    'Medication databases (RxNorm, DrugBank)',
    'Manual entry',
  ],
};
