'use client';

import type { NutritionPlanSupplement, SupplementTiming } from '@/lib/types';

const TIMING_LABELS: Record<SupplementTiming, string> = {
  morning: 'Por la mañana',
  with_breakfast: 'Con el desayuno',
  pre_workout: 'Pre-entreno',
  post_workout: 'Post-entreno',
  with_lunch: 'Con el almuerzo',
  afternoon: 'Por la tarde',
  with_dinner: 'Con la cena',
  before_bed: 'Antes de dormir',
};

interface Props {
  supplement: NutritionPlanSupplement;
}

export default function SupplementCard({ supplement }: Props) {
  const hasNutrition =
    supplement.calories || supplement.protein_g || supplement.carbs_g || supplement.fat_g;

  return (
    <div
      style={{
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        padding: '1rem',
        background: 'white',
      }}
    >
      <div style={{ marginBottom: '0.5rem' }}>
        <strong style={{ fontSize: '16px' }}>{supplement.name}</strong>
        {supplement.brand && (
          <span style={{ color: 'var(--nc-stone)', fontSize: '14px', marginLeft: '8px' }}>
            ({supplement.brand})
          </span>
        )}
      </div>

      <div style={{ fontSize: '14px', color: '#333', marginBottom: '0.25rem' }}>
        <strong>Dosis:</strong> {supplement.dosage}
      </div>

      <div style={{ fontSize: '14px', color: '#333', marginBottom: '0.25rem' }}>
        <strong>Cuándo:</strong> {TIMING_LABELS[supplement.timing]}
      </div>

      {supplement.notes && (
        <div
          style={{
            fontSize: '14px',
            color: 'var(--nc-stone)',
            marginTop: '0.5rem',
            fontStyle: 'italic',
          }}
        >
          {supplement.notes}
        </div>
      )}

      {hasNutrition && (
        <div
          style={{
            marginTop: '0.5rem',
            display: 'flex',
            gap: '1rem',
            fontSize: '12px',
            color: '#666',
          }}
        >
          {supplement.calories && <span>{supplement.calories} cal</span>}
          {supplement.protein_g && <span>{supplement.protein_g}g prot</span>}
          {supplement.carbs_g && <span>{supplement.carbs_g}g carbs</span>}
          {supplement.fat_g && <span>{supplement.fat_g}g grasas</span>}
        </div>
      )}
    </div>
  );
}
