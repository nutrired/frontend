'use client';

import useSWR, { mutate } from 'swr';
import { api } from './api';
import type { Relationship, EarningsSummary } from './types';

// ─── Client hooks ─────────────────────────────────────────────────────────────

export function useMyRelationships() {
  const { data, error, isLoading, mutate } = useSWR<{ relationships: Relationship[] }>(
    '/hiring/relationships',
    () => api.get<{ relationships: Relationship[] }>('/hiring/relationships'),
  );
  return {
    relationships: data?.relationships ?? [],
    isLoading,
    error,
    mutate,
  };
}

// initiateCheckout uses the nutritionist's slug (not user ID).
// Backend endpoint: POST /api/v1/nutritionists/{slug}/hire
export async function initiateCheckout(slug: string, packageID: string): Promise<string> {
  const res = await api.post<{ checkout_url: string; relationship_id: string }>(
    `/nutritionists/${slug}/hire`,
    { package_id: packageID },
  );
  return res.checkout_url;
}

export async function cancelRelationship(relationshipID: string): Promise<void> {
  await api.del(`/hiring/relationships/${relationshipID}`);
  mutate('/hiring/relationships');
}

export async function requestRefund(relationshipID: string, reason: string): Promise<{ refund_id: string; auto_approved: boolean }> {
  return api.post('/hiring/refunds', { relationship_id: relationshipID, reason });
}

// ─── Nutritionist hooks ───────────────────────────────────────────────────────

export function useEarnings() {
  const { data, error, isLoading, mutate } = useSWR<EarningsSummary>(
    '/hiring/earnings',
    () => api.get<EarningsSummary>('/hiring/earnings'),
  );
  return { earnings: data ?? null, isLoading, error, mutate };
}

export function useNutritionistRelationships() {
  const { data, error, isLoading, mutate } = useSWR<{ relationships: Relationship[] }>(
    '/hiring/relationships/nutritionist',
    () => api.get<{ relationships: Relationship[] }>('/hiring/relationships'),
  );
  return {
    relationships: data?.relationships ?? [],
    isLoading,
    error,
    mutate,
  };
}

export async function startStripeConnect(): Promise<string> {
  const res = await api.post<{ onboarding_url: string }>('/hiring/connect', {});
  return res.onboarding_url;
}

export async function refundDecision(refundID: string, approve: boolean): Promise<void> {
  await api.put(`/hiring/refunds/${refundID}/decision`, { approve });
}
