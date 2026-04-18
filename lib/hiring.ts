// frontend/lib/hiring.ts
'use client';

import useSWR, { mutate } from 'swr';
import { api } from './api';
import type { ClientRelationshipView, NutritionistRelationshipView, WaitlistEntryView, BusinessDashboardData } from './types';

// ─── Client hooks ─────────────────────────────────────────────────────────────

export function useMyRelationships() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<{ relationships: NutritionistRelationshipView[] }>(
    '/hiring/relationships',
    () => api.get<{ relationships: NutritionistRelationshipView[] }>('/hiring/relationships'),
  );
  return {
    relationships: data?.relationships ?? [],
    isLoading,
    error,
    mutate: revalidate,
  };
}

// connectWithNutritionist sends a connection request from a client to a nutritionist.
// Returns the new relationship ID and status.
export async function connectWithNutritionist(
  slug: string,
  packageID: string,
): Promise<{ relationship_id: string; status: string }> {
  return api.post(`/nutritionists/${slug}/connect`, { package_id: packageID });
}

export async function cancelRelationship(relationshipID: string): Promise<void> {
  await api.del(`/hiring/relationships/${relationshipID}`);
  mutate('/hiring/relationships');
}

export async function completeRelationship(relationshipID: string, notes: string): Promise<void> {
  await api.post(`/hiring/relationships/${relationshipID}/complete`, { notes });
  mutate('/hiring/relationships');
  mutate('/hiring/relationships/nutritionist');
  mutate('/nutritionist/clients');
  mutate('/nutritionist/stats');
  mutate('/hiring/business-dashboard');
}

export async function reactivateRelationship(relationshipID: string): Promise<void> {
  await api.post(`/hiring/relationships/${relationshipID}/reactivate`, {});
  mutate('/hiring/relationships');
  mutate('/hiring/relationships/nutritionist');
  mutate('/nutritionist/clients');
  mutate('/nutritionist/stats');
  mutate('/hiring/business-dashboard');
}

export async function activateRelationship(relationshipID: string): Promise<void> {
  await api.post(`/hiring/relationships/${relationshipID}/activate`, {});
  mutate('/hiring/relationships');
  mutate('/hiring/relationships/nutritionist');
  mutate('/nutritionist/clients');
  mutate('/nutritionist/stats');
  mutate('/hiring/business-dashboard');
}

// ─── Nutritionist hooks ───────────────────────────────────────────────────────

export function useNutritionistRelationships() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<{ relationships: ClientRelationshipView[] }>(
    '/hiring/relationships/nutritionist',  // ← different key to avoid cache collision with useMyRelationships
    () => api.get<{ relationships: ClientRelationshipView[] }>('/hiring/relationships'),
  );
  return {
    relationships: data?.relationships ?? [],
    isLoading,
    error,
    mutate: revalidate,
  };
}

export function useNutritionistWaitlist() {
  const { data, error, isLoading } = useSWR<{ waitlist: WaitlistEntryView[] }>(
    '/hiring/waitlist',
    () => api.get<{ waitlist: WaitlistEntryView[] }>('/hiring/waitlist'),
  );
  return { waitlist: data?.waitlist ?? [], isLoading, error };
}

// subscribeToTier creates a Stripe Checkout session for the given tier.
// Returns the Stripe-hosted checkout URL.
export async function subscribeToTier(tier: 'pro' | 'premium'): Promise<string> {
  const res = await api.post<{ checkout_url: string }>('/hiring/subscribe', { tier });
  return res.checkout_url;
}

// openBillingPortal opens the Stripe Customer Portal for plan management.
// Returns the portal URL.
export async function openBillingPortal(): Promise<string> {
  const res = await api.post<{ portal_url: string }>('/hiring/billing-portal', {});
  return res.portal_url;
}

export function useBusinessDashboard() {
  const { data, error, isLoading } = useSWR<BusinessDashboardData>(
    '/hiring/business-dashboard',
    () => api.get<BusinessDashboardData>('/hiring/business-dashboard'),
  );
  return {
    data: data ?? null,
    isLoading,
    error,
  };
}
