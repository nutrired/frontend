'use client';

import useSWR from 'swr';
import { api, ApiRequestError } from './api';
import type { ClientProfile, WeightEntry, ActivityEntry } from './types';

// Hook for a client to read their own profile.
// Returns null (not an error) if the profile has not been created yet.
export function useMyClientProfile() {
  const { data, error, isLoading, mutate } = useSWR<ClientProfile | null>(
    '/client/me',
    () =>
      api.get<ClientProfile>('/client/me').catch((err) => {
        if (err instanceof ApiRequestError && err.status === 404) return null;
        throw err;
      }),
    { revalidateOnFocus: false },
  );
  return { profile: data ?? null, isLoading, error, mutate };
}

export function useWeightEntries() {
  const { data, error, isLoading, mutate } = useSWR<WeightEntry[]>(
    '/client/me/weight',
    () => api.get<WeightEntry[]>('/client/me/weight'),
  );
  return { entries: data ?? [], isLoading, error, mutate };
}

export function useActivityEntries() {
  const { data, error, isLoading, mutate } = useSWR<ActivityEntry[]>(
    '/client/me/activity',
    () => api.get<ActivityEntry[]>('/client/me/activity'),
  );
  return { entries: data ?? [], isLoading, error, mutate };
}
