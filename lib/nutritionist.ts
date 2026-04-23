// frontend/lib/nutritionist.ts
'use client';

import useSWR from 'swr';
import { api } from './api';
import type { NutritionistOverview } from './types';

export function useNutritionistOverview() {
  const { data, error, isLoading } = useSWR<NutritionistOverview>(
    '/nutritionist/overview',
    () => api.get<NutritionistOverview>('/nutritionist/overview'),
    {
      revalidateOnFocus: false,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  return {
    overview: data ?? null,
    isLoading,
    error,
  };
}
