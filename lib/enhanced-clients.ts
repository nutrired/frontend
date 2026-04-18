'use client';

import useSWR from 'swr';
import { api } from './api';
import type { EnhancedClient, QuickStats } from './types';

export interface EnhancedClientsParams {
  search?: string;
  status?: string;
  sort?: string;
}

export async function getEnhancedClients(params: EnhancedClientsParams): Promise<{ clients: EnhancedClient[] }> {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set('search', params.search);
  if (params.status) queryParams.set('status', params.status);
  if (params.sort) queryParams.set('sort', params.sort);

  const path = `/nutritionist/clients${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return api.get<{ clients: EnhancedClient[] }>(path);
}

export async function getQuickStats(): Promise<QuickStats> {
  return api.get<QuickStats>('/nutritionist/stats');
}

export async function getEnhancedClient(clientId: string): Promise<EnhancedClient> {
  return api.get<EnhancedClient>(`/nutritionist/clients/${clientId}`);
}

export function useEnhancedClients(params: EnhancedClientsParams) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set('search', params.search);
  if (params.status) queryParams.set('status', params.status);
  if (params.sort) queryParams.set('sort', params.sort);

  const key = `/nutritionist/clients${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => getEnhancedClients(params),
    { revalidateOnFocus: false }
  );

  return {
    clients: data?.clients || [],
    isLoading,
    error,
    mutate,
  };
}

export function useQuickStats() {
  const { data, error, isLoading } = useSWR(
    '/nutritionist/stats',
    getQuickStats,
    { revalidateOnFocus: false }
  );

  return {
    stats: data || null,
    isLoading,
    error,
  };
}

export function useEnhancedClient(clientId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/nutritionist/clients/${clientId}`,
    () => getEnhancedClient(clientId),
    { revalidateOnFocus: false }
  );

  return {
    client: data || null,
    isLoading,
    error,
    mutate,
  };
}
