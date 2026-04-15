'use client';
// frontend/app/dashboard/my-recipes/page.tsx

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRecipes } from '@/lib/recipes';
import type { RecipeCategory } from '@/lib/types';

const CATEGORY_LABELS: Record<RecipeCategory | 'all', string> = {
  all: 'Todas',
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
  beverage: 'Bebida',
  dessert: 'Postre',
};

export default function MyRecipesPage() {
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

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">Mis recetas</div>
        <div className="dash-topbar-right">
          <Link href="/dashboard/my-recipes/new" className="dash-btn-publish">
            Nueva receta
          </Link>
        </div>
      </div>

      <div className="dash-content" style={{ maxWidth: 1200 }}>
        {/* Filters */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar recetas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="dash-input"
            style={{ width: 280 }}
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value as RecipeCategory | 'all')}
            className="dash-input"
            style={{ width: 180 }}
          >
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>Cargando recetas...</div>
        ) : recipes.length === 0 ? (
          <div
            style={{
              background: 'white',
              border: '1px solid rgba(139,115,85,0.12)',
              borderRadius: 8,
              padding: 48,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: 'var(--nc-stone)',
                fontWeight: 300,
                marginBottom: 16,
              }}
            >
              {debouncedSearch || category !== 'all'
                ? 'No se encontraron recetas con esos filtros.'
                : 'Aún no tienes recetas. Crea tu primera receta para comenzar.'}
            </div>
            {!debouncedSearch && category === 'all' && (
              <Link href="/dashboard/my-recipes/new" className="dash-btn-publish">
                Crear receta
              </Link>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {recipes.map(recipe => {
              const primaryPhoto = recipe.photos.find(p => p.is_primary);
              const totalTime =
                (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

              return (
                <Link
                  key={recipe.id}
                  href={`/dashboard/my-recipes/${recipe.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      background: 'white',
                      border: '1px solid var(--nc-border)',
                      borderRadius: 12,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow =
                        '0 12px 32px rgba(26,51,41,0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Photo */}
                    <div
                      style={{
                        height: 180,
                        background: primaryPhoto
                          ? `url(${primaryPhoto.photo_url}) center/cover`
                          : 'linear-gradient(135deg, var(--nc-forest-pale), var(--nc-cream))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {!primaryPhoto && (
                        <span
                          style={{
                            fontSize: 48,
                            opacity: 0.3,
                          }}
                        >
                          🍽️
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div style={{ padding: '16px 18px' }}>
                      <div
                        style={{
                          fontSize: 16,
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
                          fontSize: 11,
                          color: 'var(--nc-terra)',
                          marginBottom: 10,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          fontWeight: 500,
                        }}
                      >
                        {CATEGORY_LABELS[recipe.category]}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: 12,
                          fontSize: 12,
                          color: 'var(--nc-stone)',
                          marginBottom: 10,
                        }}
                      >
                        <span>
                          {recipe.base_servings}{' '}
                          {recipe.base_servings === 1 ? 'porción' : 'porciones'}
                        </span>
                        {totalTime > 0 && <span>{totalTime} min</span>}
                      </div>

                      {recipe.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {recipe.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag.id}
                              style={{
                                fontSize: 10,
                                padding: '3px 8px',
                                borderRadius: 20,
                                background: 'var(--nc-forest-pale)',
                                color: 'var(--nc-forest)',
                                border: '1px solid rgba(26,51,41,0.12)',
                              }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
