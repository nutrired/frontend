'use client';

import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSurveyAssignment, submitSurveyResponses } from '@/lib/survey';
import SurveyForm from '@/components/survey/SurveyForm';

// Note: the URL param is called "assignmentId" but we actually pass the
// relationship_id here, since the API resolves assignments by relationship.

export default function ClientSurveyPage() {
  const locale = useLocale();
  const t = useTranslations('dashboard.surveys');
  const params = useParams<{ assignmentId: string }>();
  const relationshipId = params.assignmentId;
  const { assignment, isLoading, error, mutate } = useSurveyAssignment(relationshipId);

  const handleSubmit = async (responses: {
    response_id: string;
    answer_text?: string | null;
    answer_numeric?: number | null;
    answer_file_url?: string | null;
  }[]) => {
    await submitSurveyResponses(relationshipId, responses);
    mutate();
  };

  return (
    <>
      <div className="dash-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href={`/${locale}/dashboard`}
            style={{ fontSize: 13, color: 'var(--nc-stone)', textDecoration: 'none' }}
          >
            &larr; {t('back_to_dashboard')}
          </Link>
          <div className="dash-topbar-title">{t('intake_survey_title')}</div>
        </div>
      </div>
      <div className="dash-content">
        {isLoading && (
          <div style={{ color: 'var(--nc-stone)', fontWeight: 300, fontSize: 13 }}>
            {t('loading_survey')}
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(205,92,92,0.1)', border: '1px solid rgba(205,92,92,0.2)',
            borderRadius: 6, padding: 12, fontSize: 13, color: '#cd5c5c',
          }}>
            {t('error_loading_survey')}
          </div>
        )}

        {!isLoading && !assignment && !error && (
          <div style={{
            background: 'var(--nc-cream)', border: '1px solid var(--nc-border)',
            borderRadius: 8, padding: '24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--nc-ink)', marginBottom: 8 }}>
              {t('no_survey_assigned')}
            </div>
            <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>
              {t('no_survey_assigned_desc')}
            </div>
          </div>
        )}

        {!isLoading && assignment && (
          <SurveyForm
            responses={assignment.responses}
            status={assignment.status}
            relationshipId={relationshipId}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </>
  );
}
