'use client';

import useSWR from 'swr';
import { api, ApiRequestError } from './api';
import type { SurveyTemplateListItem, SurveyTemplateDetail, TemplateQuestion, SurveyAssignmentDetail } from './types';

// ─── API Methods ─────────────────────────────────────────────────────────────

export async function createSurveyTemplate(data: {
  title: string;
  description: string;
  questions: TemplateQuestion[];
}): Promise<{ template_id: string }> {
  return api.post<{ template_id: string }>('/surveys/templates', data);
}

export async function updateSurveyTemplate(
  id: string,
  data: {
    title: string;
    description: string;
    questions: TemplateQuestion[];
  },
): Promise<{ template_id: string }> {
  return api.put<{ template_id: string }>(`/surveys/templates/${id}`, data);
}

export async function getSurveyTemplate(
  id: string,
): Promise<SurveyTemplateDetail> {
  return api.get<SurveyTemplateDetail>(`/surveys/templates/${id}`);
}

export async function listSurveyTemplates(
  activeOnly?: boolean,
): Promise<{ templates: SurveyTemplateListItem[] }> {
  const params = activeOnly ? '?active_only=true' : '';
  return api.get<{ templates: SurveyTemplateListItem[] }>(`/surveys/templates${params}`);
}

export async function assignSurveyToRelationship(
  templateId: string,
  relationshipId: string,
): Promise<{ assignment_id: string }> {
  return api.post<{ assignment_id: string }>(`/surveys/templates/${templateId}/assign`, {
    relationship_id: relationshipId,
  });
}

export async function getSurveyAssignment(
  relationshipId: string,
): Promise<SurveyAssignmentDetail> {
  return api.get<SurveyAssignmentDetail>(`/relationships/${relationshipId}/survey`);
}

export async function submitSurveyResponses(
  relationshipId: string,
  responses: {
    response_id: string;
    answer_text?: string | null;
    answer_numeric?: number | null;
    answer_file_url?: string | null;
  }[],
): Promise<{ assignment_id: string; status: string }> {
  return api.put<{ assignment_id: string; status: string }>(
    `/relationships/${relationshipId}/survey/responses`,
    { responses },
  );
}

export async function reviewSurveyAssignment(
  relationshipId: string,
): Promise<{ assignment_id: string; status: string }> {
  return api.post<{ assignment_id: string; status: string }>(
    `/relationships/${relationshipId}/survey/review`,
    {},
  );
}

export async function archiveSurveyTemplate(
  templateId: string,
): Promise<{ template_id: string; is_active: boolean }> {
  return api.post<{ template_id: string; is_active: boolean }>(
    `/surveys/templates/${templateId}/archive`,
    {},
  );
}

export async function unarchiveSurveyTemplate(
  templateId: string,
): Promise<{ template_id: string; is_active: boolean }> {
  return api.post<{ template_id: string; is_active: boolean }>(
    `/surveys/templates/${templateId}/unarchive`,
    {},
  );
}

// ─── SWR Hooks ───────────────────────────────────────────────────────────────

export function useSurveyTemplate(id: string | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR<SurveyTemplateDetail | null>(
    id ? `/surveys/templates/${id}` : null,
    () =>
      getSurveyTemplate(id!).catch((err) => {
        if (err instanceof ApiRequestError && err.status === 404) return null;
        throw err;
      }),
    { revalidateOnFocus: false },
  );

  return {
    template: data ?? null,
    isLoading,
    error,
    mutate,
  };
}

export function useSurveyTemplates(activeOnly?: boolean) {
  const key = activeOnly
    ? '/surveys/templates?active_only=true'
    : '/surveys/templates';

  const { data, error, isLoading, mutate } = useSWR<{ templates: SurveyTemplateListItem[] }>(
    key,
    () => listSurveyTemplates(activeOnly),
    { revalidateOnFocus: false },
  );

  return {
    templates: data?.templates ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useSurveyAssignment(relationshipId: string | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR<SurveyAssignmentDetail | null>(
    relationshipId ? `/relationships/${relationshipId}/survey` : null,
    () =>
      getSurveyAssignment(relationshipId!).catch((err) => {
        if (err instanceof ApiRequestError && err.status === 404) return null;
        throw err;
      }),
    { revalidateOnFocus: false },
  );

  return {
    assignment: data ?? null,
    isLoading,
    error,
    mutate,
  };
}

export async function getPendingSurveyReviews(): Promise<{
  reviews: {
    assignment_id: string;
    relationship_id: string;
    client_id: string;
    client_name: string;
    completed_at: string;
  }[];
}> {
  return api.get<{
    reviews: {
      assignment_id: string;
      relationship_id: string;
      client_id: string;
      client_name: string;
      completed_at: string;
    }[];
  }>('/surveys/pending-reviews');
}

export function usePendingSurveyReviews() {
  const { data, error, isLoading, mutate } = useSWR(
    '/surveys/pending-reviews',
    getPendingSurveyReviews,
    { revalidateOnFocus: false },
  );

  return {
    reviews: data?.reviews ?? [],
    isLoading,
    error,
    mutate,
  };
}
