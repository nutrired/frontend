'use client';
// frontend/components/RecipePicker.tsx

import { useState, useEffect } from 'react';
import { useRecipes } from '@/lib/recipes';
import type { Recipe, RecipeCategory } from '@/lib/types';

const CATEGORY_LABELS: Record<RecipeCategory | 'all', string> = {
  all: 'Todas',
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
  beverage: 'Bebida',
  dessert: 'Postre',
};

interface RecipePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
}

export default function RecipePicker({ isOpen, onClose, onSelect }: RecipePickerProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<RecipeCategory | 'all'>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { recipes, isLoading } = useRecipes(
    category === 'all' ? undefined : category,
    debouncedSearch || undefined,
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          width: '100%',
          maxWidth: 900,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--nc-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 500,
              color: 'var(--nc-forest)',
            }}
          >
            Seleccionar receta
          </h3>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 20,
              color: 'var(--nc-stone)',
            }}
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--nc-border)',
            display: 'flex',
            gap: 10,
          }}
        >
          <input
            type="text"
            placeholder="Buscar recetas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="dash-input"
            style={{ flex: 1 }}
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value as RecipeCategory | 'all')}
            className="dash-input"
            style={{ width: 160 }}
          >
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Recipe grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
          }}
        >
          {isLoading ? (
            <div style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>Cargando recetas...</div>
          ) : recipes.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 48,
                color: 'var(--nc-stone)',
                fontSize: 14,
              }}
            >
              {debouncedSearch || category !== 'all'
                ? 'No se encontraron recetas con esos filtros.'
                : 'No tienes recetas aún.'}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              {recipes.map(recipe => {
                const primaryPhoto = recipe.photos.find(p => p.is_primary);
                return (
                  <button
                    key={recipe.id}
                    onClick={() => onSelect(recipe)}
                    style={{
                      background: 'white',
                      border: '1px solid var(--nc-border)',
                      borderRadius: 10,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(26,51,41,0.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Photo */}
                    <div
                      style={{
                        height: 140,
                        background: primaryPhoto
                          ? `url(${primaryPhoto.photo_url}) center/cover`
                          : 'linear-gradient(135deg, var(--nc-forest-pale), var(--nc-cream))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {!primaryPhoto && (
                        <span style={{ fontSize: 36, opacity: 0.3 }}>🍽️</span>
                      )}
                    </div>

                    {/* Body */}
                    <div style={{ padding: '12px 14px' }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'var(--nc-forest)',
                          marginBottom: 4,
                          lineHeight: 1.3,
                        }}
                      >
                        {recipe.name}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: 'var(--nc-terra)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          fontWeight: 500,
                        }}
                      >
                        {CATEGORY_LABELS[recipe.category]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
