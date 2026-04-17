'use client';
// frontend/lib/exercise-templates.ts

import useSWR from 'swr';
import { api } from '@/lib/api';
import type { ExerciseTemplate, ExerciseCategory } from '@/lib/types';

// ─── Payload types ────────────────────────────────────────────────────────────

export interface ExerciseTemplatePayload {
  name: string;
  description: string;
  category: ExerciseCategory;
  muscle_groups: string;
  equipment: string;
  instructions: string;
  demo_video_url: string | null;
}

export interface UploadPhotoResponse {
  photo: {
    id: string;
    template_id: string;
    photo_url: string;
    is_primary: boolean;
    display_order: number;
    uploaded_at: string;
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useExerciseTemplates(
  category?: ExerciseCategory,
  search?: string,
) {
  let key = '/exercise-templates';
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  const qs = params.toString();
  if (qs) key += `?${qs}`;

  const { data, error, isLoading, mutate } = useSWR<{ templates: ExerciseTemplate[] }>(
    key,
    () => api.get<{ templates: ExerciseTemplate[] }>(key),
    { revalidateOnFocus: false },
  );
  return { templates: data?.templates ?? [], isLoading, error, mutate };
}

export function useExerciseTemplate(id: string | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR<ExerciseTemplate>(
    id ? `/exercise-templates/${id}` : null,
    () => api.get<ExerciseTemplate>(`/exercise-templates/${id!}`),
    { revalidateOnFocus: false },
  );
  return { template: data ?? null, isLoading, error, mutate };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createExerciseTemplate(payload: ExerciseTemplatePayload): Promise<{ id: string }> {
  return api.post<{ id: string }>('/exercise-templates', payload);
}

export async function updateExerciseTemplate(id: string, payload: ExerciseTemplatePayload): Promise<void> {
  await api.put<void>(`/exercise-templates/${id}`, payload);
}

export async function deleteExerciseTemplate(id: string): Promise<void> {
  await api.del<void>(`/exercise-templates/${id}`);
}

// ─── Photo mutations ──────────────────────────────────────────────────────────

export async function uploadTemplatePhoto(
  templateId: string,
  file: File,
): Promise<UploadPhotoResponse> {
  const formData = new FormData();
  formData.append('photo', file);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';
  const token = localStorage.getItem('accessToken');

  const res = await fetch(`${BASE_URL}/exercise-templates/${templateId}/photos`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.statusText}`);
  }

  return res.json();
}

export async function deleteTemplatePhoto(templateId: string, photoId: string): Promise<void> {
  await api.del<void>(`/exercise-templates/${templateId}/photos/${photoId}`);
}

export async function setPrimaryTemplatePhoto(templateId: string, photoId: string): Promise<void> {
  await api.put<void>(`/exercise-templates/${templateId}/photos/${photoId}/primary`, {});
}
