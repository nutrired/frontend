'use client';
// frontend/app/dashboard/my-exercises/[id]/edit/page.tsx

import { use, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useExerciseTemplate, updateExerciseTemplate, uploadTemplatePhoto, deleteTemplatePhoto, setPrimaryTemplatePhoto } from '@/lib/exercise-templates';
import type { ExerciseCategory } from '@/lib/types';

const CATEGORY_OPTIONS: { value: ExerciseCategory; label: string }[] = [
  { value: 'strength', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibilidad' },
  { value: 'balance', label: 'Equilibrio' },
];

export default function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const locale = useLocale();
  const router = useRouter();
  const { template, isLoading, mutate } = useExerciseTemplate(resolvedParams.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('strength');
  const [muscleGroups, setMuscleGroups] = useState('');
  const [equipment, setEquipment] = useState('');
  const [instructions, setInstructions] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form when template loads
  useState(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setCategory(template.category);
      setMuscleGroups(template.muscle_groups);
      setEquipment(template.equipment);
      setInstructions(template.instructions);
      setDemoVideoUrl(template.demo_video_url || '');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template || !name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await updateExerciseTemplate(template.id, {
        name: name.trim(),
        description: description.trim(),
        category,
        muscle_groups: muscleGroups.trim(),
        equipment: equipment.trim(),
        instructions: instructions.trim(),
        demo_video_url: demoVideoUrl.trim() || null,
      });
      router.push(`/dashboard/my-exercises/${template.id}`);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar ejercicio');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!template || !files || files.length === 0) return;

    const currentCount = template.photos.length;
    const remainingSlots = 10 - currentCount;

    if (remainingSlots <= 0) {
      setError('Has alcanzado el límite de 10 fotos por ejercicio.');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);
    setError('');

    try {
      for (const file of filesToUpload) {
        await uploadTemplatePhoto(template.id, file);
      }
      await mutate();
    } catch (err: any) {
      setError(err?.message ?? 'Error al subir las fotos.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!template || !confirm('¿Eliminar esta foto?')) return;

    try {
      await deleteTemplatePhoto(template.id, photoId);
      await mutate();
    } catch (err: any) {
      setError(err?.message ?? 'Error al eliminar la foto.');
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    if (!template) return;

    try {
      await setPrimaryTemplatePhoto(template.id, photoId);
      await mutate();
    } catch (err: any) {
      setError(err?.message ?? 'Error al establecer foto principal.');
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
        <div className="dash-topbar-title">Editar ejercicio</div>
        <div className="dash-topbar-right">
          <Link href={`/dashboard/my-exercises/${template.id}`} className="dash-btn-plain">
            Cancelar
          </Link>
        </div>
      </div>

      <div className="dash-content">
        <form onSubmit={handleSubmit} style={{ maxWidth: 820 }}>
          {error && (
            <div
              style={{
                background: 'rgba(196,98,45,0.08)',
                color: 'var(--nc-terra)',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}

          <div className="dash-section">
            <div className="dash-section-head">
              <div className="dash-section-title">Información básica</div>
            </div>
            <div className="dash-section-body">
              <div className="dash-row single">
                <div className="dash-field">
                  <label className="dash-label">
                    Nombre <span style={{ color: 'var(--nc-terra)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="dash-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={200}
                    required
                  />
                </div>
              </div>

              <div className="dash-row single">
                <div className="dash-field">
                  <label className="dash-label">Descripción</label>
                  <textarea
                    className="dash-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={2000}
                    rows={3}
                    placeholder="Breve descripción del ejercicio..."
                  />
                </div>
              </div>

              <div className="dash-row">
                <div className="dash-field">
                  <label className="dash-label">
                    Categoría <span style={{ color: 'var(--nc-terra)' }}>*</span>
                  </label>
                  <select
                    className="dash-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
                    required
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="dash-row">
                <div className="dash-field">
                  <label className="dash-label">Grupos musculares</label>
                  <input
                    type="text"
                    className="dash-input"
                    value={muscleGroups}
                    onChange={(e) => setMuscleGroups(e.target.value)}
                    maxLength={500}
                    placeholder="ej. Pectorales, Tríceps, Core"
                  />
                </div>
                <div className="dash-field">
                  <label className="dash-label">Equipamiento</label>
                  <input
                    type="text"
                    className="dash-input"
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    maxLength={500}
                    placeholder="ej. Barra, Banco plano"
                  />
                </div>
              </div>

              <div className="dash-row single">
                <div className="dash-field">
                  <label className="dash-label">Instrucciones</label>
                  <textarea
                    className="dash-textarea"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    maxLength={5000}
                    rows={6}
                    placeholder="Instrucciones paso a paso..."
                  />
                </div>
              </div>

              <div className="dash-row single">
                <div className="dash-field">
                  <label className="dash-label">URL de video de demostración</label>
                  <input
                    type="url"
                    className="dash-input"
                    value={demoVideoUrl}
                    onChange={(e) => setDemoVideoUrl(e.target.value)}
                    maxLength={500}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Photo management section */}
          <div className="dash-section">
            <div className="dash-section-head">
              <div className="dash-section-title">Fotos ({sortedPhotos.length}/10)</div>
            </div>
            <div className="dash-section-body">
              {uploading && (
                <div style={{ marginBottom: 16, color: 'var(--nc-stone)', fontSize: 13 }}>
                  Subiendo fotos...
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handlePhotoUpload(e.target.files)}
                style={{ display: 'none' }}
              />

              {sortedPhotos.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{
                    width: '100%',
                    padding: 40,
                    border: '2px dashed var(--nc-border)',
                    borderRadius: 8,
                    background: 'transparent',
                    color: 'var(--nc-stone)',
                    fontSize: 14,
                    cursor: 'pointer',
                    marginBottom: 20,
                  }}
                >
                  + Subir fotos (máx. 10)
                </button>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {sortedPhotos.map((photo) => (
                  <div key={photo.id} style={{ position: 'relative' }}>
                    <img
                      src={photo.photo_url}
                      alt=""
                      style={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: photo.is_primary ? '3px solid var(--nc-forest)' : '1px solid var(--nc-border)',
                      }}
                    />
                    {photo.is_primary && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: 'var(--nc-forest)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                      >
                        Principal
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      {!photo.is_primary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(photo.id)}
                          className="dash-btn-plain"
                          style={{ flex: 1, fontSize: 12, padding: '6px 10px' }}
                        >
                          Hacer principal
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="dash-btn-plain"
                        style={{ flex: 1, fontSize: 12, padding: '6px 10px', color: 'var(--nc-terra)' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="submit" disabled={submitting} className="dash-btn-publish" style={{ flex: 1 }}>
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <Link href={`/dashboard/my-exercises/${template.id}`} className="dash-btn-plain" style={{ flex: 1, textAlign: 'center', lineHeight: '40px' }}>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
