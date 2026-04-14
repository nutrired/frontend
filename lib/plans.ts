// frontend/lib/plans.ts
'use client';

import useSWR from 'swr';
import { api, ApiRequestError } from '@/lib/api';
import type {
  NutritionPlan,
  ExercisePlan,
  ClientProfileSummary,
} from '@/lib/types';

// ─── Payload types (used only in this file + callers) ────────────────────────

export interface MealOptionPayload {
  name: string;
  description: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  display_order: number;
}

export interface MealPayload {
  name: string;
  meal_type: string;
  display_order: number;
  options: MealOptionPayload[];
}

export interface NutritionDayPayload {
  day_number: number;
  label: string;
  notes: string;
  meals: MealPayload[];
}

export interface NutritionPlanPayload {
  client_id: string;
  title: string;
  notes: string;
  days: NutritionDayPayload[];
}

export interface ExercisePayload {
  name: string;
  sets: number | null;
  reps: number | null;
  rest_seconds: number | null;
  notes: string;
  display_order: number;
}

export interface WorkoutBlockPayload {
  name: string;
  display_order: number;
  exercises: ExercisePayload[];
}

export interface ExerciseDayPayload {
  day_number: number;
  label: string;
  notes: string;
  blocks: WorkoutBlockPayload[];
}

export interface ExercisePlanPayload {
  client_id: string;
  title: string;
  notes: string;
  days: ExerciseDayPayload[];
}

// ─── Nutritionist: Nutrition plan hooks ──────────────────────────────────────

export function useNutritionPlans(clientId?: string) {
  const key = clientId
    ? `/plans/nutrition?client_id=${clientId}`
    : '/plans/nutrition';
  const { data, error, isLoading, mutate } = useSWR<{ plans: NutritionPlan[] }>(
    key,
    () => api.get<{ plans: NutritionPlan[] }>(key),
  );
  return { plans: data?.plans ?? [], isLoading, error, mutate };
}

export function useNutritionPlan(id: string) {
  const { data, error, isLoading, mutate } = useSWR<NutritionPlan>(
    id ? `/plans/nutrition/${id}` : null,
    () => api.get<NutritionPlan>(`/plans/nutrition/${id}`),
  );
  return { plan: data ?? null, isLoading, error, mutate };
}

// ─── Nutritionist: Exercise plan hooks ───────────────────────────────────────

export function useExercisePlans(clientId?: string) {
  const key = clientId
    ? `/plans/exercise?client_id=${clientId}`
    : '/plans/exercise';
  const { data, error, isLoading, mutate } = useSWR<{ plans: ExercisePlan[] }>(
    key,
    () => api.get<{ plans: ExercisePlan[] }>(key),
  );
  return { plans: data?.plans ?? [], isLoading, error, mutate };
}

export function useExercisePlan(id: string) {
  const { data, error, isLoading, mutate } = useSWR<ExercisePlan>(
    id ? `/plans/exercise/${id}` : null,
    () => api.get<ExercisePlan>(`/plans/exercise/${id}`),
  );
  return { plan: data ?? null, isLoading, error, mutate };
}

// ─── Client: active plan hooks (parallel) ────────────────────────────────────

export function useMyActivePlans() {
  const {
    data: nutritionData,
    isLoading: nutritionLoading,
  } = useSWR<NutritionPlan | null>(
    '/plans/nutrition/active',
    () =>
      api
        .get<NutritionPlan>('/plans/nutrition/active')
        .catch((err) => {
          if (err instanceof ApiRequestError && err.status === 404) return null;
          throw err;
        }),
    { revalidateOnFocus: false },
  );

  const {
    data: exerciseData,
    isLoading: exerciseLoading,
  } = useSWR<ExercisePlan | null>(
    '/plans/exercise/active',
    () =>
      api
        .get<ExercisePlan>('/plans/exercise/active')
        .catch((err) => {
          if (err instanceof ApiRequestError && err.status === 404) return null;
          throw err;
        }),
    { revalidateOnFocus: false },
  );

  return {
    nutrition: nutritionData ?? null,
    exercise: exerciseData ?? null,
    isLoading: nutritionLoading || exerciseLoading,
  };
}

// ─── Nutritionist: client profile hook (side utility) ────────────────────────

export function useClientProfile(clientId: string) {
  const { data, error, isLoading } = useSWR<ClientProfileSummary | null>(
    clientId ? `/clients/${clientId}/profile` : null,
    () =>
      api
        .get<ClientProfileSummary>(`/clients/${clientId}/profile`)
        .catch((err) => {
          if (err instanceof ApiRequestError && err.status === 404) return null;
          throw err;
        }),
    { revalidateOnFocus: false },
  );
  return { profile: data ?? null, isLoading, error };
}

// ─── Mutations: Nutrition plans ───────────────────────────────────────────────

export async function createNutritionPlan(
  payload: NutritionPlanPayload,
): Promise<{ id: string }> {
  return api.post<{ id: string }>('/plans/nutrition', payload);
}

export async function updateNutritionPlan(
  id: string,
  payload: NutritionPlanPayload,
): Promise<void> {
  await api.put<void>(`/plans/nutrition/${id}`, payload);
}

export async function activateNutritionPlan(id: string): Promise<void> {
  await api.post<void>(`/plans/nutrition/${id}/activate`, {});
}

export async function deleteNutritionPlan(id: string): Promise<void> {
  await api.del<void>(`/plans/nutrition/${id}`);
}

// ─── Mutations: Exercise plans ────────────────────────────────────────────────

export async function createExercisePlan(
  payload: ExercisePlanPayload,
): Promise<{ id: string }> {
  return api.post<{ id: string }>('/plans/exercise', payload);
}

export async function updateExercisePlan(
  id: string,
  payload: ExercisePlanPayload,
): Promise<void> {
  await api.put<void>(`/plans/exercise/${id}`, payload);
}

export async function activateExercisePlan(id: string): Promise<void> {
  await api.post<void>(`/plans/exercise/${id}/activate`, {});
}

export async function deleteExercisePlan(id: string): Promise<void> {
  await api.del<void>(`/plans/exercise/${id}`);
}
