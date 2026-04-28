// frontend/app/[locale]/dashboard/my-plans/components/PlanViews.tsx
'use client';

import { useState, useMemo } from 'react';
import type { NutritionPlan, ExercisePlan, MealType, DayType } from '@/lib/types';
import SupplementCard from './SupplementCard';

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast:   'Desayuno',
  mid_morning: 'Media mañana',
  lunch:       'Almuerzo',
  snack:       'Merienda',
  dinner:      'Cena',
};

const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// ─── Macro Pie Chart Component ────────────────────────────────────────────────

interface MacroData {
  protein: number;
  carbs: number;
  fat: number;
  total: number;
}

function MacroPieChart({ data }: { data: MacroData }) {
  const { protein, carbs, fat, total } = data;

  if (total === 0) return null;

  const proteinPercent = (protein / total) * 100;
  const carbsPercent = (carbs / total) * 100;
  const fatPercent = (fat / total) * 100;

  // Calculate SVG pie slices (cumulative angles)
  const proteinAngle = (proteinPercent / 100) * 360;
  const carbsAngle = proteinAngle + (carbsPercent / 100) * 360;

  const getCoordinates = (angle: number, radius: number = 90) => {
    const rad = (angle - 90) * Math.PI / 180;
    return {
      x: 100 + radius * Math.cos(rad),
      y: 100 + radius * Math.sin(rad)
    };
  };

  const proteinEnd = getCoordinates(proteinAngle);
  const carbsEnd = getCoordinates(carbsAngle);

  const proteinPath = `M 100 100 L 100 10 A 90 90 0 ${proteinAngle > 180 ? 1 : 0} 1 ${proteinEnd.x} ${proteinEnd.y} Z`;
  const carbsPath = `M 100 100 L ${proteinEnd.x} ${proteinEnd.y} A 90 90 0 ${carbsAngle - proteinAngle > 180 ? 1 : 0} 1 ${carbsEnd.x} ${carbsEnd.y} Z`;
  const fatPath = `M 100 100 L ${carbsEnd.x} ${carbsEnd.y} A 90 90 0 ${360 - carbsAngle > 180 ? 1 : 0} 1 100 10 Z`;

  return (
    <div style={{
      position: 'relative',
      animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #f8f6f3 0%, #ffffff 100%)',
        border: '1px solid rgba(90, 138, 64, 0.12)',
        borderRadius: 16,
        padding: 32,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background pattern */}
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          background: 'radial-gradient(circle, rgba(90, 138, 64, 0.04) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--nc-forest)',
          marginBottom: 24,
          letterSpacing: '-0.01em'
        }}>
          Distribución de Macronutrientes
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: 32,
          alignItems: 'center'
        }}>
          {/* SVG Pie Chart */}
          <div style={{ position: 'relative' }}>
            <svg viewBox="0 0 200 200" style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))' }}>
              {/* Protein slice - vibrant salmon */}
              <path d={proteinPath} fill="#ff6b6b" style={{ transition: 'transform 0.3s ease', transformOrigin: '100px 100px' }} />

              {/* Carbs slice - warm amber */}
              <path d={carbsPath} fill="#ffd93d" style={{ transition: 'transform 0.3s ease', transformOrigin: '100px 100px' }} />

              {/* Fat slice - sage green */}
              <path d={fatPath} fill="#6bcf7f" style={{ transition: 'transform 0.3s ease', transformOrigin: '100px 100px' }} />

              {/* Center circle for donut effect */}
              <circle cx="100" cy="100" r="55" fill="white" />

              {/* Center text */}
              <text x="100" y="95" textAnchor="middle" style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                fontWeight: 600,
                fill: 'var(--nc-ink)'
              }}>
                {Math.round(total)}g
              </text>
              <text x="100" y="115" textAnchor="middle" style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                fill: 'var(--nc-stone)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                TOTAL
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: '#ff6b6b',
                flexShrink: 0
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--nc-stone)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
                  Proteína
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--nc-ink)', fontFamily: 'var(--font-display)' }}>
                  {protein.toFixed(1)}g
                  <span style={{ fontSize: 14, color: 'var(--nc-stone)', marginLeft: 8, fontWeight: 400 }}>
                    {proteinPercent.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: '#ffd93d',
                flexShrink: 0
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--nc-stone)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
                  Carbohidratos
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--nc-ink)', fontFamily: 'var(--font-display)' }}>
                  {carbs.toFixed(1)}g
                  <span style={{ fontSize: 14, color: 'var(--nc-stone)', marginLeft: 8, fontWeight: 400 }}>
                    {carbsPercent.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: '#6bcf7f',
                flexShrink: 0
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--nc-stone)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
                  Grasas
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--nc-ink)', fontFamily: 'var(--font-display)' }}>
                  {fat.toFixed(1)}g
                  <span style={{ fontSize: 14, color: 'var(--nc-stone)', marginLeft: 8, fontWeight: 400 }}>
                    {fatPercent.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// ─── Nutrition plan view ──────────────────────────────────────────────────────

type NutritionTab = 'meals' | 'supplements';

export function NutritionPlanView({ plan }: { plan: NutritionPlan }) {
  const [activeTab, setActiveTab] = useState<NutritionTab>('meals');
  const sorted = [...(plan.days ?? [])].sort((a, b) => a.day_number - b.day_number);
  const sortedSlots = [...(plan.slots ?? [])].sort((a, b) => a.display_order - b.display_order);
  const isFlexible = plan.plan_style === 'flexible';

  // Calculate total macros
  const macroData = useMemo(() => {
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    if (isFlexible) {
      // Sum from slots (take first option of each slot)
      sortedSlots.forEach(slot => {
        const firstOption = slot.options[0];
        if (firstOption) {
          protein += firstOption.protein_g || 0;
          carbs += firstOption.carbs_g || 0;
          fat += firstOption.fat_g || 0;
        }
      });
    } else {
      // Sum from all days (take first option of each meal)
      sorted.forEach(day => {
        day.meals.forEach(meal => {
          const firstOption = meal.options[0];
          if (firstOption) {
            protein += firstOption.protein_g || 0;
            carbs += firstOption.carbs_g || 0;
            fat += firstOption.fat_g || 0;
          }
        });
      });
      // Average across days if structured
      const dayCount = sorted.length || 1;
      protein = protein / dayCount;
      carbs = carbs / dayCount;
      fat = fat / dayCount;
    }

    return {
      protein,
      carbs,
      fat,
      total: protein + carbs + fat
    };
  }, [isFlexible, sorted, sortedSlots]);

  return (
    <div style={{
      animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      maxWidth: 1000,
      margin: '0 auto'
    }}>
      {/* Hero section */}
      <div style={{
        marginBottom: 32,
        animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: 'linear-gradient(135deg, rgba(90, 138, 64, 0.08) 0%, rgba(90, 138, 64, 0.04) 100%)',
          borderRadius: 20,
          marginBottom: 12
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--nc-forest)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px'
          }}>
            Plan Nutricional
          </span>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          color: 'var(--nc-ink)',
          fontWeight: 600,
          marginBottom: 8,
          letterSpacing: '-0.02em',
          lineHeight: 1.2
        }}>
          {plan.title}
        </h2>
        {plan.notes && (
          <p style={{
            fontSize: 15,
            color: 'var(--nc-stone)',
            fontWeight: 300,
            lineHeight: 1.7,
            maxWidth: 680
          }}>
            {plan.notes}
          </p>
        )}
      </div>

      {/* Macro visualization */}
      {macroData.total > 0 && (
        <div style={{ marginBottom: 40 }}>
          <MacroPieChart data={macroData} />
        </div>
      )}

      {/* Tab bar */}
      <div className="print-hide" style={{
        display: 'flex',
        gap: 8,
        marginBottom: 32,
        borderBottom: '2px solid rgba(90, 138, 64, 0.08)',
        animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both'
      }}>
        {(['meals', 'supplements'] as NutritionTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              background: activeTab === tab ? 'var(--nc-forest)' : 'transparent',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              fontWeight: 600,
              color: activeTab === tab ? 'white' : 'var(--nc-stone)',
              cursor: 'pointer',
              marginBottom: -2,
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: activeTab === tab ? 'translateY(0)' : 'translateY(0)',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = 'rgba(90, 138, 64, 0.06)';
                e.currentTarget.style.color = 'var(--nc-forest)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--nc-stone)';
              }
            }}
          >
            {tab === 'meals' ? 'Comidas' : 'Suplementos'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'meals' && (
        <div style={{
          animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Flexible plan: render slots */}
          {isFlexible && sortedSlots.map((slot, idx) => (
            <div key={slot.id} style={{
              border: '1px solid rgba(90, 138, 64, 0.12)',
              borderRadius: 12,
              marginBottom: 20,
              overflow: 'hidden',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s both`
            }}>
              <div style={{
                padding: '16px 24px',
                background: 'linear-gradient(135deg, rgba(90, 138, 64, 0.06) 0%, rgba(90, 138, 64, 0.02) 100%)',
                borderBottom: '1px solid rgba(90, 138, 64, 0.12)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'var(--nc-forest)',
                  letterSpacing: '-0.01em'
                }}>
                  {MEAL_TYPE_LABELS[slot.meal_type]}
                </span>
              </div>
              <div style={{ padding: '20px 24px' }}>
                {[...slot.options]
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((opt, idx) => (
                    <div key={opt.id} style={{
                      padding: '16px 18px',
                      border: '1px solid rgba(139,115,85,0.1)',
                      borderRadius: 10,
                      marginBottom: 12,
                      background: 'linear-gradient(135deg, #fafaf9 0%, #ffffff 100%)',
                      transition: 'all 0.2s ease',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(90, 138, 64, 0.2)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(139,115,85,0.1)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                    >
                      <div style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: 'var(--nc-ink)',
                        marginBottom: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        {slot.options.length > 1 && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            background: 'var(--nc-forest)',
                            color: 'white',
                            fontSize: 12,
                            fontWeight: 700
                          }}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                        )}
                        {opt.name}
                      </div>
                      {opt.description && (
                        <div style={{
                          fontSize: 13,
                          color: 'var(--nc-stone)',
                          fontWeight: 300,
                          lineHeight: 1.6,
                          marginBottom: 10
                        }}>
                          {opt.description}
                        </div>
                      )}
                      {(opt.calories !== null || opt.protein_g !== null || opt.carbs_g !== null || opt.fat_g !== null) && (
                        <div style={{
                          display: 'flex',
                          gap: 16,
                          flexWrap: 'wrap',
                          paddingTop: 10,
                          borderTop: '1px solid rgba(90, 138, 64, 0.08)'
                        }}>
                          {opt.calories !== null && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span style={{ fontSize: 10, color: 'var(--nc-stone)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                Calorías
                              </span>
                              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--nc-ink)', fontFamily: 'var(--font-display)' }}>
                                {opt.calories}
                              </span>
                            </div>
                          )}
                          {opt.protein_g !== null && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span style={{ fontSize: 10, color: 'var(--nc-stone)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                Proteína
                              </span>
                              <span style={{ fontSize: 16, fontWeight: 700, color: '#ff6b6b', fontFamily: 'var(--font-display)' }}>
                                {opt.protein_g}g
                              </span>
                            </div>
                          )}
                          {opt.carbs_g !== null && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span style={{ fontSize: 10, color: 'var(--nc-stone)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                Carbos
                              </span>
                              <span style={{ fontSize: 16, fontWeight: 700, color: '#ffd93d', fontFamily: 'var(--font-display)' }}>
                                {opt.carbs_g}g
                              </span>
                            </div>
                          )}
                          {opt.fat_g !== null && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span style={{ fontSize: 10, color: 'var(--nc-stone)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                Grasas
                              </span>
                              <span style={{ fontSize: 16, fontWeight: 700, color: '#6bcf7f', fontFamily: 'var(--font-display)' }}>
                                {opt.fat_g}g
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {/* Structured plan: render days */}
          {!isFlexible && sorted.map((day, idx) => (
            <div key={day.id} style={{
              border: '1px solid rgba(90, 138, 64, 0.12)',
              borderRadius: 12,
              marginBottom: 20,
              overflow: 'hidden',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s both`
            }}>
              <div style={{
                padding: '16px 24px',
                background: 'linear-gradient(135deg, rgba(90, 138, 64, 0.06) 0%, rgba(90, 138, 64, 0.02) 100%)',
                borderBottom: '1px solid rgba(90, 138, 64, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'var(--nc-forest)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                  fontFamily: 'var(--font-display)'
                }}>
                  {day.day_number}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 17,
                    fontWeight: 600,
                    color: 'var(--nc-forest)',
                    letterSpacing: '-0.01em'
                  }}>
                    {DAY_LABELS[day.day_number - 1]}
                    {day.label ? ` — ${day.label}` : ''}
                  </span>
                  {day.notes && (
                    <div style={{
                      fontSize: 12,
                      color: 'var(--nc-stone)',
                      marginTop: 2,
                      fontWeight: 300
                    }}>
                      {day.notes}
                    </div>
                  )}
                </div>
              </div>

              {day.meals.length === 0 ? (
                <div style={{
                  padding: '32px 24px',
                  fontSize: 13,
                  color: 'var(--nc-stone)',
                  fontWeight: 300,
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  Sin comidas programadas para este día.
                </div>
              ) : (
                <div style={{ padding: '20px 24px' }}>
                  {[...day.meals]
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((meal) => (
                      <div key={meal.id} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px dashed rgba(90, 138, 64, 0.1)' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: 12
                        }}>
                          <div style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: 'var(--nc-ink)',
                            fontFamily: 'var(--font-display)'
                          }}>
                            {meal.name}
                          </div>
                          <span style={{
                            fontSize: 11,
                            padding: '3px 10px',
                            borderRadius: 12,
                            background: 'rgba(90, 138, 64, 0.1)',
                            color: 'var(--nc-forest)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px'
                          }}>
                            {MEAL_TYPE_LABELS[meal.meal_type]}
                          </span>
                        </div>
                        {[...meal.options]
                          .sort((a, b) => a.display_order - b.display_order)
                          .map((opt, idx) => (
                            <div key={opt.id} style={{
                              padding: '16px 18px',
                              border: '1px solid rgba(139,115,85,0.1)',
                              borderRadius: 10,
                              marginBottom: 10,
                              background: 'linear-gradient(135deg, #fafaf9 0%, #ffffff 100%)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(90, 138, 64, 0.2)';
                              e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(139,115,85,0.1)';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}
                            >
                              <div style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: 'var(--nc-ink)',
                                marginBottom: 6,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                              }}>
                                {meal.options.length > 1 && (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 22,
                                    height: 22,
                                    borderRadius: 5,
                                    background: 'var(--nc-forest)',
                                    color: 'white',
                                    fontSize: 11,
                                    fontWeight: 700
                                  }}>
                                    {String.fromCharCode(65 + idx)}
                                  </span>
                                )}
                                {opt.name}
                              </div>
                              {opt.description && (
                                <div style={{
                                  fontSize: 13,
                                  color: 'var(--nc-stone)',
                                  fontWeight: 300,
                                  lineHeight: 1.6,
                                  marginBottom: 10
                                }}>
                                  {opt.description}
                                </div>
                              )}
                              {(opt.calories !== null || opt.protein_g !== null || opt.carbs_g !== null || opt.fat_g !== null) && (
                                <div style={{
                                  display: 'flex',
                                  gap: 16,
                                  flexWrap: 'wrap',
                                  paddingTop: 10,
                                  borderTop: '1px solid rgba(90, 138, 64, 0.08)'
                                }}>
                                  {opt.calories !== null && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                      <span style={{ fontSize: 10, color: 'var(--nc-stone)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                        Calorías
                                      </span>
                                      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--nc-ink)', fontFamily: 'var(--font-display)' }}>
                                        {opt.calories}
                                      </span>
                                    </div>
                                  )}
                                  {opt.protein_g !== null && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                      <span style={{ fontSize: 10, color: 'var(--nc-stone)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                        Proteína
                                      </span>
                                      <span style={{ fontSize: 16, fontWeight: 700, color: '#ff6b6b', fontFamily: 'var(--font-display)' }}>
                                        {opt.protein_g}g
                                      </span>
                                    </div>
                                  )}
                                  {opt.carbs_g !== null && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                      <span style={{ fontSize: 10, color: 'var(--nc-stone)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                        Carbos
                                      </span>
                                      <span style={{ fontSize: 16, fontWeight: 700, color: '#ffd93d', fontFamily: 'var(--font-display)' }}>
                                        {opt.carbs_g}g
                                      </span>
                                    </div>
                                  )}
                                  {opt.fat_g !== null && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                      <span style={{ fontSize: 10, color: 'var(--nc-stone)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                        Grasas
                                      </span>
                                      <span style={{ fontSize: 16, fontWeight: 700, color: '#6bcf7f', fontFamily: 'var(--font-display)' }}>
                                        {opt.fat_g}g
                                      </span>
                                    </div>
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
        </div>
      )}

      {activeTab === 'supplements' && (
        <div style={{
          animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {!plan.include_supplements || plan.supplements.length === 0 ? (
            <div style={{
              background: 'linear-gradient(135deg, #fafaf9 0%, #ffffff 100%)',
              border: '1px solid rgba(139,115,85,0.12)',
              borderRadius: 12,
              padding: 48,
              textAlign: 'center',
              color: 'var(--nc-stone)',
              fontWeight: 300,
              fontSize: 14,
            }}>
              <div style={{
                fontSize: 48,
                marginBottom: 16,
                opacity: 0.3
              }}>
                💊
              </div>
              No hay suplementos incluidos en este plan.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[...plan.supplements]
                .sort((a, b) => a.display_order - b.display_order)
                .map((supp, idx) => (
                  <div key={supp.id} style={{
                    animation: `fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s both`
                  }}>
                    <SupplementCard supplement={supp} />
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// ─── Exercise plan view ───────────────────────────────────────────────────────

export function ExercisePlanView({ plan }: { plan: ExercisePlan }) {
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
