'use client';

import { useState, useRef } from 'react';
import type { QuestionType } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { uploadSurveyAttachment } from '@/lib/survey';

interface QuestionRendererProps {
  questionText: string;
  questionType: QuestionType;
  options: unknown;
  isRequired: boolean;
  answerText: string | null;
  answerNumeric: number | null;
  answerFileUrl: string | null;
  onChange: (answer: { text?: string | null; numeric?: number | null; fileUrl?: string | null }) => void;
  disabled?: boolean;
  relationshipId?: string;
}

export default function QuestionRenderer({
  questionText,
  questionType,
  options,
  isRequired,
  answerText,
  answerNumeric,
  answerFileUrl,
  onChange,
  disabled = false,
  relationshipId,
}: QuestionRendererProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !relationshipId) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadSurveyAttachment(relationshipId, file);
      onChange({ fileUrl: result.url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir el archivo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div style={{
      border: '1px solid var(--nc-border)', borderRadius: 8,
      padding: 16, background: 'white',
    }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--nc-ink)' }}>
          {questionText}
        </span>
        {isRequired && (
          <span style={{ color: '#cd5c5c', marginLeft: 4, fontSize: 14 }}>*</span>
        )}
      </div>

      {questionType === 'short_text' && (
        <input
          type="text"
          value={answerText ?? ''}
          onChange={(e) => onChange({ text: e.target.value || null })}
          disabled={disabled}
          placeholder="Tu respuesta..."
          style={{
            width: '100%', padding: '8px 12px', fontSize: 13, fontFamily: 'inherit',
            border: '1px solid var(--nc-border)', borderRadius: 6,
            background: disabled ? 'var(--nc-cream)' : 'white',
          }}
        />
      )}

      {questionType === 'long_text' && (
        <textarea
          value={answerText ?? ''}
          onChange={(e) => onChange({ text: e.target.value || null })}
          disabled={disabled}
          placeholder="Tu respuesta..."
          rows={4}
          style={{
            width: '100%', padding: '8px 12px', fontSize: 13, fontFamily: 'inherit',
            border: '1px solid var(--nc-border)', borderRadius: 6, resize: 'vertical',
            background: disabled ? 'var(--nc-cream)' : 'white',
          }}
        />
      )}

      {questionType === 'multiple_choice' && (() => {
        const choices = Array.isArray(options) ? (options as string[]) : [];
        return (
          <RadioGroup
            value={answerText ?? ''}
            onValueChange={(val) => onChange({ text: val || null })}
            disabled={disabled}
          >
            {choices.map((choice, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RadioGroupItem value={choice} id={`choice-${i}`} />
                <Label
                  htmlFor={`choice-${i}`}
                  style={{ fontSize: 13, fontWeight: 400, color: 'var(--nc-ink)', cursor: disabled ? 'default' : 'pointer' }}
                >
                  {choice}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      })()}

      {questionType === 'numeric_scale' && (() => {
        const scaleOpts = (options && typeof options === 'object' && !Array.isArray(options))
          ? (options as { min: number; max: number; label?: string })
          : { min: 1, max: 10 };
        const min = scaleOpts.min ?? 1;
        const max = scaleOpts.max ?? 10;
        const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

        return (
          <div>
            {scaleOpts.label && (
              <div style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300, marginBottom: 8 }}>
                {scaleOpts.label}
              </div>
            )}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {values.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => !disabled && onChange({ numeric: val })}
                  disabled={disabled}
                  style={{
                    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 500, borderRadius: 6,
                    border: answerNumeric === val
                      ? '2px solid var(--nc-forest)'
                      : '1px solid var(--nc-border)',
                    background: answerNumeric === val ? 'rgba(74,124,89,0.1)' : 'white',
                    color: answerNumeric === val ? 'var(--nc-forest)' : 'var(--nc-ink)',
                    cursor: disabled ? 'default' : 'pointer',
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--nc-stone)' }}>
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </div>
        );
      })()}

      {questionType === 'file_upload' && (
        <div>
          {answerFileUrl ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', background: 'var(--nc-cream)',
              border: '1px solid var(--nc-border)', borderRadius: 6,
            }}>
              <a
                href={answerFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13, color: 'var(--nc-forest)', fontWeight: 400, flex: 1, textDecoration: 'none' }}
              >
                Ver archivo ↗
              </a>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange({ fileUrl: null })}
                  style={{
                    fontSize: 12, color: '#cd5c5c', background: 'none',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  Eliminar
                </button>
              )}
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                disabled={disabled || isUploading}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                style={{
                  width: '100%',
                  padding: '20px 16px',
                  textAlign: 'center',
                  border: '1.5px dashed var(--nc-border)',
                  borderRadius: 6,
                  fontSize: 13,
                  color: isUploading ? 'var(--nc-stone)' : 'var(--nc-forest)',
                  fontWeight: 400,
                  background: 'white',
                  cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
                }}
              >
                {isUploading ? 'Subiendo...' : 'Haz clic para subir un archivo'}
              </button>
              {uploadError && (
                <div style={{
                  marginTop: 8,
                  padding: '6px 10px',
                  background: 'rgba(205,92,92,0.1)',
                  border: '1px solid rgba(205,92,92,0.2)',
                  borderRadius: 4,
                  fontSize: 12,
                  color: '#cd5c5c',
                }}>
                  {uploadError}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
