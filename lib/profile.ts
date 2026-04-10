'use client';

import useSWR from 'swr';
import { api, ApiRequestError } from './api';
import type { NutritionistProfile, ProfileListResponse } from './types';

// Hook for a nutritionist to read their own profile.
export function useMyProfile() {
  const { data, error, isLoading, mutate } = useSWR<NutritionistProfile | null>(
    '/profile/me',
    () => api.get<NutritionistProfile>('/profile/me').catch((err) => {
      if (err instanceof ApiRequestError && err.status === 404) return null;
      throw err;
    }),
    { revalidateOnFocus: false },
  );
  return { profile: data ?? null, isLoading, error, mutate };
}

export interface ProfileSearchParams {
  q?: string;
  city?: string;
  specialty?: string;
  language?: string;
  sort?: string;
  minPrice?: number; // euros — converted to min_price query param
  maxPrice?: number; // euros
}

// Hook for the public listing page.
export function usePublicProfiles(page = 1, limit = 12, filters: ProfileSearchParams = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (filters.q) params.set('q', filters.q);
  if (filters.city) params.set('city', filters.city);
  if (filters.specialty) params.set('specialty', filters.specialty);
  if (filters.language) params.set('language', filters.language);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.minPrice !== undefined) params.set('min_price', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('max_price', String(filters.maxPrice));

  const key = `/nutritionists?${params.toString()}`;

  const { data, error, isLoading } = useSWR<ProfileListResponse>(
    key,
    () => api.get<ProfileListResponse>(key),
    { revalidateOnFocus: false },
  );
  return {
    profiles: data?.profiles ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
  };
}

// Hook for a public profile page by slug.
export function usePublicProfile(slug: string) {
  const { data, error, isLoading } = useSWR<NutritionistProfile | null>(
    `/nutritionists/${slug}`,
    () => api.get<NutritionistProfile>(`/nutritionists/${slug}`).catch((err) => {
      if (err instanceof ApiRequestError && err.status === 404) return null;
      throw err;
    }),
    { revalidateOnFocus: false },
  );
  return { profile: data ?? null, isLoading, error };
}
