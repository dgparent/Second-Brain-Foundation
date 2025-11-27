/**
 * Healthcare Module - Medical appointments, provider tracking, health documents
 * Built on Health Tracking Framework
 */

import { Entity, createHealthPrivacy } from '@sbf/frameworks-health-tracking';

/**
 * Healthcare Provider Entity
 */
export interface ProviderEntity extends Entity {
  type: 'health.provider';
  metadata: {
    provider_name: string;
    specialty: string;
    practice_name?: string;
    phone?: string;
    email?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    npi_number?: string;
    accepting_patients?: boolean;
    notes?: string;
  };
}

/**
 * Medical Appointment Entity
 */
export interface AppointmentEntity extends Entity {
  type: 'health.appointment';
  metadata: {
    provider_uid: string;
    appointment_date: string;
    appointment_time: string;
    visit_type: 'in-person' | 'telehealth' | 'phone';
    specialty: string;
    chief_complaint?: string;
    visit_purpose: string;
    location?: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    
    // Outcomes (if completed)
    diagnosis?: string[];
    recommendations?: string[];
    prescriptions_changed?: boolean;
    follow_up_required?: boolean;
    follow_up_date?: string;
    
    // Linked entities
    document_uids?: string[];
    related_condition_uids?: string[];
    
    notes?: string;
  };
}

/**
 * Health Document Entity (lab results, imaging, summaries)
 */
export interface HealthDocumentEntity extends Entity {
  type: 'health.document';
  metadata: {
    document_type: 'lab_result' | 'imaging' | 'visit_summary' | 'prescription' | 'vaccination' | 'other';
    document_date: string;
    provider_uid?: string;
    appointment_uid?: string;
    
    // Document details
    test_name?: string;
    results_summary?: string;
    file_path?: string;
    file_format?: string;
    
    // Clinical data
    key_findings?: string[];
    abnormal_flags?: boolean;
    action_required?: boolean;
    
    notes?: string;
  };
}

/**
 * Create a healthcare provider
 */
export function createProvider(data: {
  uid: string;
  provider_name: string;
  specialty: string;
  practice_name?: string;
  phone?: string;
  email?: string;
}): ProviderEntity {
  return {
    uid: data.uid,
    type: 'health.provider',
    title: `${data.provider_name} (${data.specialty})`,
    lifecycle: { state: 'permanent' },
    sensitivity: createHealthPrivacy('confidential'),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      provider_name: data.provider_name,
      specialty: data.specialty,
      practice_name: data.practice_name,
      phone: data.phone,
      email: data.email,
    },
  };
}

/**
 * Schedule a medical appointment
 */
export function scheduleAppointment(data: {
  uid: string;
  provider_uid: string;
  provider_name: string;
  specialty: string;
  appointment_date: string;
  appointment_time: string;
  visit_type: 'in-person' | 'telehealth' | 'phone';
  visit_purpose: string;
  chief_complaint?: string;
}): AppointmentEntity {
  return {
    uid: data.uid,
    type: 'health.appointment',
    title: `${data.provider_name} - ${data.appointment_date}`,
    lifecycle: { state: 'scheduled' },
    sensitivity: createHealthPrivacy('confidential'),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      provider_uid: data.provider_uid,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      visit_type: data.visit_type,
      specialty: data.specialty,
      visit_purpose: data.visit_purpose,
      chief_complaint: data.chief_complaint,
      status: 'scheduled',
    },
  };
}

/**
 * Create a health document
 */
export function createHealthDocument(data: {
  uid: string;
  document_type: HealthDocumentEntity['metadata']['document_type'];
  document_date: string;
  test_name?: string;
  results_summary?: string;
  provider_uid?: string;
  appointment_uid?: string;
}): HealthDocumentEntity {
  const title = data.test_name 
    ? `${data.test_name} - ${data.document_date}`
    : `${data.document_type} - ${data.document_date}`;

  return {
    uid: data.uid,
    type: 'health.document',
    title,
    lifecycle: { state: 'permanent' },
    sensitivity: createHealthPrivacy('confidential'),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      document_type: data.document_type,
      document_date: data.document_date,
      test_name: data.test_name,
      results_summary: data.results_summary,
      provider_uid: data.provider_uid,
      appointment_uid: data.appointment_uid,
    },
  };
}

/**
 * Complete an appointment with outcomes
 */
export function completeAppointment(
  appointment: AppointmentEntity,
  outcomes: {
    diagnosis?: string[];
    recommendations?: string[];
    prescriptions_changed?: boolean;
    follow_up_required?: boolean;
    follow_up_date?: string;
    notes?: string;
  }
): AppointmentEntity {
  return {
    ...appointment,
    lifecycle: { state: 'completed' },
    updated: new Date().toISOString(),
    metadata: {
      ...appointment.metadata,
      status: 'completed',
      diagnosis: outcomes.diagnosis,
      recommendations: outcomes.recommendations,
      prescriptions_changed: outcomes.prescriptions_changed,
      follow_up_required: outcomes.follow_up_required,
      follow_up_date: outcomes.follow_up_date,
      notes: outcomes.notes,
    },
  };
}

/**
 * Link documents to an appointment
 */
export function linkDocumentsToAppointment(
  appointment: AppointmentEntity,
  documentUids: string[]
): AppointmentEntity {
  return {
    ...appointment,
    updated: new Date().toISOString(),
    metadata: {
      ...appointment.metadata,
      document_uids: [
        ...(appointment.metadata.document_uids || []),
        ...documentUids,
      ],
    },
  };
}

/**
 * Get upcoming appointments
 */
export function getUpcomingAppointments(
  appointments: AppointmentEntity[],
  daysAhead: number = 30
): AppointmentEntity[] {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);

  return appointments
    .filter(apt => {
      if (apt.metadata.status !== 'scheduled') return false;
      const aptDate = new Date(apt.metadata.appointment_date);
      return aptDate >= today && aptDate <= futureDate;
    })
    .sort((a, b) => {
      return new Date(a.metadata.appointment_date).getTime() - 
             new Date(b.metadata.appointment_date).getTime();
    });
}

/**
 * Get appointments by provider
 */
export function getAppointmentsByProvider(
  appointments: AppointmentEntity[],
  providerUid: string
): AppointmentEntity[] {
  return appointments.filter(apt => apt.metadata.provider_uid === providerUid);
}

/**
 * Get documents by appointment
 */
export function getDocumentsByAppointment(
  documents: HealthDocumentEntity[],
  appointmentUid: string
): HealthDocumentEntity[] {
  return documents.filter(doc => doc.metadata.appointment_uid === appointmentUid);
}

/**
 * Calculate appointment statistics
 */
export function calculateAppointmentStats(appointments: AppointmentEntity[]): {
  total: number;
  completed: number;
  scheduled: number;
  cancelled: number;
  by_specialty: Record<string, number>;
} {
  const stats = {
    total: appointments.length,
    completed: 0,
    scheduled: 0,
    cancelled: 0,
    by_specialty: {} as Record<string, number>,
  };

  appointments.forEach(apt => {
    // Count by status
    if (apt.metadata.status === 'completed') stats.completed++;
    if (apt.metadata.status === 'scheduled') stats.scheduled++;
    if (apt.metadata.status === 'cancelled') stats.cancelled++;

    // Count by specialty
    const specialty = apt.metadata.specialty;
    stats.by_specialty[specialty] = (stats.by_specialty[specialty] || 0) + 1;
  });

  return stats;
}
