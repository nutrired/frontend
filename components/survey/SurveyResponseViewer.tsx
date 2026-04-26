'use client';

import type { ReactElement } from 'react';
import type { QuestionWithResponse, QuestionType } from '@/lib/types';

function NumericScaleVisual({ options, value }: { options: unknown; value: number }) {
  const opts = options as { min?: number; max?: number; label?: string };
  const min = opts.min ?? 1;
  const max = opts.max ?? 10;
  const range = max - min;
  const position = range > 0 ? ((value - min) / range) * 100 : 0;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        width: '100%', height: 4, background: 'var(--nc-cream)',
        borderRadius: 2, position: 'relative',
      }}>
        <div style={{
          position: 'absolute', left: `${position}%`,
          top: -3, width: 10, height: 10, borderRadius: '50%',
          background: 'var(--nc-forest)',
          transform: 'translateX(-50%)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--nc-stone)' }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

interface SurveyResponseViewerProps {
  responses: QuestionWithResponse[];
  status: string;
}

function renderAnswer(r: QuestionWithResponse): string | ReactElement {
  if (r.answer_text != null && r.answer_text !== '') return r.answer_text;
  if (r.answer_numeric != null) return String(r.answer_numeric);
  if (r.answer_file_url != null && r.answer_file_url !== '') {
    return (
      <a
        href={r.answer_file_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--nc-forest)', textDecoration: 'none', fontWeight: 500 }}
      >
        Ver archivo adjunto ↗
      </a>
    );
  }
  return 'Sin respuesta';
}

function questionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    short_text: 'Texto corto',
    long_text: 'Texto largo',
    multiple_choice: 'Opcion multiple',
    numeric_scale: 'Escala numerica',
    file_upload: 'Archivo',
  };
  return labels[type] ?? type;
}

export default function SurveyResponseViewer({ responses, status }: SurveyResponseViewerProps) {
  const sortedResponses = [...responses].sort((a, b) => a.display_order - b.display_order);

  const answered = sortedResponses.filter((r) => {
    return (r.answer_text != null && r.answer_text !== '') ||
           r.answer_numeric != null ||
           (r.answer_file_url != null && r.answer_file_url !== '');
  }).length;

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Summary */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
          background: status === 'reviewed' ? 'rgba(59,130,246,0.1)' : 'rgba(74,124,89,0.1)',
          color: status === 'reviewed' ? '#3b82f6' : '#4a7c59',
        }}>
          {status === 'reviewed' ? 'Revisada' : 'Completada'}
        </span>
        <span style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300 }}>
          {answered}/{sortedResponses.length} preguntas respondidas
        </span>
      </div>

      {/* Responses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sortedResponses.map((r, i) => {
          const hasAnswer = (r.answer_text != null && r.answer_text !== '') ||
                           r.answer_numeric != null ||
                           (r.answer_file_url != null && r.answer_file_url !== '');

          return (
            <div key={r.id} style={{
              border: '1px solid var(--nc-border)', borderRadius: 8,
              padding: 16, background: 'white',
            }}>
              {/* Question header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--nc-ink)' }}>
                    {i + 1}. {r.question_text}
                  </span>
                  {r.is_required && (
                    <span style={{ color: '#cd5c5c', marginLeft: 4, fontSize: 13 }}>*</span>
                  )}
                </div>
                <span style={{
                  fontSize: 10, color: 'var(--nc-stone)', fontWeight: 500,
                  padding: '2px 6px', background: 'var(--nc-cream)',
                  borderRadius: 4, whiteSpace: 'nowrap', marginLeft: 8,
                }}>
                  {questionTypeLabel(r.question_type)}
                </span>
              </div>

              {/* Answer */}
              <div style={{
                padding: '10px 14px',
                background: hasAnswer ? 'rgba(74,124,89,0.04)' : 'var(--nc-cream)',
                border: '1px solid var(--nc-border)',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: hasAnswer ? 400 : 300,
                color: hasAnswer ? 'var(--nc-ink)' : 'var(--nc-stone)',
                fontStyle: hasAnswer ? 'normal' : 'italic',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
              }}>
                {renderAnswer(r)}
              </div>

              {/* Numeric scale visual */}
              {r.question_type === 'numeric_scale' && r.answer_numeric != null && r.options != null ? (
                <NumericScaleVisual options={r.options} value={r.answer_numeric} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
