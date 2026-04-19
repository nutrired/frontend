'use client';

import useSWR from 'swr';
import { api } from './api';
import type { WeightEntry, ActivityEntry } from './types';

export function useClientWeight(clientId: string | null, days?: number) {
  const daysParam = days !== undefined ? `?days=${days}` : '?days=30';
  const key = clientId ? `/clients/${clientId}/weight${daysParam}` : null;

  const { data, error, isLoading, mutate } = useSWR<WeightEntry[]>(
    key,
    () => api.get<WeightEntry[]>(key!),
  );

  return {
    entries: data ?? [],
    error,
    isLoading,
    mutate,
  };
}

export function useClientActivity(clientId: string | null, days?: number) {
  const daysParam = days !== undefined ? `?days=${days}` : '?days=30';
  const key = clientId ? `/clients/${clientId}/activity${daysParam}` : null;

  const { data, error, isLoading, mutate } = useSWR<ActivityEntry[]>(
    key,
    () => api.get<ActivityEntry[]>(key!),
  );

  return {
    entries: data ?? [],
    error,
    isLoading,
    mutate,
  };
}
