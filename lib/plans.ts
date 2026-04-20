'use client';
// frontend/lib/plans.ts

import useSWR from 'swr';
import { api, ApiRequestError } from '@/lib/api';
import type {
  NutritionPlan,
  ExercisePlan,
  ClientProfileSummary,
  MealType,
  SupplementTiming,
  PlanStyle,
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

export interface SlotOptionPayload {
  name: string;
  description: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  display_order: number;
}

export interface NutritionPlanSlotPayload {
  meal_type: MealType;
  display_order: number;
  options: SlotOptionPayload[];
}

export interface MealPayload {
  name: string;
  meal_type: MealType;
  display_order: number;
  options: MealOptionPayload[];
}

export interface NutritionDayPayload {
  day_number: number;
  label: string;
  notes: string;
  meals: MealPayload[];
}

export interface SupplementPayload {
  id?: string;
  name: string;
  brand?: string | null;
  dosage: string;
  timing: SupplementTiming;
  linked_meal_id?: string | null;
  notes?: string | null;
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  display_order: number;
}

export interface NutritionPlanPayload {
  client_id: string;
  title: string;
  notes: string;
  plan_style: PlanStyle;
  days?: NutritionDayPayload[];
  slots?: NutritionPlanSlotPayload[];
  include_supplements: boolean;
  supplements: SupplementPayload[];
}

export interface ExercisePayload {
  name: string;
  sets: number | null;
  reps: number | null;
  rest_seconds: number | null;
  notes: string;
  display_order: number;
}

export interface CardioActivityPayload {
  name: string;
  duration_minutes: number | null;
  distance_km: number | null;
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
  day_type: 'strength' | 'cardio' | 'rest';
  blocks: WorkoutBlockPayload[];
  activities: CardioActivityPayload[];
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

export function useNutritionPlan(id: string | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR<NutritionPlan>(
    id ? `/plans/nutrition/${id}` : null,
    () => api.get<NutritionPlan>(`/plans/nutrition/${id!}`),
    { revalidateOnFocus: false },
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

export function useExercisePlan(id: string | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR<ExercisePlan>(
    id ? `/plans/exercise/${id}` : null,
    () => api.get<ExercisePlan>(`/plans/exercise/${id!}`),
    { revalidateOnFocus: false },
  );
  return { plan: data ?? null, isLoading, error, mutate };
}

// ─── Client: active plan hooks (parallel) ────────────────────────────────────

export function useMyActivePlans() {
  const {
    data: nutritionData,
    isLoading: nutritionLoading,
    error: nutritionError,
  } = useSWR<{ plan: NutritionPlan | null }>(
    '/plans/nutrition/active',
    () =>
      api
        .get<{ plan: NutritionPlan | null }>('/plans/nutrition/active')
        .catch((err) => {
          if (err instanceof ApiRequestError && err.status === 404) return { plan: null };
          throw err;
        }),
    { revalidateOnFocus: false },
  );

  const {
    data: exerciseData,
    isLoading: exerciseLoading,
    error: exerciseError,
  } = useSWR<{ plan: ExercisePlan | null }>(
    '/plans/exercise/active',
    () =>
      api
        .get<{ plan: ExercisePlan | null }>('/plans/exercise/active')
        .catch((err) => {
          if (err instanceof ApiRequestError && err.status === 404) return { plan: null };
          throw err;
        }),
    { revalidateOnFocus: false },
  );

  return {
    nutrition: nutritionData?.plan ?? null,
    exercise: exerciseData?.plan ?? null,
    isLoading: nutritionLoading || exerciseLoading,
    error: nutritionError ?? exerciseError,
  };
}

// ─── Nutritionist: client profile hook (side utility) ────────────────────────

export function useClientProfile(clientId: string) {
  const { data, error, isLoading } = useSWR<ClientProfileSummary | null>(
    clientId ? `/clients/${clientId}/profile` : null,
    () =>
      api
        .get<{ profile: ClientProfileSummary | null }>(`/clients/${clientId}/profile`)
        .then((res) => res.profile)
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

// ─── Mutations: Duplicate plans ───────────────────────────────────────────────

export async function duplicatePlans(
  clientId: string,
  nutritionPlanId?: string,
  exercisePlanId?: string,
): Promise<{
  nutrition_plan?: { id: string };
  exercise_plan?: { id: string };
}> {
  return api.post<{
    nutrition_plan?: { id: string };
    exercise_plan?: { id: string };
  }>('/plans/duplicate', {
    client_id: clientId,
    nutrition_plan_id: nutritionPlanId ?? null,
    exercise_plan_id: exercisePlanId ?? null,
  });
}
