// frontend/app/dashboard/clients/[clientId]/plans/nutrition/new/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { createNutritionPlan } from '@/lib/plans';
import type { MealOptionPayload, MealPayload, NutritionDayPayload, NutritionPlanPayload } from '@/lib/plans';

const MEAL_TYPES = [
  { value: 'breakfast',   label: 'Desayuno'       },
  { value: 'mid_morning', label: 'Media mañana'   },
  { value: 'lunch',       label: 'Almuerzo'        },
  { value: 'snack',       label: 'Merienda'        },
  { value: 'dinner',      label: 'Cena'            },
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

function initDays(): NutritionDayPayload[] {
  return Array.from({ length: 7 }, (_, i) => emptyDay(i + 1));
}

export default function NewNutritionPlanPage() {
  const router = useRouter();
  const params = useParams<{ clientId: string }>();
  const clientId = params.clientId;

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [days, setDays] = useState<NutritionDayPayload[]>(initDays);
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function updateDay(index: number, patch: Partial<NutritionDayPayload>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function addMeal(dayIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? { ...d, meals: [...d.meals, emptyMeal(d.meals.length)] }
          : d,
      ),
    );
  }

  function removeMeal(dayIndex: number, mealIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? { ...d, meals: d.meals.filter((_, mi) => mi !== mealIndex) }
          : d,
      ),
    );
  }

  function updateMeal(dayIndex: number, mealIndex: number, patch: Partial<MealPayload>) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              meals: d.meals.map((m, mi) => (mi === mealIndex ? { ...m, ...patch } : m)),
            }
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
                mi === mealIndex
                  ? { ...m, options: [...m.options, emptyOption()] }
                  : m,
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

  async function handleSave() {
    if (!title.trim()) { setError('El título es obligatorio.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload: NutritionPlanPayload = {
        client_id: clientId,
        title: title.trim(),
        notes,
        days: days.map((d, i) => ({
          ...d,
          meals: d.meals.map((m, mi) => ({
            ...m,
            display_order: mi,
            options: m.options.map((o, oi) => ({ ...o, display_order: oi })),
          })),
        })),
      };
      const { id } = await createNutritionPlan(payload);
      router.push(`/dashboard/clients/${clientId}/plans/nutrition/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el plan.');
      setSaving(false);
    }
  }

  const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

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
          <div className="dash-topbar-title">Nuevo plan de nutrición</div>
        </div>
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
                <label className="dash-label">Título <span className="opt">(obligatorio)</span></label>
                <input
                  className="dash-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej: Plan de nutrición semana 1"
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
                  placeholder="Instrucciones generales, contexto del plan…"
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
                width: '100%', padding: '14px 20px', background: openDay === day.day_number ? 'var(--nc-forest-pale)' : 'white',
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
                      placeholder="ej: Día de descanso"
                    />
                  </div>
                  <div className="dash-field">
                    <label className="dash-label">Notas del día</label>
                    <input
                      className="dash-input"
                      value={day.notes}
                      onChange={(e) => updateDay(dayIndex, { notes: e.target.value })}
                      placeholder="ej: Evitar azúcares"
                    />
                  </div>
                </div>

                {/* Meals */}
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
                          placeholder="ej: Desayuno proteico"
                        />
                      </div>
                      <div className="dash-field" style={{ flex: 1 }}>
                        <label className="dash-label">Tipo</label>
                        <select
                          className="dash-input"
                          value={meal.meal_type}
                          onChange={(e) => updateMeal(dayIndex, mealIndex, { meal_type: e.target.value as MealPayload['meal_type'] })}
                        >
                          {MEAL_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => removeMeal(dayIndex, mealIndex)}
                        style={{
                          marginTop: 20, width: 30, height: 30, border: '1px solid var(--nc-border)',
                          borderRadius: 4, background: 'transparent', cursor: 'pointer',
                          color: 'var(--nc-stone)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        title="Eliminar comida"
                      >
                        ×
                      </button>
                    </div>

                    {/* Options */}
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
                                placeholder="ej: Opción A – Avena con frutas"
                              />
                            </div>
                            <div className="dash-field" style={{ flex: 3 }}>
                              <label className="dash-label">Descripción</label>
                              <input
                                className="dash-input"
                                value={opt.description}
                                onChange={(e) => updateOption(dayIndex, mealIndex, optIndex, { description: e.target.value })}
                                placeholder="Ingredientes o instrucciones breves"
                              />
                            </div>
                            <button
                              onClick={() => removeOption(dayIndex, mealIndex, optIndex)}
                              style={{
                                marginTop: 20, width: 26, height: 26, border: '1px solid var(--nc-border)',
                                borderRadius: 4, background: 'transparent', cursor: 'pointer',
                                color: 'var(--nc-stone)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                              title="Eliminar opción"
                            >
                              ×
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {[
                              { field: 'calories' as const,  label: 'Kcal',   type: 'number' },
                              { field: 'protein_g' as const, label: 'Prot (g)',type: 'number' },
                              { field: 'carbs_g' as const,   label: 'HC (g)',  type: 'number' },
                              { field: 'fat_g' as const,     label: 'Grasas (g)', type: 'number' },
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
                                  placeholder="—"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(dayIndex, mealIndex)}
                        className="dash-btn-add-pkg"
                        style={{ marginTop: 4, height: 30, fontSize: 12 }}
                      >
                        + Añadir opción
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addMeal(dayIndex)}
                  className="dash-btn-add-pkg"
                  style={{ marginTop: 4 }}
                >
                  + Añadir comida
                </button>
              </div>
            )}
          </div>
        ))}

        {error && (
          <div style={{ color: '#b94a3a', fontSize: 13, marginTop: 8 }}>{error}</div>
        )}
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
