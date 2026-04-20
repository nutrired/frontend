'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSurveyTemplates, archiveSurveyTemplate, unarchiveSurveyTemplate } from '@/lib/survey';
import { useMyProfile } from '@/lib/profile';
import { api } from '@/lib/api';
import type { SurveyTemplateListItem } from '@/lib/types';

function TemplateBadge({ active }: { active: boolean }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
      background: active ? 'rgba(74,124,89,0.1)' : 'rgba(0,0,0,0.06)',
      color: active ? '#4a7c59' : 'var(--nc-stone)',
    }}>
      {active ? 'Activa' : 'Archivada'}
    </span>
  );
}

function TemplateRow({ template, onToggleArchive }: { template: SurveyTemplateListItem; onToggleArchive: () => void }) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleArchive = async () => {
    setIsToggling(true);
    try {
      if (template.is_active) {
        await archiveSurveyTemplate(template.id);
      } else {
        await unarchiveSurveyTemplate(template.id);
      }
      onToggleArchive();
    } catch (err) {
      alert('Error al cambiar el estado. Intenta de nuevo.');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 16px', background: 'white',
      border: '1px solid var(--nc-border)', borderRadius: 8,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--nc-ink)' }}>
            {template.title}
          </div>
          <TemplateBadge active={template.is_active} />
        </div>
        {template.description && (
          <div style={{
            fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300,
            lineHeight: 1.4, maxWidth: 500,
            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {template.description}
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--nc-stone)', marginTop: 4, fontWeight: 300 }}>
          {template.question_count} {template.question_count === 1 ? 'pregunta' : 'preguntas'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={handleToggleArchive}
          disabled={isToggling}
          style={{
            fontSize: 12, fontWeight: 500, padding: '6px 12px',
            border: '1px solid var(--nc-border)', borderRadius: 6,
            background: 'white', color: 'var(--nc-stone)',
            cursor: isToggling ? 'not-allowed' : 'pointer',
            opacity: isToggling ? 0.5 : 1,
          }}
        >
          {isToggling ? '...' : (template.is_active ? 'Archivar' : 'Desarchivar')}
        </button>
        <Link
          href={`/dashboard/surveys/${template.id}`}
          style={{ fontSize: 12, color: 'var(--nc-terra)', textDecoration: 'none', fontWeight: 500 }}
        >
          Editar
        </Link>
      </div>
    </div>
  );
}

export default function SurveyTemplatesPage() {
  const [showArchived, setShowArchived] = useState(false);
  const { templates, isLoading, error, mutate } = useSurveyTemplates(showArchived ? undefined : true);
  const { profile, mutate: mutateProfile } = useMyProfile();
  const [isSavingDefault, setIsSavingDefault] = useState(false);

  const filteredTemplates = showArchived
    ? templates
    : templates.filter((t) => t.is_active);

  const handleSetDefaultTemplate = async (templateId: string | null) => {
    setIsSavingDefault(true);
    try {
      await api.put('/profile', {
        ...profile,
        default_survey_template_id: templateId,
      });
      mutateProfile();
    } catch (err) {
      alert('Error al guardar. Intenta de nuevo.');
    } finally {
      setIsSavingDefault(false);
    }
  };

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">Encuestas de intake</div>
      </div>
      <div className="dash-content">
        <div className="dash-section">
          <div className="dash-section-head">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="dash-section-title">Plantillas de encuesta</div>
                <div className="dash-section-sub">
                  Crea plantillas reutilizables para recopilar informacion de tus nuevos clientes
                </div>
              </div>
              <Link
                href="/dashboard/surveys/new"
                style={{
                  display: 'inline-block', fontSize: 13, fontWeight: 500,
                  color: 'white', background: 'var(--nc-forest)',
                  borderRadius: 6, padding: '8px 16px', textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                + Crear nueva
              </Link>
            </div>
          </div>
          <div className="dash-section-body">
            {/* Auto-assignment configuration */}
            {profile && (
              <div style={{
                background: 'rgba(74,124,89,0.05)', border: '1px solid rgba(74,124,89,0.2)',
                borderRadius: 8, padding: 16, marginBottom: 20,
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--nc-ink)', marginBottom: 8 }}>
                  ⚙️ Asignación automática
                </div>
                <div style={{ fontSize: 12, color: 'var(--nc-stone)', marginBottom: 12, lineHeight: 1.5 }}>
                  Selecciona una plantilla para asignar automáticamente cuando un nuevo cliente te contrata.
                  Si no seleccionas ninguna, deberás asignar encuestas manualmente desde la página del cliente.
                </div>
                <select
                  value={profile.default_survey_template_id || ''}
                  onChange={(e) => handleSetDefaultTemplate(e.target.value || null)}
                  disabled={isSavingDefault}
                  style={{
                    fontSize: 13, padding: '8px 12px', borderRadius: 6,
                    border: '1px solid var(--nc-border)', background: 'white',
                    width: '100%', maxWidth: 400,
                    cursor: isSavingDefault ? 'not-allowed' : 'pointer',
                  }}
                >
                  <option value="">Sin asignación automática (manual)</option>
                  {templates.filter(t => t.is_active).map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Active/archived toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setShowArchived(false)}
                style={{
                  fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 6,
                  border: '1px solid var(--nc-border)',
                  background: !showArchived ? 'var(--nc-forest)' : 'white',
                  color: !showArchived ? 'white' : 'var(--nc-stone)',
                  cursor: 'pointer',
                }}
              >
                Activas
              </button>
              <button
                onClick={() => setShowArchived(true)}
                style={{
                  fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 6,
                  border: '1px solid var(--nc-border)',
                  background: showArchived ? 'var(--nc-forest)' : 'white',
                  color: showArchived ? 'white' : 'var(--nc-stone)',
                  cursor: 'pointer',
                }}
              >
                Todas (incl. archivadas)
              </button>
            </div>

            {isLoading && (
              <div style={{ color: 'var(--nc-stone)', fontWeight: 300, fontSize: 13 }}>Cargando...</div>
            )}

            {error && (
              <div style={{
                background: 'rgba(205,92,92,0.1)', border: '1px solid rgba(205,92,92,0.2)',
                borderRadius: 6, padding: 12, fontSize: 13, color: '#cd5c5c',
              }}>
                Error al cargar las plantillas. Intenta de nuevo.
              </div>
            )}

            {!isLoading && !error && filteredTemplates.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>
                {showArchived
                  ? 'No tienes plantillas de encuesta.'
                  : 'No tienes plantillas activas. Crea una nueva para empezar.'}
              </div>
            )}

            {!isLoading && filteredTemplates.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredTemplates.map((t) => (
                  <TemplateRow key={t.id} template={t} onToggleArchive={mutate} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
