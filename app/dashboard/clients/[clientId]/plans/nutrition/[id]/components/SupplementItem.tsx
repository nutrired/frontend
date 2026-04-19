'use client';

import React from 'react';
import type { SupplementPayload } from '@/lib/plans';
import type { SupplementTiming } from '@/lib/types';

const TIMING_OPTIONS: { value: SupplementTiming; label: string }[] = [
  { value: 'morning', label: 'Por la mañana' },
  { value: 'with_breakfast', label: 'Con el desayuno' },
  { value: 'pre_workout', label: 'Pre-entreno' },
  { value: 'post_workout', label: 'Post-entreno' },
  { value: 'with_lunch', label: 'Con el almuerzo' },
  { value: 'afternoon', label: 'Por la tarde' },
  { value: 'with_dinner', label: 'Con la cena' },
  { value: 'before_bed', label: 'Antes de dormir' },
];

interface Props {
  supplement: SupplementPayload;
  index: number;
  onUpdate: (index: number, updates: Partial<SupplementPayload>) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function SupplementItem({
  supplement,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: Props) {
  const [showMacros, setShowMacros] = React.useState(
    !!(supplement.calories || supplement.protein_g || supplement.carbs_g || supplement.fat_g)
  );

  return (
    <div
      style={{
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        padding: '1rem',
        background: 'white',
      }}
    >
      {/* Header with move/delete buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={isFirst}
            style={{ fontSize: '12px', padding: '4px 8px' }}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={isLast}
            style={{ fontSize: '12px', padding: '4px 8px' }}
          >
            ↓
          </button>
        </div>
        <button
          type="button"
          onClick={() => onDelete(index)}
          style={{ color: 'red', fontSize: '12px' }}
        >
          Eliminar
        </button>
      </div>

      {/* Name and Brand */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          type="text"
          placeholder="Nombre del suplemento"
          value={supplement.name}
          onChange={(e) => onUpdate(index, { name: e.target.value })}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <input
          type="text"
          placeholder="Marca (opcional)"
          value={supplement.brand || ''}
          onChange={(e) => onUpdate(index, { brand: e.target.value || null })}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>

      {/* Dosage and Timing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          type="text"
          placeholder="Dosis"
          value={supplement.dosage}
          onChange={(e) => onUpdate(index, { dosage: e.target.value })}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <select
          value={supplement.timing}
          onChange={(e) => onUpdate(index, { timing: e.target.value as SupplementTiming })}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          {TIMING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <textarea
        placeholder="Notas adicionales (opcional)"
        value={supplement.notes || ''}
        onChange={(e) => onUpdate(index, { notes: e.target.value || null })}
        rows={2}
        style={{
          width: '100%',
          padding: '8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginBottom: '0.5rem',
        }}
      />

      {/* Macros toggle */}
      <button
        type="button"
        onClick={() => setShowMacros(!showMacros)}
        style={{ fontSize: '12px', color: 'var(--nc-forest)', marginBottom: '0.5rem' }}
      >
        {showMacros ? '▼' : '▶'} Valores nutricionales (opcional)
      </button>

      {showMacros && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          <input
            type="number"
            placeholder="Cal"
            value={supplement.calories || ''}
            onChange={(e) => onUpdate(index, { calories: e.target.value ? parseInt(e.target.value) : null })}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="number"
            step="0.1"
            placeholder="Prot (g)"
            value={supplement.protein_g || ''}
            onChange={(e) => onUpdate(index, { protein_g: e.target.value ? parseFloat(e.target.value) : null })}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="number"
            step="0.1"
            placeholder="Carbs (g)"
            value={supplement.carbs_g || ''}
            onChange={(e) => onUpdate(index, { carbs_g: e.target.value ? parseFloat(e.target.value) : null })}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="number"
            step="0.1"
            placeholder="Fat (g)"
            value={supplement.fat_g || ''}
            onChange={(e) => onUpdate(index, { fat_g: e.target.value ? parseFloat(e.target.value) : null })}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
      )}
    </div>
  );
}
