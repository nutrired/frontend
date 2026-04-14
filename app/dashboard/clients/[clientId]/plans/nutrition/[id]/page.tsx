// frontend/app/dashboard/clients/[clientId]/plans/nutrition/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  useNutritionPlan,
  updateNutritionPlan,
  activateNutritionPlan,
  deleteNutritionPlan,
} from '@/lib/plans';
import type { MealOptionPayload, MealPayload, NutritionDayPayload, NutritionPlanPayload } from '@/lib/plans';
import type { PlanStatus } from '@/lib/types';

const MEAL_TYPES = [
  { value: 'breakfast',   label: 'Desayuno'     },
  { value: 'mid_morning', label: 'Media mañana' },
  { value: 'lunch',       label: 'Almuerzo'     },
  { value: 'snack',       label: 'Merienda'     },
  { value: 'dinner',      label: 'Cena'         },
];

function emptyOption(): MealOptionPayload {
  return { name: '', description: '', calories: null, protein_g: null, carbs_g: null, fat_g: null, display_order: 0 };
}

function emptyMeal(displayOrder: number): MealPayload {
  return { name: '', meal_type: 'breakfast', display_order: displayOrder, options: [emptyOption()] };
}

function emptyDay(dayNumber: number): NutritionDayPayload {
  return { day_number: dayNumber, label: '', notes: '', meals: [] };
}

const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function StatusPill({ status }: { status: PlanStatus }) {
  const cfg: Record<PlanStatus, { bg: string; color: string; label: string }> = {
    draft:    { bg: 'rgba(139,115,85,0.1)',  color: 'var(--nc-stone)',  label: 'Borrador'  },
    active:   { bg: 'rgba(74,124,89,0.1)',   color: '#4a7c59',          label: 'Activo'    },
    archived: { bg: 'rgba(0,0,0,0.06)',       color: 'var(--nc-stone)',  label: 'Archivado' },
  };
  const { bg, color, label } = cfg[status];
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: bg, color }}>
      {label}
    </span>
  );
}

export default function EditNutritionPlanPage() {
  const router = useRouter();
  const params = useParams<{ clientId: string; id: string }>();
  const { clientId, id } = params;

  const { plan, isLoading, mutate } = useNutritionPlan(id);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [days, setDays] = useState<NutritionDayPayload[]>([]);
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (!plan) return;
    setTitle(plan.title);
    setNotes(plan.notes);

    // Merge plan.days (sparse) into a full 7-day array
    const merged: NutritionDayPayload[] = Array.from({ length: 7 }, (_, i) => {
      const found = plan.days.find((d) => d.day_number === i + 1);
      if (!found) return emptyDay(i + 1);
      return {
        day_number: found.day_number,
        label: found.label,
        notes: found.notes,
        meals: found.meals.map((m) => ({
          name: m.name,
          meal_type: m.meal_type,
          display_order: m.display_order,
          options: m.options.map((o) => ({
            name: o.name,
            description: o.description,
            calories: o.calories,
            protein_g: o.protein_g,
            carbs_g: o.carbs_g,
            fat_g: o.fat_g,
            display_order: o.display_order,
          })),
        })),
      };
    });
    setDays(merged);
  }, [plan]);

  function updateDay(index: number, patch: Partial<NutritionDayPayload>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function addMeal(dayIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, meals: [...d.meals, emptyMeal(d.meals.length)] } : d,
      ),
    );
  }

  function removeMeal(dayIndex: number, mealIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, meals: d.meals.filter((_, mi) => mi !== mealIndex) } : d,
      ),
    );
  }

  function updateMeal(dayIndex: number, mealIndex: number, patch: Partial<MealPayload>) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? { ...d, meals: d.meals.map((m, mi) => (mi === mealIndex ? { ...m, ...patch } : m)) }
          : d,
      ),
    );
  }

  function addOption(dayIndex: number, mealIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              meals: d.meals.map((m, mi) =>
                mi === mealIndex ? { ...m, options: [...m.options, emptyOption()] } : m,
              ),
            }
          : d,
      ),
    );
  }

  function removeOption(dayIndex: number, mealIndex: number, optionIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              meals: d.meals.map((m, mi) =>
                mi === mealIndex
                  ? { ...m, options: m.options.filter((_, oi) => oi !== optionIndex) }
                  : m,
              ),
            }
          : d,
      ),
    );
  }

  function updateOption(
    dayIndex: number,
    mealIndex: number,
    optionIndex: number,
    patch: Partial<MealOptionPayload>,
  ) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              meals: d.meals.map((m, mi) =>
                mi === mealIndex
                  ? {
                      ...m,
                      options: m.options.map((o, oi) =>
                        oi === optionIndex ? { ...o, ...patch } : o,
                      ),
                    }
                  : m,
              ),
            }
          : d,
      ),
    );
  }

  function buildPayload(): NutritionPlanPayload {
    return {
      client_id: plan?.client_id ?? '',
      title: title.trim(),
      notes,
      days: days.map((d) => ({
        ...d,
        meals: d.meals.map((m, mi) => ({
          ...m,
          display_order: mi,
          options: m.options.map((o, oi) => ({ ...o, display_order: oi })),
        })),
      })),
    };
  }

  async function handleSave() {
    if (!title.trim()) { setError('El título es obligatorio.'); return; }
    setSaving(true);
    setError('');
    setSaveMsg('');
    try {
      await updateNutritionPlan(id, buildPayload());
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
      await activateNutritionPlan(id);
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
    try {
      await deleteNutritionPlan(id);
      router.push(`/dashboard/clients/${clientId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el plan.');
    } finally {
      setDeleting(false);
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
          <StatusPill status={plan.status} />
        </div>
        {isDraft && (
          <div style={{ display: 'flex', gap: 8 }}>
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
        {/* Header fields */}
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

        {/* Day accordion */}
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
                {day.meals.length} comida{day.meals.length !== 1 ? 's' : ''}
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
                      disabled={!isDraft}
                      placeholder="ej: Día de descanso"
                    />
                  </div>
                  <div className="dash-field">
                    <label className="dash-label">Notas del día</label>
                    <input
                      className="dash-input"
                      value={day.notes}
                      onChange={(e) => updateDay(dayIndex, { notes: e.target.value })}
                      disabled={!isDraft}
                      placeholder="ej: Evitar azúcares"
                    />
                  </div>
                </div>

                {day.meals.map((meal, mealIndex) => (
                  <div key={mealIndex} style={{
                    border: '1px solid var(--nc-border)', borderRadius: 6,
                    padding: '12px 16px', marginBottom: 8, background: 'var(--nc-cream)',
                  }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                      <div className="dash-field" style={{ flex: 2 }}>
                        <label className="dash-label">Nombre de la comida</label>
                        <input
                          className="dash-input"
                          value={meal.name}
                          onChange={(e) => updateMeal(dayIndex, mealIndex, { name: e.target.value })}
                          disabled={!isDraft}
                          placeholder="ej: Desayuno proteico"
                        />
                      </div>
                      <div className="dash-field" style={{ flex: 1 }}>
                        <label className="dash-label">Tipo</label>
                        <select
                          className="dash-input"
                          value={meal.meal_type}
                          onChange={(e) => updateMeal(dayIndex, mealIndex, { meal_type: e.target.value as MealPayload['meal_type'] })}
                          disabled={!isDraft}
                        >
                          {MEAL_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      {isDraft && (
                        <button
                          onClick={() => removeMeal(dayIndex, mealIndex)}
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
                        Opciones
                      </div>
                      {meal.options.map((opt, optIndex) => (
                        <div key={optIndex} style={{
                          border: '1px solid rgba(139,115,85,0.15)', borderRadius: 4,
                          padding: '8px 10px', marginBottom: 6, background: 'white',
                        }}>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                            <div className="dash-field" style={{ flex: 2 }}>
                              <label className="dash-label">Nombre</label>
                              <input
                                className="dash-input"
                                value={opt.name}
                                onChange={(e) => updateOption(dayIndex, mealIndex, optIndex, { name: e.target.value })}
                                disabled={!isDraft}
                                placeholder="ej: Opción A"
                              />
                            </div>
                            <div className="dash-field" style={{ flex: 3 }}>
                              <label className="dash-label">Descripción</label>
                              <input
                                className="dash-input"
                                value={opt.description}
                                onChange={(e) => updateOption(dayIndex, mealIndex, optIndex, { description: e.target.value })}
                                disabled={!isDraft}
                                placeholder="Ingredientes o instrucciones"
                              />
                            </div>
                            {isDraft && (
                              <button
                                onClick={() => removeOption(dayIndex, mealIndex, optIndex)}
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
                          <div style={{ display: 'flex', gap: 8 }}>
                            {[
                              { field: 'calories' as const,  label: 'Kcal'      },
                              { field: 'protein_g' as const, label: 'Prot (g)'  },
                              { field: 'carbs_g' as const,   label: 'HC (g)'    },
                              { field: 'fat_g' as const,     label: 'Grasas (g)'},
                            ].map(({ field, label }) => (
                              <div key={field} className="dash-field" style={{ flex: 1 }}>
                                <label className="dash-label">{label}</label>
                                <input
                                  className="dash-input"
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={opt[field] ?? ''}
                                  onChange={(e) =>
                                    updateOption(dayIndex, mealIndex, optIndex, {
                                      [field]: e.target.value === '' ? null : Number(e.target.value),
                                    })
                                  }
                                  disabled={!isDraft}
                                  placeholder="—"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {isDraft && (
                        <button
                          onClick={() => addOption(dayIndex, mealIndex)}
                          className="dash-btn-add-pkg"
                          style={{ marginTop: 4, height: 30, fontSize: 12 }}
                        >
                          + Añadir opción
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isDraft && (
                  <button
                    onClick={() => addMeal(dayIndex)}
                    className="dash-btn-add-pkg"
                    style={{ marginTop: 4 }}
                  >
                    + Añadir comida
                  </button>
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
