'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { QuestionWithResponse } from '@/lib/types';
import QuestionRenderer from './QuestionRenderer';

interface SurveyFormProps {
  responses: QuestionWithResponse[];
  status: string;
  relationshipId: string;
  onSubmit: (answers: {
    response_id: string;
    answer_text?: string | null;
    answer_numeric?: number | null;
    answer_file_url?: string | null;
  }[]) => Promise<void>;
}

export default function SurveyForm({ responses, status, relationshipId, onSubmit }: SurveyFormProps) {
  const t = useTranslations('dashboard.surveys');
  const sortedResponses = [...responses].sort((a, b) => a.display_order - b.display_order);
  const total = sortedResponses.length;

  const [answers, setAnswers] = useState<Map<string, {
    text?: string | null;
    numeric?: number | null;
    fileUrl?: string | null;
  }>>(() => {
    const map = new Map();
    for (const r of sortedResponses) {
      map.set(r.id, {
        text: r.answer_text,
        numeric: r.answer_numeric,
        fileUrl: r.answer_file_url,
      });
    }
    return map;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isReviewed = status === 'reviewed';
  const isCompleted = status === 'completed';

  // Count answered questions
  const answeredCount = sortedResponses.filter((r) => {
    const answer = answers.get(r.id);
    if (!answer) return false;
    return (answer.text != null && answer.text !== '') ||
           answer.numeric != null ||
           (answer.fileUrl != null && answer.fileUrl !== '');
  }).length;

  const requiredUnanswered = sortedResponses.filter((r) => {
    if (!r.is_required) return false;
    const answer = answers.get(r.id);
    if (!answer) return true;
    return (answer.text == null || answer.text === '') &&
           answer.numeric == null &&
           (answer.fileUrl == null || answer.fileUrl === '');
  });

  const progressPercent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  const handleAnswerChange = useCallback((responseId: string, update: {
    text?: string | null;
    numeric?: number | null;
    fileUrl?: string | null;
  }) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      const current = next.get(responseId) ?? {};
      next.set(responseId, { ...current, ...update });
      return next;
    });
  }, []);

  const buildPayload = useCallback(() => {
    return sortedResponses.map((r) => {
      const answer = answers.get(r.id);
      return {
        response_id: r.id,
        answer_text: answer?.text ?? null,
        answer_numeric: answer?.numeric ?? null,
        answer_file_url: answer?.fileUrl ?? null,
      };
    });
  }, [sortedResponses, answers]);

  const handleSaveDraft = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);
    try {
      await onSubmit(buildPayload());
      setSuccessMessage(t('draft_saved'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);

    if (requiredUnanswered.length > 0) {
      setError(t('required_error', { count: requiredUnanswered.length }));
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit(buildPayload());
      setSuccessMessage(t('survey_submitted'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('submit_error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--nc-stone)' }}>
            {t('progress_label')}: {answeredCount}/{total} {t('questions_label')}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--nc-forest)' }}>
            {progressPercent}%
          </span>
        </div>
        <div style={{
          width: '100%', height: 6, background: 'var(--nc-cream)',
          borderRadius: 3, overflow: 'hidden',
        }}>
          <div style={{
            width: `${progressPercent}%`, height: '100%',
            background: 'var(--nc-forest)', borderRadius: 3,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Status badges */}
      {isReviewed && (
        <div style={{
          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 8, padding: '10px 14px', marginBottom: 20,
          fontSize: 13, color: '#3b82f6', fontWeight: 400,
        }}>
          {t('reviewed_notice')}
        </div>
      )}

      {isCompleted && !isReviewed && (
        <div style={{
          background: 'rgba(74,124,89,0.06)', border: '1px solid rgba(74,124,89,0.15)',
          borderRadius: 8, padding: '10px 14px', marginBottom: 20,
          fontSize: 13, color: '#4a7c59', fontWeight: 400,
        }}>
          {t('completed_notice')}
        </div>
      )}

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sortedResponses.map((r) => {
          const answer = answers.get(r.id);
          return (
            <QuestionRenderer
              key={r.id}
              questionText={r.question_text}
              questionType={r.question_type}
              options={r.options}
              isRequired={r.is_required}
              answerText={answer?.text ?? null}
              answerNumeric={answer?.numeric ?? null}
              answerFileUrl={answer?.fileUrl ?? null}
              onChange={(update) => handleAnswerChange(r.id, update)}
              disabled={isReviewed}
              relationshipId={relationshipId}
            />
          );
        })}
      </div>

      {/* Error / success */}
      {error && (
        <div style={{
          background: 'rgba(205,92,92,0.1)', border: '1px solid rgba(205,92,92,0.2)',
          borderRadius: 6, padding: 12, marginTop: 16, fontSize: 13, color: '#cd5c5c',
        }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{
          background: 'rgba(74,124,89,0.06)', border: '1px solid rgba(74,124,89,0.15)',
          borderRadius: 6, padding: 12, marginTop: 16, fontSize: 13, color: '#4a7c59',
        }}>
          {successMessage}
        </div>
      )}

      {/* Actions */}
      {!isReviewed && (
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            style={{
              padding: '10px 24px', fontSize: 13, fontWeight: 500,
              color: 'white', background: 'var(--nc-forest)',
              border: 'none', borderRadius: 6,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? t('saving') : t('submit_button')}
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            style={{
              padding: '10px 24px', fontSize: 13, fontWeight: 500,
              color: 'var(--nc-stone)', background: 'white',
              border: '1px solid var(--nc-border)', borderRadius: 6,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            {t('save_draft_button')}
          </button>
        </div>
      )}
    </div>
  );
}
