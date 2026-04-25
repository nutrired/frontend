// frontend/app/dashboard/my-plans/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useMyActiveAllPlans } from '@/lib/plans';
import { useMyRelationships } from '@/lib/hiring';
import type { NutritionPlan, ExercisePlan, MealType, DayType } from '@/lib/types';
import SupplementCard from './components/SupplementCard';

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast:   'Desayuno',
  mid_morning: 'Media mañana',
  lunch:       'Almuerzo',
  snack:       'Merienda',
  dinner:      'Cena',
};

const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// ─── Nutrition plan view ──────────────────────────────────────────────────────

type NutritionTab = 'meals' | 'supplements';

function NutritionPlanView({ plan }: { plan: NutritionPlan }) {
  const [activeTab, setActiveTab] = useState<NutritionTab>('meals');
  const sorted = [...(plan.days ?? [])].sort((a, b) => a.day_number - b.day_number);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--nc-forest)', fontWeight: 500, marginBottom: 4 }}>
          {plan.title}
        </h2>
        {plan.notes && (
          <p style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300, lineHeight: 1.6 }}>
            {plan.notes}
          </p>
        )}
      </div>

      {/* Tab bar */}
      <div className="print-hide" style={{
        display: 'flex', gap: 0, borderBottom: '1px solid var(--nc-border)', marginBottom: 24,
      }}>
        {(['meals', 'supplements'] as NutritionTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px', background: 'transparent', border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--nc-forest)' : '2px solid transparent',
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--nc-forest)' : 'var(--nc-stone)',
              cursor: 'pointer', marginBottom: -1, transition: 'color 0.15s',
            }}
          >
            {tab === 'meals' ? 'Comidas' : 'Suplementos'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'meals' && (
        <>
          {sorted.map((day) => (
            <div key={day.id} style={{
              border: '1px solid var(--nc-border)', borderRadius: 10,
              marginBottom: 16, overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 20px', background: 'var(--nc-forest-pale)',
                borderBottom: '1px solid var(--nc-border)',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500, color: 'var(--nc-forest)' }}>
                  Día {day.day_number} — {DAY_LABELS[day.day_number - 1]}
                  {day.label ? ` (${day.label})` : ''}
                </span>
                {day.notes && (
                  <span style={{ fontSize: 12, color: 'var(--nc-stone)', marginLeft: 12, fontWeight: 300 }}>
                    {day.notes}
                  </span>
                )}
              </div>

              {day.meals.length === 0 ? (
                <div style={{ padding: '16px 20px', fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>
                  Sin comidas programadas para este día.
                </div>
              ) : (
                <div style={{ padding: '8px 20px 16px' }}>
                  {[...day.meals]
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((meal) => (
                      <div key={meal.id} style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--nc-ink)' }}>
                            {meal.name}
                          </div>
                          <span style={{
                            fontSize: 11, padding: '1px 7px', borderRadius: 4,
                            background: 'rgba(26,51,41,0.07)', color: 'var(--nc-forest)', fontWeight: 500,
                          }}>
                            {MEAL_TYPE_LABELS[meal.meal_type]}
                          </span>
                        </div>
                        {[...meal.options]
                          .sort((a, b) => a.display_order - b.display_order)
                          .map((opt, idx) => (
                            <div key={opt.id} style={{
                              padding: '10px 14px',
                              border: '1px solid rgba(139,115,85,0.12)',
                              borderRadius: 6, marginBottom: 6, background: 'white',
                            }}>
                              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--nc-ink)', marginBottom: 2 }}>
                                {meal.options.length > 1 ? `Opción ${String.fromCharCode(65 + idx)}: ` : ''}{opt.name}
                              </div>
                              {opt.description && (
                                <div style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300, lineHeight: 1.5, marginBottom: 6 }}>
                                  {opt.description}
                                </div>
                              )}
                              {(opt.calories !== null || opt.protein_g !== null || opt.carbs_g !== null || opt.fat_g !== null) && (
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                  {opt.calories !== null && (
                                    <span style={{ fontSize: 11, color: 'var(--nc-stone)' }}>
                                      <strong>{opt.calories}</strong> kcal
                                    </span>
                                  )}
                                  {opt.protein_g !== null && (
                                    <span style={{ fontSize: 11, color: 'var(--nc-stone)' }}>
                                      Prot <strong>{opt.protein_g}g</strong>
                                    </span>
                                  )}
                                  {opt.carbs_g !== null && (
                                    <span style={{ fontSize: 11, color: 'var(--nc-stone)' }}>
                                      HC <strong>{opt.carbs_g}g</strong>
                                    </span>
                                  )}
                                  {opt.fat_g !== null && (
                                    <span style={{ fontSize: 11, color: 'var(--nc-stone)' }}>
                                      Grasas <strong>{opt.fat_g}g</strong>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {activeTab === 'supplements' && (
        <div>
          {!plan.include_supplements || plan.supplements.length === 0 ? (
            <div style={{
              background: 'white', border: '1px solid rgba(139,115,85,0.12)',
              borderRadius: 8, padding: 32, textAlign: 'center',
              color: 'var(--nc-stone)', fontWeight: 300, fontSize: 14,
            }}>
              No hay suplementos incluidos en este plan.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[...plan.supplements]
                .sort((a, b) => a.display_order - b.display_order)
                .map((supp) => (
                  <SupplementCard key={supp.id} supplement={supp} />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Exercise plan view ───────────────────────────────────────────────────────

function ExercisePlanView({ plan }: { plan: ExercisePlan }) {
  const sorted = [...(plan.days ?? [])].sort((a, b) => a.day_number - b.day_number);
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--nc-forest)', fontWeight: 500, marginBottom: 4 }}>
          {plan.title}
        </h2>
        {plan.notes && (
          <p style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300, lineHeight: 1.6 }}>
            {plan.notes}
          </p>
        )}
      </div>

      {sorted.map((day) => (
        <div key={day.id} style={{
          border: '1px solid var(--nc-border)', borderRadius: 10,
          marginBottom: 16, overflow: 'hidden',
        }}>
          {/* Day header */}
          <div style={{
            padding: '12px 20px', background: 'var(--nc-forest-pale)',
            borderBottom: '1px solid var(--nc-border)',
            display: 'flex', alignItems: 'baseline', gap: 12,
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500, color: 'var(--nc-forest)' }}>
              Día {day.day_number} — {DAY_LABELS[day.day_number - 1]}
              {day.label ? ` (${day.label})` : ''}
            </span>
            {day.notes && (
              <span style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300 }}>
                {day.notes}
              </span>
            )}
          </div>

          {/* ─── Rest day ──────────────────────────────────────── */}
          {day.day_type === 'rest' && (
            <div style={{ padding: '16px 20px', fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300, fontStyle: 'italic' }}>
              Día de descanso.
            </div>
          )}

          {/* ─── Cardio day ────────────────────────────────────── */}
          {day.day_type === 'cardio' && (
            <div style={{ padding: '8px 20px 16px' }}>
              {(day.activities ?? []).length === 0 ? (
                <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>
                  Sin actividades programadas.
                </div>
              ) : (
                [...(day.activities ?? [])].sort((a, b) => a.display_order - b.display_order).map((act) => (
                  <div key={act.id} style={{
                    padding: '10px 14px', border: '1px solid rgba(139,115,85,0.12)',
                    borderRadius: 6, marginBottom: 8, background: 'white', marginTop: 8,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--nc-ink)', marginBottom: 4 }}>
                      {act.name}
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {act.duration_minutes !== null && (
                        <span style={{ fontSize: 11, color: 'var(--nc-stone)' }}>
                          <strong>{act.duration_minutes}</strong> min
                        </span>
                      )}
                      {act.distance_km !== null && (
                        <span style={{ fontSize: 11, color: 'var(--nc-stone)' }}>
                          <strong>{act.distance_km}</strong> km
                        </span>
                      )}
                      {act.notes && (
                        <span style={{ fontSize: 11, color: 'var(--nc-stone)', fontWeight: 300 }}>
                          {act.notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ─── Strength day ──────────────────────────────────── */}
          {(day.day_type === 'strength' || !day.day_type) && (
            day.blocks.length === 0 ? (
              <div style={{ padding: '16px 20px', fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>
                Sin bloques programados para este día.
              </div>
            ) : (
              <div style={{ padding: '8px 20px 16px' }}>
                {[...day.blocks]
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((block) => (
                    <div key={block.id} style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nc-forest)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                        {block.name}
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--nc-border)' }}>
                            <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--nc-stone)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ejercicio</th>
                            <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--nc-stone)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Series</th>
                            <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--nc-stone)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reps</th>
                            <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--nc-stone)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Desc.</th>
                            <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--nc-stone)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...block.exercises]
                            .sort((a, b) => a.display_order - b.display_order)
                            .map((ex) => (
                              <tr key={ex.id} style={{ borderBottom: '1px solid rgba(139,115,85,0.08)' }}>
                                <td style={{ padding: '8px 0', fontWeight: 500, color: 'var(--nc-ink)' }}>{ex.name}</td>
                                <td style={{ padding: '8px', textAlign: 'center', color: 'var(--nc-stone)' }}>{ex.sets ?? '—'}</td>
                                <td style={{ padding: '8px', textAlign: 'center', color: 'var(--nc-stone)' }}>{ex.reps ?? '—'}</td>
                                <td style={{ padding: '8px', textAlign: 'center', color: 'var(--nc-stone)' }}>
                                  {ex.rest_seconds !== null ? `${ex.rest_seconds}s` : '—'}
                                </td>
                                <td style={{ padding: '8px', color: 'var(--nc-stone)', fontWeight: 300 }}>{ex.notes || '—'}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
              </div>
            )
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface GroupedPlans {
  relationshipId: string;
  nutritionistName: string;
  nutritionistAvatar: string | null;
  nutritionPlan: NutritionPlan | null;
  exercisePlan: ExercisePlan | null;
}

export default function MyPlansPage() {
  const { nutritionPlans, exercisePlans, isLoading } = useMyActiveAllPlans();
  const { relationships } = useMyRelationships();

  const handlePrint = () => {
    window.print();
  };

  // Group plans by relationship_id
  const groupedPlans = useMemo((): GroupedPlans[] => {
    const groupMap = new Map<string, GroupedPlans>();

    // Add nutrition plans
    for (const plan of nutritionPlans) {
      if (!groupMap.has(plan.relationship_id)) {
        const rel = relationships.find(r => r.id === plan.relationship_id);
        groupMap.set(plan.relationship_id, {
          relationshipId: plan.relationship_id,
          nutritionistName: rel?.nutritionist_display_name ?? 'Nutricionista desconocido',
          nutritionistAvatar: null, // relationships don't have avatar field yet
          nutritionPlan: plan,
          exercisePlan: null,
        });
      } else {
        groupMap.get(plan.relationship_id)!.nutritionPlan = plan;
      }
    }

    // Add exercise plans
    for (const plan of exercisePlans) {
      if (!groupMap.has(plan.relationship_id)) {
        const rel = relationships.find(r => r.id === plan.relationship_id);
        groupMap.set(plan.relationship_id, {
          relationshipId: plan.relationship_id,
          nutritionistName: rel?.nutritionist_display_name ?? 'Nutricionista desconocido',
          nutritionistAvatar: null,
          nutritionPlan: null,
          exercisePlan: plan,
        });
      } else {
        groupMap.get(plan.relationship_id)!.exercisePlan = plan;
      }
    }

    return Array.from(groupMap.values());
  }, [nutritionPlans, exercisePlans, relationships]);

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">Mis planes</div>
        <div className="dash-topbar-right">
          <button
            onClick={handlePrint}
            className="print-hide"
            style={{
              height: 34, padding: '0 16px',
              border: '1px solid var(--nc-border)', borderRadius: 6,
              background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--nc-stone)',
            }}
          >
            Descargar PDF
          </button>
        </div>
      </div>
      <div className="dash-content">
        {isLoading ? (
          <div style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>Cargando planes…</div>
        ) : groupedPlans.length === 0 ? (
          <div style={{
            background: 'white', border: '1px solid rgba(139,115,85,0.12)',
            borderRadius: 8, padding: 32, textAlign: 'center',
            color: 'var(--nc-stone)', fontWeight: 300, fontSize: 14,
          }}>
            <div style={{ marginBottom: 8, fontSize: 16 }}>No tienes planes activos</div>
            <div>Tus nutricionistas te asignarán planes en breve.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {groupedPlans.map((group) => (
              <div key={group.relationshipId}>
                {group.nutritionPlan && (
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                      <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--nc-ink)' }}>📋</span>
                      <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--nc-ink)' }}>
                        Plan de Nutrición por {group.nutritionistName}
                      </span>
                    </div>
                    <NutritionPlanView plan={group.nutritionPlan} />
                  </div>
                )}
                {group.exercisePlan && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                      <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--nc-ink)' }}>🏋️</span>
                      <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--nc-ink)' }}>
                        Plan de Ejercicio por {group.nutritionistName}
                      </span>
                    </div>
                    <ExercisePlanView plan={group.exercisePlan} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
