import { describe, test, expect } from '@jest/globals';
import { createMedication, recordDose, calculateAdherence } from '../index.js';

describe('Medication Tracking Module', () => {
  test('should create a medication', () => {
    const med = createMedication({
      uid: 'med-1',
      medication_name: 'Aspirin',
      dosage: '100mg',
      frequency: 'daily',
      route: 'oral',
      start_date: '2025-01-01',
      purpose: 'Heart health'
    });

    expect(med.type).toBe('health.medication');
    expect(med.metadata.medication_name).toBe('Aspirin');
    expect(med.metadata.dosage).toBe('100mg');
    expect(med.metadata.frequency).toBe('daily');
    expect(med.title).toContain('Aspirin');
  });

  test('should record a dose', () => {
    const dose = recordDose({
      uid: 'dose-1',
      medication_uid: 'med-1',
      date: '2025-01-15',
      time: '08:00',
      dosage_taken: '100mg',
      taken_as_prescribed: true
    });

    expect(dose.type).toBe('health.dose');
    expect(dose.metadata.medication_uid).toBe('med-1');
    expect(dose.metadata.taken_as_prescribed).toBe(true);
  });

  test('should calculate adherence', () => {
    const doses = [
      { taken_as_prescribed: true },
      { taken_as_prescribed: true },
      { taken_as_prescribed: false },
      { taken_as_prescribed: true },
    ];

    const adherence = calculateAdherence(doses as any[], 4);
    expect(adherence).toBe(75); // 3 out of 4 taken as prescribed
  });
});
