'use client';

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

interface RecipePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: {
    name: string;
    description: string;
    calories: number | null;
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
  }) => void;
}

export default function RecipePickerModal({ isOpen, onClose, onSelect }: RecipePickerModalProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<RecipeCategory | 'all'>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState<number>(1);

  const { recipes, isLoading, error } = useRecipes(
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

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setCategory('all');
      setSelectedRecipe(null);
      setServings(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate adjusted macros based on servings
  const calculateAdjusted = (perServing: number | null): number | null => {
    if (perServing === null) return null;
    return Math.round((perServing * servings) * 10) / 10;
  };

  // Confirm selection with adjusted macros
  const handleConfirm = () => {
    if (!selectedRecipe) return;
    const ratio = servings / selectedRecipe.base_servings;
    onSelect({
      name: `${selectedRecipe.name} (${servings} ${servings === 1 ? 'porción' : 'porciones'})`,
      description: selectedRecipe.description,
      calories: calculateAdjusted(selectedRecipe.calories_per_serving),
      protein_g: calculateAdjusted(selectedRecipe.protein_g_per_serving),
      carbs_g: calculateAdjusted(selectedRecipe.carbs_g_per_serving),
      fat_g: calculateAdjusted(selectedRecipe.fat_g_per_serving),
    });
    onClose();
  };

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
          ) : error ? (
            <div style={{ color: 'var(--nc-terra)', fontSize: 14 }}>Error al cargar recetas</div>
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
                const isSelected = selectedRecipe?.id === recipe.id;
                return (
                  <button
                    key={recipe.id}
                    onClick={() => setSelectedRecipe(recipe)}
                    style={{
                      background: isSelected ? 'var(--nc-forest-pale)' : 'white',
                      border: isSelected
                        ? '2px solid var(--nc-forest)'
                        : '1px solid var(--nc-border)',
                      borderRadius: 10,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(26,51,41,0.1)';
                      }
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
                          marginBottom: 8,
                        }}
                      >
                        {CATEGORY_LABELS[recipe.category]}
                      </div>
                      {/* Macros */}
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          fontSize: 11,
                          color: 'var(--nc-stone)',
                        }}
                      >
                        {recipe.calories_per_serving !== null && (
                          <span>{recipe.calories_per_serving} kcal</span>
                        )}
                        {recipe.protein_g_per_serving !== null && (
                          <span>P:{recipe.protein_g_per_serving}g</span>
                        )}
                        {recipe.carbs_g_per_serving !== null && (
                          <span>C:{recipe.carbs_g_per_serving}g</span>
                        )}
                        {recipe.fat_g_per_serving !== null && (
                          <span>G:{recipe.fat_g_per_serving}g</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Serving adjustment panel (only show when recipe selected) */}
        {selectedRecipe && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--nc-border)',
              background: 'var(--nc-cream)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--nc-forest)' }}>
                {selectedRecipe.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--nc-stone)', marginTop: 4 }}>
                Porción base: {selectedRecipe.base_servings}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label
                style={{ fontSize: 13, fontWeight: 500, color: 'var(--nc-forest)' }}
              >
                Porciones:
              </label>
              <input
                type="number"
                min="0.1"
                max="99.9"
                step="0.1"
                value={servings}
                onChange={e => setServings(Math.max(0.1, Math.min(99.9, parseFloat(e.target.value) || 1)))}
                className="dash-input"
                style={{ width: 80, textAlign: 'center' }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                fontSize: 12,
                color: 'var(--nc-stone)',
              }}
            >
              {selectedRecipe.calories_per_serving !== null && (
                <span>
                  {calculateAdjusted(selectedRecipe.calories_per_serving)} kcal
                </span>
              )}
              {selectedRecipe.protein_g_per_serving !== null && (
                <span>P:{calculateAdjusted(selectedRecipe.protein_g_per_serving)}g</span>
              )}
              {selectedRecipe.carbs_g_per_serving !== null && (
                <span>C:{calculateAdjusted(selectedRecipe.carbs_g_per_serving)}g</span>
              )}
              {selectedRecipe.fat_g_per_serving !== null && (
                <span>G:{calculateAdjusted(selectedRecipe.fat_g_per_serving)}g</span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--nc-border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedRecipe}
            className="btn-primary"
            style={{
              opacity: selectedRecipe ? 1 : 0.5,
              cursor: selectedRecipe ? 'pointer' : 'not-allowed',
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
