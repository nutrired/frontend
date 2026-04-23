'use client';
// frontend/app/dashboard/my-exercises/[id]/page.tsx

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useExerciseTemplate, deleteExerciseTemplate } from '@/lib/exercise-templates';
import type { ExerciseCategory } from '@/lib/types';

const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  strength: '#f0fdf4',
  cardio: '#fff7ed',
  flexibility: '#eff6ff',
  balance: '#faf5ff',
};

const CATEGORY_BADGE_COLORS: Record<ExerciseCategory, { bg: string; text: string }> = {
  strength: { bg: '#dcfce7', text: '#166534' },
  cardio: { bg: '#ffedd5', text: '#9a3412' },
  flexibility: { bg: '#dbeafe', text: '#1e40af' },
  balance: { bg: '#f3e8ff', text: '#6b21a8' },
};

export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const t = useTranslations('dashboard.exercises');
  const locale = useLocale();
  const router = useRouter();
  const { template, isLoading } = useExerciseTemplate(resolvedParams.id);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
    strength: t('category_strength'),
    cardio: t('category_cardio'),
    flexibility: t('category_flexibility'),
    balance: t('category_balance'),
  };

  const handleDelete = async () => {
    if (!template) return;
    setDeleting(true);
    try {
      await deleteExerciseTemplate(template.id);
      router.push('/dashboard/my-exercises');
    } catch (err: any) {
      toastError(err?.message ?? 'Error al eliminar el ejercicio');
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="dash-topbar">
          <div className="dash-topbar-title">Cargando...</div>
        </div>
        <div className="dash-content">
          <div style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>Cargando ejercicio...</div>
        </div>
      </>
    );
  }

  if (!template) {
    return (
      <>
        <div className="dash-topbar">
          <div className="dash-topbar-title">Ejercicio no encontrado</div>
        </div>
        <div className="dash-content">
          <div
            style={{
              background: 'rgba(196,98,45,0.08)',
              color: 'var(--nc-terra)',
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            El ejercicio solicitado no existe.
          </div>
          <Link
            href={`/${locale}/dashboard/my-exercises`}
            style={{
              marginTop: 16,
              display: 'inline-block',
              color: 'var(--nc-forest)',
              textDecoration: 'underline',
            }}
          >
            Volver a Mis ejercicios
          </Link>
        </div>
      </>
    );
  }

  const sortedPhotos = [...template.photos].sort((a, b) => a.display_order - b.display_order);

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">{template.name}</div>
        <div className="dash-topbar-right">
          <Link href={`/dashboard/my-exercises/${template.id}/edit`} className="dash-btn-preview">
            Editar
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="dash-btn-preview"
            style={{ color: 'var(--nc-terra)', borderColor: 'var(--nc-terra)' }}
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="dash-content" style={{ maxWidth: 900 }}>
        {/* Photo carousel or placeholder */}
        {sortedPhotos.length > 0 ? (
          <div
            style={{
              marginBottom: 32,
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid var(--nc-border)',
            }}
          >
            <div
              style={{
                height: 400,
                background: `url(${sortedPhotos[currentPhotoIndex].photo_url}) center/cover`,
                position: 'relative',
              }}
            >
              {sortedPhotos.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPhotoIndex((currentPhotoIndex - 1 + sortedPhotos.length) % sortedPhotos.length)}
                    style={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      cursor: 'pointer',
                      fontSize: 20,
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentPhotoIndex((currentPhotoIndex + 1) % sortedPhotos.length)}
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      cursor: 'pointer',
                      fontSize: 20,
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            {sortedPhotos.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 12, gap: 8, background: 'white' }}>
                {sortedPhotos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      border: 'none',
                      background: idx === currentPhotoIndex ? 'var(--nc-forest)' : 'var(--nc-stone-light)',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              marginBottom: 32,
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid var(--nc-border)',
              background: CATEGORY_COLORS[template.category],
              height: 400,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="40" r="24" fill="rgba(139,115,85,0.15)" />
              <rect x="52" y="64" width="16" height="32" rx="2" fill="rgba(139,115,85,0.15)" />
              <rect x="40" y="72" width="12" height="4" rx="2" fill="rgba(139,115,85,0.15)" />
              <rect x="68" y="72" width="12" height="4" rx="2" fill="rgba(139,115,85,0.15)" />
              <circle cx="54" cy="36" r="3" fill="rgba(139,115,85,0.3)" />
              <circle cx="66" cy="36" r="3" fill="rgba(139,115,85,0.3)" />
              <path d="M 52 46 Q 60 52 68 46" stroke="rgba(139,115,85,0.3)" strokeWidth="2" fill="none" />
            </svg>
            <div style={{ color: 'rgba(139,115,85,0.5)', fontSize: 14, fontWeight: 300 }}>
              Sin foto. Añade una desde Editar.
            </div>
          </div>
        )}

        {/* Category badge */}
        <div style={{ marginBottom: 24 }}>
          <span
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              background: CATEGORY_BADGE_COLORS[template.category].bg,
              color: CATEGORY_BADGE_COLORS[template.category].text,
            }}
          >
            {CATEGORY_LABELS[template.category]}
          </span>
        </div>

        {/* Description */}
        {template.description && (
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--nc-ink)' }}>{template.description}</p>
          </div>
        )}

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          {template.muscle_groups && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--nc-stone)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Grupos musculares
              </div>
              <div style={{ fontSize: 14, color: 'var(--nc-ink)' }}>{template.muscle_groups}</div>
            </div>
          )}
          {template.equipment && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--nc-stone)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Equipamiento
              </div>
              <div style={{ fontSize: 14, color: 'var(--nc-ink)' }}>{template.equipment}</div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {template.instructions && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--nc-stone)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Instrucciones
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--nc-ink)', whiteSpace: 'pre-line' }}>
              {template.instructions}
            </div>
          </div>
        )}

        {/* Video */}
        {template.demo_video_url && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--nc-stone)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Video de demostración
            </div>
            <a
              href={template.demo_video_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--nc-forest)',
                textDecoration: 'underline',
                fontSize: 14,
              }}
            >
              Ver video →
            </a>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 32,
              maxWidth: 440,
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--nc-ink)' }}>
              ¿Eliminar ejercicio?
            </div>
            <div style={{ fontSize: 14, color: 'var(--nc-stone)', marginBottom: 24, lineHeight: 1.6 }}>
              Esta acción no se puede deshacer. El ejercicio se eliminará permanentemente.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowDeleteConfirm(false)} className="dash-btn-plain" style={{ flex: 1 }}>
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="dash-btn-publish"
                style={{ flex: 1, background: 'var(--nc-terra)', borderColor: 'var(--nc-terra)' }}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
