// frontend/lib/calendar.ts
'use client';

import useSWR, { mutate } from 'swr';
import { api } from './api';
import type { AppointmentType, AvailabilityRule, Appointment } from './types';

// ─── Appointment Types ────────────────────────────────────────────────────────

export function useAppointmentTypes(nutritionistID?: string) {
  const url = nutritionistID
    ? `/calendar/appointment-types?nutritionist_id=${nutritionistID}`
    : '/calendar/appointment-types';

  const { data, error, isLoading, mutate: revalidate } = useSWR<{ types: AppointmentType[] }>(
    url,
    () => api.get<{ types: AppointmentType[] }>(url),
  );
  return {
    types: data?.types ?? [],
    isLoading,
    error,
    mutate: revalidate,
  };
}

export interface CreateAppointmentTypeParams {
  name: string;
  duration_minutes: number;
  description: string;
  video_link: string;
}

export async function createAppointmentType(params: CreateAppointmentTypeParams): Promise<AppointmentType> {
  const result = await api.post<AppointmentType>('/calendar/appointment-types', params);
  mutate('/calendar/appointment-types');
  return result;
}

export interface UpdateAppointmentTypeParams {
  name?: string;
  duration_minutes?: number;
  description?: string;
  video_link?: string;
}

export async function updateAppointmentType(id: string, params: UpdateAppointmentTypeParams): Promise<AppointmentType> {
  const result = await api.put<AppointmentType>(`/calendar/appointment-types/${id}`, params);
  mutate('/calendar/appointment-types');
  return result;
}

export async function deleteAppointmentType(id: string): Promise<void> {
  await api.del(`/calendar/appointment-types/${id}`);
  mutate('/calendar/appointment-types');
}

// ─── Availability Rules ───────────────────────────────────────────────────────

export function useAvailabilityRules() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<{ rules: AvailabilityRule[] }>(
    '/calendar/availability',
    () => api.get<{ rules: AvailabilityRule[] }>('/calendar/availability'),
  );
  return {
    rules: data?.rules ?? [],
    isLoading,
    error,
    mutate: revalidate,
  };
}

export interface CreateAvailabilityRuleParams {
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // Time only, e.g., "09:00:00"
  end_time: string;
}

export async function createAvailabilityRule(params: CreateAvailabilityRuleParams): Promise<AvailabilityRule> {
  const result = await api.post<AvailabilityRule>('/calendar/availability', params);
  mutate('/calendar/availability');
  return result;
}

export async function deleteAvailabilityRule(id: string): Promise<void> {
  await api.del(`/calendar/availability/${id}`);
  mutate('/calendar/availability');
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export function useCalendar(from: string, to: string) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<{ appointments: Appointment[] }>(
    `/calendar?from=${from}&to=${to}`,
    () => api.get<{ appointments: Appointment[] }>(`/calendar?from=${from}&to=${to}`)
  );
  return { appointments: data?.appointments ?? [], isLoading, error, mutate: revalidate };
}

export function useAvailableSlots(nutritionistID: string, date: string, duration: number) {
  const { data, error, isLoading } = useSWR<{ slots: string[] }>(
    nutritionistID && date && duration
      ? `/calendar/available-slots?nutritionist_id=${nutritionistID}&date=${date}&duration=${duration}`
      : null,
    () => api.get<{ slots: string[] }>(
      `/calendar/available-slots?nutritionist_id=${nutritionistID}&date=${date}&duration=${duration}`
    )
  );
  return { slots: data?.slots ?? [], isLoading, error };
}

export async function createAppointment(params: {
  relationship_id: string;
  appointment_type_id: string;
  start_time: string;
  notes?: string;
}): Promise<void> {
  await api.post('/calendar/appointments', params);
  mutate((key) => typeof key === 'string' && key.startsWith('/calendar'));
}

export async function cancelAppointment(id: string, reason: string): Promise<void> {
  await api.post(`/calendar/appointments/${id}/cancel`, { reason });
  mutate((key) => typeof key === 'string' && key.startsWith('/calendar'));
}

export async function completeAppointment(id: string, notes?: string): Promise<void> {
  await api.post(`/calendar/appointments/${id}/complete`, { notes });
  mutate((key) => typeof key === 'string' && key.startsWith('/calendar'));
}

export async function markNoShow(id: string): Promise<void> {
  await api.post(`/calendar/appointments/${id}/no-show`, {});
  mutate((key) => typeof key === 'string' && key.startsWith('/calendar'));
}
