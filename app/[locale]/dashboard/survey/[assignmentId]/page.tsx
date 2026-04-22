'use client';

import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useSurveyAssignment, submitSurveyResponses } from '@/lib/survey';
import SurveyForm from '@/components/survey/SurveyForm';

// Note: the URL param is called "assignmentId" but we actually pass the
// relationship_id here, since the API resolves assignments by relationship.

export default function ClientSurveyPage() {
  const locale = useLocale();
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
            &larr; Dashboard
          </Link>
          <div className="dash-topbar-title">Encuesta de intake</div>
        </div>
      </div>
      <div className="dash-content">
        {isLoading && (
          <div style={{ color: 'var(--nc-stone)', fontWeight: 300, fontSize: 13 }}>
            Cargando encuesta...
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(205,92,92,0.1)', border: '1px solid rgba(205,92,92,0.2)',
            borderRadius: 6, padding: 12, fontSize: 13, color: '#cd5c5c',
          }}>
            Error al cargar la encuesta.
          </div>
        )}

        {!isLoading && !assignment && !error && (
          <div style={{
            background: 'var(--nc-cream)', border: '1px solid var(--nc-border)',
            borderRadius: 8, padding: '24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--nc-ink)', marginBottom: 8 }}>
              No hay encuesta asignada
            </div>
            <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>
              Tu nutricionista aun no te ha asignado una encuesta de intake.
            </div>
          </div>
        )}

        {!isLoading && assignment && (
          <SurveyForm
            responses={assignment.responses}
            status={assignment.status}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </>
  );
}
