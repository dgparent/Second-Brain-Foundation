import { describe, test, expect } from '@jest/globals';
import {
  createProvider,
  scheduleAppointment,
  createHealthDocument,
  completeAppointment,
  linkDocumentsToAppointment,
  getUpcomingAppointments,
  getAppointmentsByProvider,
  getDocumentsByAppointment,
  calculateAppointmentStats,
} from '../index.js';

describe('Healthcare Module', () => {
  describe('Provider Management', () => {
    test('should create a healthcare provider', () => {
      const provider = createProvider({
        uid: 'prov-1',
        provider_name: 'Dr. Jane Smith',
        specialty: 'Cardiology',
        practice_name: 'Heart Health Center',
        phone: '555-1234',
      });

      expect(provider.type).toBe('health.provider');
      expect(provider.metadata.provider_name).toBe('Dr. Jane Smith');
      expect(provider.metadata.specialty).toBe('Cardiology');
      expect(provider.title).toContain('Dr. Jane Smith');
      expect(provider.title).toContain('Cardiology');
    });
  });

  describe('Appointment Management', () => {
    test('should schedule an appointment', () => {
      const appointment = scheduleAppointment({
        uid: 'apt-1',
        provider_uid: 'prov-1',
        provider_name: 'Dr. Jane Smith',
        specialty: 'Cardiology',
        appointment_date: '2025-02-15',
        appointment_time: '10:00',
        visit_type: 'in-person',
        visit_purpose: 'Annual checkup',
        chief_complaint: 'Routine physical',
      });

      expect(appointment.type).toBe('health.appointment');
      expect(appointment.metadata.provider_uid).toBe('prov-1');
      expect(appointment.metadata.status).toBe('scheduled');
      expect(appointment.metadata.visit_type).toBe('in-person');
      expect(appointment.lifecycle.state).toBe('scheduled');
    });

    test('should complete appointment with outcomes', () => {
      const appointment = scheduleAppointment({
        uid: 'apt-1',
        provider_uid: 'prov-1',
        provider_name: 'Dr. Smith',
        specialty: 'Cardiology',
        appointment_date: '2025-02-15',
        appointment_time: '10:00',
        visit_type: 'in-person',
        visit_purpose: 'Follow-up',
      });

      const completed = completeAppointment(appointment, {
        diagnosis: ['Hypertension'],
        recommendations: ['Diet modification', 'Exercise'],
        prescriptions_changed: true,
        follow_up_required: true,
        follow_up_date: '2025-05-15',
        notes: 'Patient doing well',
      });

      expect(completed.metadata.status).toBe('completed');
      expect(completed.lifecycle.state).toBe('completed');
      expect(completed.metadata.diagnosis).toContain('Hypertension');
      expect(completed.metadata.recommendations).toHaveLength(2);
      expect(completed.metadata.follow_up_required).toBe(true);
    });

    test('should link documents to appointment', () => {
      const appointment = scheduleAppointment({
        uid: 'apt-1',
        provider_uid: 'prov-1',
        provider_name: 'Dr. Smith',
        specialty: 'Cardiology',
        appointment_date: '2025-02-15',
        appointment_time: '10:00',
        visit_type: 'in-person',
        visit_purpose: 'Checkup',
      });

      const linked = linkDocumentsToAppointment(appointment, ['doc-1', 'doc-2']);

      expect(linked.metadata.document_uids).toContain('doc-1');
      expect(linked.metadata.document_uids).toContain('doc-2');
      expect(linked.metadata.document_uids).toHaveLength(2);
    });
  });

  describe('Health Document Management', () => {
    test('should create a health document', () => {
      const document = createHealthDocument({
        uid: 'doc-1',
        document_type: 'lab_result',
        document_date: '2025-02-20',
        test_name: 'Lipid Panel',
        results_summary: 'All values within normal range',
        provider_uid: 'prov-1',
        appointment_uid: 'apt-1',
      });

      expect(document.type).toBe('health.document');
      expect(document.metadata.document_type).toBe('lab_result');
      expect(document.metadata.test_name).toBe('Lipid Panel');
      expect(document.title).toContain('Lipid Panel');
      expect(document.sensitivity.level).toBe('highly_confidential');
    });

    test('should create document without test name', () => {
      const document = createHealthDocument({
        uid: 'doc-2',
        document_type: 'visit_summary',
        document_date: '2025-02-15',
      });

      expect(document.metadata.document_type).toBe('visit_summary');
      expect(document.title).toContain('visit_summary');
      expect(document.title).toContain('2025-02-15');
    });
  });

  describe('Query Functions', () => {
    const appointments = [
      scheduleAppointment({
        uid: 'apt-1',
        provider_uid: 'prov-1',
        provider_name: 'Dr. Smith',
        specialty: 'Cardiology',
        appointment_date: '2025-12-01',
        appointment_time: '10:00',
        visit_type: 'in-person',
        visit_purpose: 'Checkup',
      }),
      scheduleAppointment({
        uid: 'apt-2',
        provider_uid: 'prov-2',
        provider_name: 'Dr. Jones',
        specialty: 'Dermatology',
        appointment_date: '2025-12-15',
        appointment_time: '14:00',
        visit_type: 'telehealth',
        visit_purpose: 'Follow-up',
      }),
      scheduleAppointment({
        uid: 'apt-3',
        provider_uid: 'prov-1',
        provider_name: 'Dr. Smith',
        specialty: 'Cardiology',
        appointment_date: '2026-01-10',
        appointment_time: '09:00',
        visit_type: 'in-person',
        visit_purpose: 'Annual',
      }),
    ];

    test('should get appointments by provider', () => {
      const smithAppointments = getAppointmentsByProvider(appointments, 'prov-1');
      expect(smithAppointments).toHaveLength(2);
      expect(smithAppointments.every(apt => apt.metadata.provider_uid === 'prov-1')).toBe(true);
    });

    test('should get documents by appointment', () => {
      const documents = [
        createHealthDocument({
          uid: 'doc-1',
          document_type: 'lab_result',
          document_date: '2025-02-20',
          appointment_uid: 'apt-1',
        }),
        createHealthDocument({
          uid: 'doc-2',
          document_type: 'imaging',
          document_date: '2025-02-21',
          appointment_uid: 'apt-1',
        }),
        createHealthDocument({
          uid: 'doc-3',
          document_type: 'prescription',
          document_date: '2025-02-22',
          appointment_uid: 'apt-2',
        }),
      ];

      const apt1Docs = getDocumentsByAppointment(documents, 'apt-1');
      expect(apt1Docs).toHaveLength(2);
    });

    test('should calculate appointment statistics', () => {
      const completedApt = completeAppointment(appointments[0], {
        diagnosis: ['Test'],
      });

      const stats = calculateAppointmentStats([completedApt, appointments[1], appointments[2]]);

      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.scheduled).toBe(2);
      expect(stats.by_specialty['Cardiology']).toBe(2);
      expect(stats.by_specialty['Dermatology']).toBe(1);
    });
  });
});
