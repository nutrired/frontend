'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  useExercisePlan,
  useNutritionPlans,
  updateExercisePlan,
  activateExercisePlan,
  deleteExercisePlan,
  duplicatePlans,
} from '@/lib/plans';
import type {
  ExercisePayload,
  WorkoutBlockPayload,
  ExerciseDayPayload,
  CardioActivityPayload,
  ExercisePlanPayload,
} from '@/lib/plans';
import type { PlanStatus } from '@/lib/types';

function emptyExercise(displayOrder: number): ExercisePayload {
  return { name: '', sets: null, reps: null, rest_seconds: null, notes: '', display_order: displayOrder };
}

function emptyBlock(displayOrder: number): WorkoutBlockPayload {
  return { name: '', display_order: displayOrder, exercises: [emptyExercise(0)] };
}

function emptyActivity(displayOrder: number): CardioActivityPayload {
  return { name: '', duration_minutes: null, distance_km: null, notes: '', display_order: displayOrder };
}

function emptyDay(dayNumber: number): ExerciseDayPayload {
  return { day_number: dayNumber, label: '', notes: '', day_type: 'strength', blocks: [], activities: [] };
}

function StatusPill({ status, t }: { status: PlanStatus; t: ReturnType<typeof useTranslations> }) {
  const labels: Record<PlanStatus, string> = {
    draft:    t('plan_status_draft'),
    active:   t('plan_status_active'),
    archived: t('plan_status_archived'),
  };
  const cfg: Record<PlanStatus, { bg: string; color: string }> = {
    draft:    { bg: 'rgba(139,115,85,0.1)',  color: 'var(--nc-stone)' },
    active:   { bg: 'rgba(74,124,89,0.1)',   color: '#4a7c59' },
    archived: { bg: 'rgba(0,0,0,0.06)',       color: 'var(--nc-stone)' },
  };
  const s = cfg[status];
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: s.bg, color: s.color }}>
      {labels[status]}
    </span>
  );
}

export default function EditExercisePlanPage() {
  const t = useTranslations('dashboard.exercise_plans');
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ clientId: string; id: string }>();
  const { clientId, id } = params;

  const DAY_LABELS = [t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday'), t('sunday')];

  const { plan, isLoading, mutate } = useExercisePlan(id);
  const { plans: nutritionPlans } = useNutritionPlans(plan?.client_id);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [days, setDays] = useState<ExerciseDayPayload[]>([]);
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [error, setError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (!plan) return;
    setTitle(plan.title);
    setNotes(plan.notes);
    const merged: ExerciseDayPayload[] = Array.from({ length: 7 }, (_, i) => {
      const found = plan.days.find((d) => d.day_number === i + 1);
      if (!found) return emptyDay(i + 1);
      return {
        day_number: found.day_number,
        label: found.label,
        notes: found.notes,
        day_type: found.day_type,
        blocks: found.blocks.map((b) => ({
          name: b.name,
          display_order: b.display_order,
          exercises: b.exercises.map((e) => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            rest_seconds: e.rest_seconds,
            notes: e.notes,
            display_order: e.display_order,
          })),
        })),
        activities: found.activities.map((a) => ({
          name: a.name,
          duration_minutes: a.duration_minutes,
          distance_km: a.distance_km,
          notes: a.notes,
          display_order: a.display_order,
        })),
      };
    });
    setDays(merged);
  }, [plan]);

  function updateDay(index: number, patch: Partial<ExerciseDayPayload>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  // ─── Strength helpers ───────────────────────────────────────────────────────

  function addBlock(dayIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, blocks: [...d.blocks, emptyBlock(d.blocks.length)] } : d,
      ),
    );
  }

  function removeBlock(dayIndex: number, blockIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, blocks: d.blocks.filter((_, bi) => bi !== blockIndex) } : d,
      ),
    );
  }

  function updateBlock(dayIndex: number, blockIndex: number, patch: Partial<WorkoutBlockPayload>) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? { ...d, blocks: d.blocks.map((b, bi) => (bi === blockIndex ? { ...b, ...patch } : b)) }
          : d,
      ),
    );
  }

  function addExercise(dayIndex: number, blockIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              blocks: d.blocks.map((b, bi) =>
                bi === blockIndex
                  ? { ...b, exercises: [...b.exercises, emptyExercise(b.exercises.length)] }
                  : b,
              ),
            }
          : d,
      ),
    );
  }

  function removeExercise(dayIndex: number, blockIndex: number, exerciseIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              blocks: d.blocks.map((b, bi) =>
                bi === blockIndex
                  ? { ...b, exercises: b.exercises.filter((_, ei) => ei !== exerciseIndex) }
                  : b,
              ),
            }
          : d,
      ),
    );
  }

  function updateExercise(
    dayIndex: number,
    blockIndex: number,
    exerciseIndex: number,
    patch: Partial<ExercisePayload>,
  ) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              blocks: d.blocks.map((b, bi) =>
                bi === blockIndex
                  ? {
                      ...b,
                      exercises: b.exercises.map((e, ei) =>
                        ei === exerciseIndex ? { ...e, ...patch } : e,
                      ),
                    }
                  : b,
              ),
            }
          : d,
      ),
    );
  }

  // ─── Cardio helpers ─────────────────────────────────────────────────────────

  function addActivity(dayIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, activities: [...d.activities, emptyActivity(d.activities.length)] } : d,
      ),
    );
  }

  function removeActivity(dayIndex: number, actIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, activities: d.activities.filter((_, ai) => ai !== actIndex) } : d,
      ),
    );
  }

  function updateActivity(dayIndex: number, actIndex: number, patch: Partial<CardioActivityPayload>) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? { ...d, activities: d.activities.map((a, ai) => (ai === actIndex ? { ...a, ...patch } : a)) }
          : d,
      ),
    );
  }

  // ─── Save / Activate / Delete ───────────────────────────────────────────────

  function buildPayload(): ExercisePlanPayload {
    return {
      client_id: plan?.client_id ?? '',
      title: title.trim(),
      notes,
      days: days.map((d) => ({
        ...d,
        blocks: d.blocks.map((b, bi) => ({
          ...b,
          display_order: bi,
          exercises: b.exercises.map((e, ei) => ({ ...e, display_order: ei })),
        })),
        activities: d.activities.map((a, ai) => ({ ...a, display_order: ai })),
      })),
    };
  }

  async function handleSave() {
    if (!title.trim()) { setError('El título es obligatorio.'); return; }
    setSaving(true);
    setError('');
    setSaveMsg('');
    try {
      await updateExercisePlan(id, buildPayload());
      await mutate();
      setSaveMsg('Guardado correctamente.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate() {
    if (!confirm('Activar este plan archivará el plan activo anterior del cliente (si existe). ¿Continuar?')) return;
    setActivating(true);
    setError('');
    try {
      await activateExercisePlan(id);
      await mutate();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al activar el plan.');
    } finally {
      setActivating(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Eliminar este borrador. Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    setError('');
    try {
      await deleteExercisePlan(id);
      router.push(`/dashboard/clients/${clientId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el plan.');
    } finally {
      setDeleting(false);
    }
  }

  async function handleDuplicate() {
    if (!plan) return;
    const activeNutritionPlan = nutritionPlans.find((p) => p.status === 'active');
    if (!confirm(`Duplicar este plan de ejercicios${activeNutritionPlan ? ' y el plan nutricional activo' : ''} como borrador?`)) return;
    setDuplicating(true);
    setError('');
    try {
      const result = await duplicatePlans(
        plan.client_id,
        activeNutritionPlan?.id,
        id,
      );
      if (result.exercise_plan) {
        router.push(`/dashboard/clients/${plan.client_id}/plans/exercise/${result.exercise_plan.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al duplicar el plan.');
    } finally {
      setDuplicating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="dash-content" style={{ padding: 40, color: 'var(--nc-stone)', fontWeight: 300 }}>
        Cargando plan…
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="dash-content" style={{ padding: 40 }}>
        <p style={{ color: 'var(--nc-stone)' }}>Plan no encontrado.</p>
        <Link href={`/dashboard/clients/${clientId}`} style={{ color: 'var(--nc-terra)', fontSize: 13 }}>
          ← Volver al cliente
        </Link>
      </div>
    );
  }

  const isDraft = plan.status === 'draft';

  return (
    <>
      <div className="dash-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href={`/dashboard/clients/${clientId}`}
            style={{ fontSize: 13, color: 'var(--nc-stone)', textDecoration: 'none' }}
          >
            ← Cliente
          </Link>
          <div className="dash-topbar-title">{plan.title}</div>
          <StatusPill status={plan.status} t={t} />
        </div>
        {isDraft && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              style={{
                height: 34, padding: '0 16px',
                background: 'rgba(139,115,85,0.1)', border: '1px solid rgba(139,115,85,0.3)',
                borderRadius: 6, color: 'var(--nc-stone)', fontFamily: 'var(--font-body)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              {duplicating ? 'Duplicando…' : 'Duplicar plan'}
            </button>
            <button
              onClick={handleActivate}
              disabled={activating}
              style={{
                height: 34, padding: '0 16px',
                background: 'rgba(74,124,89,0.1)', border: '1px solid rgba(74,124,89,0.3)',
                borderRadius: 6, color: '#4a7c59', fontFamily: 'var(--font-body)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              {activating ? 'Activando…' : 'Activar plan'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                height: 34, padding: '0 16px',
                background: 'transparent', border: '1px solid rgba(185,74,58,0.3)',
                borderRadius: 6, color: '#b94a3a', fontFamily: 'var(--font-body)',
                fontSize: 13, cursor: 'pointer',
              }}
            >
              {deleting ? 'Eliminando…' : 'Eliminar borrador'}
            </button>
          </div>
        )}
      </div>
      <div className="dash-content">
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">Información del plan</div>
          </div>
          <div className="dash-section-body">
            <div className="dash-row">
              <div className="dash-field">
                <label className="dash-label">Título</label>
                <input
                  className="dash-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!isDraft}
                />
              </div>
            </div>
            <div className="dash-row single">
              <div className="dash-field">
                <label className="dash-label">Notas generales</label>
                <textarea
                  className="dash-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!isDraft}
                />
              </div>
            </div>
          </div>
        </div>

        {days.map((day, dayIndex) => (
          <div key={day.day_number} style={{
            border: '1px solid var(--nc-border)', borderRadius: 8, marginBottom: 8, overflow: 'hidden',
          }}>
            {/* Accordion header */}
            <button
              onClick={() => setOpenDay(openDay === day.day_number ? null : day.day_number)}
              style={{
                width: '100%', padding: '14px 20px',
                background: openDay === day.day_number ? 'var(--nc-forest-pale)' : 'white',
                border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', fontFamily: 'var(--font-body)',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--nc-forest)' }}>
                Día {day.day_number} — {DAY_LABELS[dayIndex]}
              </span>
              <span style={{ fontSize: 12, color: 'var(--nc-stone)' }}>
                {day.day_type === 'rest'
                  ? 'Descanso'
                  : day.day_type === 'cardio'
                  ? `${day.activities.length} actividad${day.activities.length !== 1 ? 'es' : ''}`
                  : `${day.blocks.length} bloque${day.blocks.length !== 1 ? 's' : ''}`}
                {openDay === day.day_number ? ' ▲' : ' ▼'}
              </span>
            </button>

            {openDay === day.day_number && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--nc-border)', background: 'white' }}>
                {/* Day metadata row */}
                <div className="dash-row" style={{ marginBottom: 16 }}>
                  <div className="dash-field" style={{ flex: '0 0 180px' }}>
                    <label className="dash-label">Tipo de día</label>
                    <select
                      className="dash-input"
                      value={day.day_type}
                      onChange={(e) =>
                        updateDay(dayIndex, {
                          day_type: e.target.value as ExerciseDayPayload['day_type'],
                          blocks: [],
                          activities: [],
                        })
                      }
                      disabled={!isDraft}
                    >
                      <option value="strength">Fuerza / musculación</option>
                      <option value="cardio">Cardio / actividad</option>
                      <option value="rest">Descanso</option>
                    </select>
                  </div>
                  <div className="dash-field">
                    <label className="dash-label">Etiqueta del día</label>
                    <input
                      className="dash-input"
                      value={day.label}
                      onChange={(e) => updateDay(dayIndex, { label: e.target.value })}
                      disabled={!isDraft}
                      placeholder="ej: Tren superior"
                    />
                  </div>
                  <div className="dash-field">
                    <label className="dash-label">Notas del día</label>
                    <input
                      className="dash-input"
                      value={day.notes}
                      onChange={(e) => updateDay(dayIndex, { notes: e.target.value })}
                      disabled={!isDraft}
                      placeholder="ej: Descanso entre series: 90 s"
                    />
                  </div>
                </div>

                {/* ─── Strength: blocks + exercises ─────────────────────── */}
                {day.day_type === 'strength' && (
                  <>
                    {day.blocks.map((block, blockIndex) => (
                  <div key={blockIndex} style={{
                    border: '1px solid var(--nc-border)', borderRadius: 6,
                    padding: '12px 16px', marginBottom: 8, background: 'var(--nc-cream)',
                  }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                      <div className="dash-field" style={{ flex: 1 }}>
                        <label className="dash-label">Nombre del bloque</label>
                        <input
                          className="dash-input"
                          value={block.name}
                          onChange={(e) => updateBlock(dayIndex, blockIndex, { name: e.target.value })}
                          disabled={!isDraft}
                          placeholder="ej: Calentamiento / Circuito A"
                        />
                      </div>
                      {isDraft && (
                        <button
                          onClick={() => removeBlock(dayIndex, blockIndex)}
                          style={{
                            marginTop: 20, width: 30, height: 30, border: '1px solid var(--nc-border)',
                            borderRadius: 4, background: 'transparent', cursor: 'pointer',
                            color: 'var(--nc-stone)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div style={{ marginLeft: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--nc-stone)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Ejercicios
                      </div>
                      {block.exercises.map((ex, exIndex) => (
                        <div key={exIndex} style={{
                          border: '1px solid rgba(139,115,85,0.15)', borderRadius: 4,
                          padding: '8px 10px', marginBottom: 6, background: 'white',
                        }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div className="dash-field" style={{ flex: '2 1 160px' }}>
                              <label className="dash-label">Ejercicio</label>
                              <input
                                className="dash-input"
                                value={ex.name}
                                onChange={(e) => updateExercise(dayIndex, blockIndex, exIndex, { name: e.target.value })}
                                disabled={!isDraft}
                                placeholder="ej: Press de banca"
                              />
                            </div>
                            {[
                              { field: 'sets' as const,         label: 'Series'   },
                              { field: 'reps' as const,         label: 'Reps'     },
                              { field: 'rest_seconds' as const,  label: 'Desc (s)' },
                            ].map(({ field, label }) => (
                              <div key={field} className="dash-field" style={{ flex: '0 0 80px' }}>
                                <label className="dash-label">{label}</label>
                                <input
                                  className="dash-input"
                                  type="number"
                                  min="0"
                                  value={ex[field] ?? ''}
                                  onChange={(e) =>
                                    updateExercise(dayIndex, blockIndex, exIndex, {
                                      [field]: e.target.value === '' ? null : Number(e.target.value),
                                    })
                                  }
                                  disabled={!isDraft}
                                  placeholder="—"
                                />
                              </div>
                            ))}
                            <div className="dash-field" style={{ flex: '2 1 120px' }}>
                              <label className="dash-label">Notas</label>
                              <input
                                className="dash-input"
                                value={ex.notes}
                                onChange={(e) => updateExercise(dayIndex, blockIndex, exIndex, { notes: e.target.value })}
                                disabled={!isDraft}
                                placeholder="ej: Agarre prono"
                              />
                            </div>
                            {isDraft && (
                              <button
                                onClick={() => removeExercise(dayIndex, blockIndex, exIndex)}
                                style={{
                                  marginTop: 20, width: 26, height: 26, border: '1px solid var(--nc-border)',
                                  borderRadius: 4, background: 'transparent', cursor: 'pointer',
                                  color: 'var(--nc-stone)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {isDraft && (
                        <button
                          onClick={() => addExercise(dayIndex, blockIndex)}
                          className="dash-btn-add-pkg"
                          style={{ marginTop: 4, height: 30, fontSize: 12 }}
                        >
                          + Añadir ejercicio
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isDraft && (
                  <button onClick={() => addBlock(dayIndex)} className="dash-btn-add-pkg" style={{ marginTop: 4 }}>
                    + Añadir bloque
                  </button>
                )}
              </>
            )}

            {/* ─── Cardio: activity list ─────────────────────────────── */}
            {day.day_type === 'cardio' && (
              <>
                {day.activities.map((act, actIndex) => (
                  <div key={actIndex} style={{
                    border: '1px solid rgba(139,115,85,0.15)', borderRadius: 4,
                    padding: '8px 10px', marginBottom: 6, background: 'var(--nc-cream)',
                  }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div className="dash-field" style={{ flex: '2 1 160px' }}>
                        <label className="dash-label">Actividad</label>
                        <input
                          className="dash-input"
                          value={act.name}
                          onChange={(e) => updateActivity(dayIndex, actIndex, { name: e.target.value })}
                          disabled={!isDraft}
                          placeholder="ej: Caminar, Bicicleta, Natación"
                        />
                      </div>
                      <div className="dash-field" style={{ flex: '0 0 110px' }}>
                        <label className="dash-label">Duración (min)</label>
                        <input
                          className="dash-input"
                          type="number"
                          min="0"
                          value={act.duration_minutes ?? ''}
                          onChange={(e) =>
                            updateActivity(dayIndex, actIndex, {
                              duration_minutes: e.target.value === '' ? null : Number(e.target.value),
                            })
                          }
                          disabled={!isDraft}
                          placeholder="—"
                        />
                      </div>
                      <div className="dash-field" style={{ flex: '0 0 110px' }}>
                        <label className="dash-label">Distancia (km)</label>
                        <input
                          className="dash-input"
                          type="number"
                          min="0"
                          step="0.1"
                          value={act.distance_km ?? ''}
                          onChange={(e) =>
                            updateActivity(dayIndex, actIndex, {
                              distance_km: e.target.value === '' ? null : Number(e.target.value),
                            })
                          }
                          disabled={!isDraft}
                          placeholder="—"
                        />
                      </div>
                      <div className="dash-field" style={{ flex: '2 1 120px' }}>
                        <label className="dash-label">Notas</label>
                        <input
                          className="dash-input"
                          value={act.notes}
                          onChange={(e) => updateActivity(dayIndex, actIndex, { notes: e.target.value })}
                          disabled={!isDraft}
                          placeholder="ej: Ritmo moderado, zona 2"
                        />
                      </div>
                      {isDraft && (
                        <button
                          onClick={() => removeActivity(dayIndex, actIndex)}
                          style={{
                            marginTop: 20, width: 26, height: 26, border: '1px solid var(--nc-border)',
                            borderRadius: 4, background: 'transparent', cursor: 'pointer',
                            color: 'var(--nc-stone)', fontSize: 14, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                          title="Eliminar actividad"
                        >×</button>
                      )}
                    </div>
                  </div>
                ))}
                {isDraft && (
                  <button onClick={() => addActivity(dayIndex)} className="dash-btn-add-pkg" style={{ marginTop: 4 }}>
                    + Añadir actividad
                  </button>
                )}
              </>
            )}

            {/* ─── Rest: informational note ──────────────────────────── */}
            {day.day_type === 'rest' && (
              <p style={{ fontSize: 13, color: 'var(--nc-stone)', fontStyle: 'italic', margin: 0 }}>
                Día de descanso activo o completo. No se añaden ejercicios ni actividades.
              </p>
            )}
          </div>
        )}
      </div>
    ))}

        {error && <div style={{ color: '#b94a3a', fontSize: 13, marginTop: 8 }}>{error}</div>}
      </div>

      {isDraft && (
        <div className="dash-save-bar">
          <span className="dash-save-hint">{saveMsg || 'Cambios sin guardar'}</span>
          <div className="dash-save-actions">
            <Link
              href={`/dashboard/clients/${clientId}`}
              className="dash-btn-draft"
              style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              Cancelar
            </Link>
            <button className="dash-btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
