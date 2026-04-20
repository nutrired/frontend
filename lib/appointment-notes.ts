import { apiClient } from './api';
import type { Appointment, AppointmentPhoto } from './types';

export async function updateAppointmentNotes(
  appointmentId: string,
  notes: {
    shared_summary?: string;
    clinical_notes?: string;
    internal_reminders?: string;
  }
): Promise<void> {
  await apiClient.put(`/appointments/${appointmentId}/notes`, notes);
}

export async function uploadAppointmentPhoto(
  appointmentId: string,
  file: File
): Promise<AppointmentPhoto> {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await apiClient.postForm<AppointmentPhoto>(
    `/appointments/${appointmentId}/photos`,
    formData
  );
  return response;
}

export async function deleteAppointmentPhoto(
  appointmentId: string,
  photoId: string
): Promise<void> {
  await apiClient.del(`/appointments/${appointmentId}/photos/${photoId}`);
}

export async function getAppointment(appointmentId: string): Promise<Appointment> {
  return apiClient.get<Appointment>(`/appointments/${appointmentId}`);
}
