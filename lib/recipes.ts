'use client';
// frontend/lib/recipes.ts

import useSWR from 'swr';
import { api } from '@/lib/api';
import type { Recipe, Tag } from '@/lib/types';

// ─── Payload types ────────────────────────────────────────────────────────────

export interface RecipeIngredientPayload {
  amount: number;
  unit: string;
  ingredient_name: string;
  display_order: number;
}

export interface RecipePayload {
  name: string;
  description: string;
  category: string;
  base_servings: number;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  calories_per_serving: number | null;
  protein_g_per_serving: number | null;
  carbs_g_per_serving: number | null;
  fat_g_per_serving: number | null;
  ingredients: RecipeIngredientPayload[];
  tags: string[];
}

export interface UploadPhotoResponse {
  photo: {
    id: string;
    recipe_id: string;
    photo_url: string;
    is_primary: boolean;
    display_order: number;
    uploaded_at: string;
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useRecipes(
  category?: string,
  search?: string,
  tags?: string[],
) {
  let key = '/recipes';
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  if (tags && tags.length > 0) {
    tags.forEach(t => params.append('tags', t));
  }
  const qs = params.toString();
  if (qs) key += `?${qs}`;

  const { data, error, isLoading, mutate } = useSWR<{ recipes: Recipe[] }>(
    key,
    () => api.get<{ recipes: Recipe[] }>(key),
    { revalidateOnFocus: false },
  );
  return { recipes: data?.recipes ?? [], isLoading, error, mutate };
}

export function useRecipe(id: string | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR<Recipe>(
    id ? `/recipes/${id}` : null,
    () => api.get<Recipe>(`/recipes/${id!}`),
    { revalidateOnFocus: false },
  );
  return { recipe: data ?? null, isLoading, error, mutate };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createRecipe(payload: RecipePayload): Promise<{ id: string }> {
  return api.post<{ id: string }>('/recipes', payload);
}

export async function updateRecipe(id: string, payload: RecipePayload): Promise<void> {
  await api.put<void>(`/recipes/${id}`, payload);
}

export async function deleteRecipe(id: string): Promise<void> {
  await api.del<void>(`/recipes/${id}`);
}

// ─── Photo mutations ──────────────────────────────────────────────────────────

export async function uploadRecipePhoto(
  recipeId: string,
  file: File,
): Promise<UploadPhotoResponse> {
  const formData = new FormData();
  formData.append('photo', file);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';
  const response = await fetch(`${BASE_URL}/recipes/${recipeId}/photos`, {
    method: 'POST',
    credentials: 'include', // Include cookies for authentication
    body: formData,
    // Don't set Content-Type - browser will set it with boundary for multipart/form-data
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function deleteRecipePhoto(
  recipeId: string,
  photoId: string,
): Promise<void> {
  await api.del<void>(`/recipes/${recipeId}/photos/${photoId}`);
}

export async function setPrimaryPhoto(
  recipeId: string,
  photoId: string,
): Promise<void> {
  await api.put<void>(`/recipes/${recipeId}/photos/${photoId}/primary`, {});
}

// ─── Tag autocomplete ─────────────────────────────────────────────────────────

export async function autocompleteTags(query: string): Promise<Tag[]> {
  const res = await api.get<{ tags: Tag[] }>(`/tags/autocomplete?q=${encodeURIComponent(query)}`);
  return res.tags ?? [];
}
