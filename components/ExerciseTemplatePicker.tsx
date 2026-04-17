'use client';

import { useState } from 'react';
import { useExerciseTemplates } from '@/lib/exercise-templates';
import type { ExerciseCategory, ExerciseTemplate } from '@/lib/types';

const CATEGORY_LABELS: Record<ExerciseCategory | 'all', string> = {
  all: 'Todas',
  strength: 'Fuerza',
  cardio: 'Cardio',
  flexibility: 'Flexibilidad',
  balance: 'Equilibrio',
};

const CATEGORY_COLORS: Record<ExerciseCategory, { bg: string; text: string }> = {
  strength: { bg: '#dcfce7', text: '#166534' },
  cardio: { bg: '#ffedd5', text: '#9a3412' },
  flexibility: { bg: '#dbeafe', text: '#1e40af' },
  balance: { bg: '#f3e8ff', text: '#6b21a8' },
};

interface ExerciseTemplatePickerProps {
  onSelect: (template: ExerciseTemplate) => void;
  onClose: () => void;
}

export default function ExerciseTemplatePicker({ onSelect, onClose }: ExerciseTemplatePickerProps) {
  const [category, setCategory] = useState<ExerciseCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const { templates, isLoading } = useExerciseTemplates(
    category === 'all' ? undefined : category,
    search || undefined,
  );

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          maxWidth: 800,
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--nc-ink)' }}>
            Seleccionar ejercicio de la biblioteca
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 24,
              color: 'var(--nc-stone)',
              cursor: 'pointer',
              padding: 0,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Buscar ejercicios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dash-input"
            style={{ flex: 1 }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExerciseCategory | 'all')}
            className="dash-input"
            style={{ width: 150 }}
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--nc-stone)' }}>
            Cargando ejercicios...
          </div>
        ) : templates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--nc-stone)' }}>
            {search || category !== 'all'
              ? 'No se encontraron ejercicios con esos filtros.'
              : 'Aún no tienes ejercicios guardados. Créalos desde "Mis ejercicios".'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {templates.map((template) => {
              const primaryPhoto = template.photos.find(p => p.is_primary);
              return (
                <div
                  key={template.id}
                  onClick={() => onSelect(template)}
                  style={{
                    border: '1px solid var(--nc-border)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {primaryPhoto ? (
                    <img
                      src={primaryPhoto.photo_url}
                      alt={template.name}
                      style={{ width: '100%', height: 140, objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: 140,
                        background:
                          template.category === 'strength' ? '#f0fdf4' :
                          template.category === 'cardio' ? '#fff7ed' :
                          template.category === 'flexibility' ? '#eff6ff' :
                          '#faf5ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="40" cy="26" r="16" fill="rgba(139,115,85,0.12)" />
                        <rect x="35" y="42" width="10" height="22" rx="1" fill="rgba(139,115,85,0.12)" />
                      </svg>
                    </div>
                  )}
                  <div style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--nc-ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {template.name}
                      </h4>
                      <span
                        style={{
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: CATEGORY_COLORS[template.category].bg,
                          color: CATEGORY_COLORS[template.category].text,
                          whiteSpace: 'nowrap',
                          marginLeft: 8,
                        }}
                      >
                        {CATEGORY_LABELS[template.category]}
                      </span>
                    </div>
                    {template.muscle_groups && (
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--nc-stone)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {template.muscle_groups}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
