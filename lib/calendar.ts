// frontend/lib/calendar.ts
'use client';

import useSWR, { mutate } from 'swr';
import { api } from './api';
import type { AppointmentType, AvailabilityRule } from './types';

// ─── Appointment Types ────────────────────────────────────────────────────────

export function useAppointmentTypes() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<{ types: AppointmentType[] }>(
    '/calendar/appointment-types',
    () => api.get<{ types: AppointmentType[] }>('/calendar/appointment-types'),
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
