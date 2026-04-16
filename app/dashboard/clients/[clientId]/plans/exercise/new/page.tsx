'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { createExercisePlan } from '@/lib/plans';
import type { ExercisePayload, WorkoutBlockPayload, ExerciseDayPayload, ExercisePlanPayload } from '@/lib/plans';

const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function emptyExercise(displayOrder: number): ExercisePayload {
  return { name: '', sets: null, reps: null, rest_seconds: null, notes: '', display_order: displayOrder };
}

function emptyBlock(displayOrder: number): WorkoutBlockPayload {
  return { name: '', display_order: displayOrder, exercises: [emptyExercise(0)] };
}

function emptyDay(dayNumber: number): ExerciseDayPayload {
  return { day_number: dayNumber, label: '', notes: '', day_type: 'strength', blocks: [], activities: [] };
}

function initDays(): ExerciseDayPayload[] {
  return Array.from({ length: 7 }, (_, i) => emptyDay(i + 1));
}

export default function NewExercisePlanPage() {
  const router = useRouter();
  const params = useParams<{ clientId: string }>();
  const clientId = params.clientId;

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [days, setDays] = useState<ExerciseDayPayload[]>(initDays);
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function updateDay(index: number, patch: Partial<ExerciseDayPayload>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

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

  async function handleSave() {
    if (!title.trim()) { setError('El título es obligatorio.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload: ExercisePlanPayload = {
        client_id: clientId,
        title: title.trim(),
        notes,
        days: days.map((d) => ({
          ...d,
          blocks: d.blocks.map((b, bi) => ({
            ...b,
            display_order: bi,
            exercises: b.exercises.map((e, ei) => ({ ...e, display_order: ei })),
          })),
        })),
      };
      const { id } = await createExercisePlan(payload);
      router.push(`/dashboard/clients/${clientId}/plans/exercise/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el plan.');
    } finally {
      setSaving(false);
    }
  }

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
          <div className="dash-topbar-title">Nuevo plan de ejercicio</div>
        </div>
      </div>
      <div className="dash-content">
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">Información del plan</div>
          </div>
          <div className="dash-section-body">
            <div className="dash-row">
              <div className="dash-field">
                <label className="dash-label">Título <span className="opt">(obligatorio)</span></label>
                <input
                  className="dash-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej: Plan de fuerza — semana 1"
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
                  placeholder="Objetivo del entrenamiento, instrucciones generales…"
                />
              </div>
            </div>
          </div>
        </div>

        {days.map((day, dayIndex) => (
          <div key={day.day_number} style={{
            border: '1px solid var(--nc-border)', borderRadius: 8, marginBottom: 8, overflow: 'hidden',
          }}>
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
                {day.blocks.length} bloque{day.blocks.length !== 1 ? 's' : ''}
                {openDay === day.day_number ? ' ▲' : ' ▼'}
              </span>
            </button>

            {openDay === day.day_number && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--nc-border)', background: 'white' }}>
                <div className="dash-row" style={{ marginBottom: 12 }}>
                  <div className="dash-field">
                    <label className="dash-label">Etiqueta del día</label>
                    <input
                      className="dash-input"
                      value={day.label}
                      onChange={(e) => updateDay(dayIndex, { label: e.target.value })}
                      placeholder="ej: Tren superior"
                    />
                  </div>
                  <div className="dash-field">
                    <label className="dash-label">Notas del día</label>
                    <input
                      className="dash-input"
                      value={day.notes}
                      onChange={(e) => updateDay(dayIndex, { notes: e.target.value })}
                      placeholder="ej: Descanso entre series: 90 s"
                    />
                  </div>
                </div>

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
                          placeholder="ej: Calentamiento / Circuito A"
                        />
                      </div>
                      <button
                        onClick={() => removeBlock(dayIndex, blockIndex)}
                        style={{
                          marginTop: 20, width: 30, height: 30, border: '1px solid var(--nc-border)',
                          borderRadius: 4, background: 'transparent', cursor: 'pointer',
                          color: 'var(--nc-stone)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        title="Eliminar bloque"
                      >
                        ×
                      </button>
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
                                placeholder="ej: Press de banca"
                              />
                            </div>
                            {[
                              { field: 'sets' as const,         label: 'Series'   },
                              { field: 'reps' as const,         label: 'Reps'     },
                              { field: 'rest_seconds' as const, label: 'Desc (s)' },
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
                                placeholder="ej: Agarre prono"
                              />
                            </div>
                            <button
                              onClick={() => removeExercise(dayIndex, blockIndex, exIndex)}
                              style={{
                                marginTop: 20, width: 26, height: 26, border: '1px solid var(--nc-border)',
                                borderRadius: 4, background: 'transparent', cursor: 'pointer',
                                color: 'var(--nc-stone)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                              title="Eliminar ejercicio"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => addExercise(dayIndex, blockIndex)}
                        className="dash-btn-add-pkg"
                        style={{ marginTop: 4, height: 30, fontSize: 12 }}
                      >
                        + Añadir ejercicio
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addBlock(dayIndex)}
                  className="dash-btn-add-pkg"
                  style={{ marginTop: 4 }}
                >
                  + Añadir bloque
                </button>
              </div>
            )}
          </div>
        ))}

        {error && <div style={{ color: '#b94a3a', fontSize: 13, marginTop: 8 }}>{error}</div>}
      </div>

      <div className="dash-save-bar">
        <span className="dash-save-hint">Guardando como borrador</span>
        <div className="dash-save-actions">
          <Link
            href={`/dashboard/clients/${clientId}`}
            className="dash-btn-draft"
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            Cancelar
          </Link>
          <button className="dash-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar borrador'}
          </button>
        </div>
      </div>
    </>
  );
}
