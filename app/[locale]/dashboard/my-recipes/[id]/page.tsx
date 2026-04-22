'use client';
// frontend/app/dashboard/my-recipes/[id]/page.tsx

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useRecipe, deleteRecipe } from '@/lib/recipes';
import type { RecipeCategory } from '@/lib/types';

const CATEGORY_KEYS: Record<RecipeCategory, string> = {
  breakfast: 'category_breakfast',
  lunch: 'category_lunch',
  dinner: 'category_dinner',
  snack: 'category_snack',
  other: 'category_other',
};

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations('dashboard.recipes');
  const locale = useLocale();
  const resolvedParams = use(params);
  const router = useRouter();
  const { recipe, isLoading } = useRecipe(resolvedParams.id);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleDelete = async () => {
    if (!recipe) return;
    setDeleting(true);
    try {
      await deleteRecipe(recipe.id);
      router.push('/dashboard/my-recipes');
    } catch (err: any) {
      alert(err?.message ?? t('delete_error'));
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="dash-topbar">
          <div className="dash-topbar-title">Loading...</div>
        </div>
        <div className="dash-content">
          <div style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>{t('loading_recipe')}</div>
        </div>
      </>
    );
  }

  if (!recipe) {
    return (
      <>
        <div className="dash-topbar">
          <div className="dash-topbar-title">{t('recipe_not_found')}</div>
        </div>
        <div className="dash-content">
          <div
            style={{
              background: 'rgba(196,98,45,0.08)',
              color: 'var(--nc-terra)',
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            {t('recipe_not_exist')}
          </div>
          <Link
            href={`/${locale}/dashboard/my-recipes`}
            style={{
              marginTop: 16,
              display: 'inline-block',
              color: 'var(--nc-forest)',
              textDecoration: 'underline',
            }}
          >
            {t('back_to_recipes')}
          </Link>
        </div>
      </>
    );
  }

  const sortedPhotos = [...recipe.photos].sort((a, b) => a.display_order - b.display_order);
  const totalTime = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">{recipe.name}</div>
        <div className="dash-topbar-right">
          <Link href={`/dashboard/my-recipes/${recipe.id}/edit`} className="dash-btn-preview">
            {t('edit_button')}
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="dash-btn-preview"
            style={{ color: 'var(--nc-terra)', borderColor: 'var(--nc-terra)' }}
          >
            {t('delete_button')}
          </button>
        </div>
      </div>

      <div className="dash-content" style={{ maxWidth: 900 }}>
        {/* Photo carousel */}
        {sortedPhotos.length > 0 && (
          <div
            style={{
              marginBottom: 32,
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid var(--nc-border)',
            }}
          >
            <div
              style={{
                height: 400,
                background: `url(${sortedPhotos[currentPhotoIndex].photo_url}) center/cover`,
                position: 'relative',
              }}
            >
              {sortedPhotos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentPhotoIndex(
                        (currentPhotoIndex - 1 + sortedPhotos.length) % sortedPhotos.length,
                      )
                    }
                    style={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 20,
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPhotoIndex((currentPhotoIndex + 1) % sortedPhotos.length)
                    }
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 20,
                    }}
                  >
                    ›
                  </button>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 8,
                    }}
                  >
                    {sortedPhotos.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPhotoIndex(idx)}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background:
                            idx === currentPhotoIndex
                              ? 'white'
                              : 'rgba(255,255,255,0.5)',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Basic info */}
        <div className="dash-section">
          <div className="dash-section-body">
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--nc-terra)',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 500,
                }}
              >
                {t(CATEGORY_KEYS[recipe.category])}
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  color: 'var(--nc-forest)',
                  fontWeight: 500,
                  marginBottom: 8,
                }}
              >
                {recipe.name}
              </h2>
              {recipe.description && (
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--nc-stone)',
                    fontWeight: 300,
                    lineHeight: 1.6,
                  }}
                >
                  {recipe.description}
                </p>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 24,
                flexWrap: 'wrap',
                paddingTop: 16,
                borderTop: '1px solid var(--nc-border)',
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--nc-stone)',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {t('servings_label')}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--nc-ink)',
                  }}
                >
                  {recipe.base_servings}
                </div>
              </div>
              {recipe.prep_time_minutes !== null && recipe.prep_time_minutes > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--nc-stone)',
                      marginBottom: 4,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {t('prep_label')}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: 'var(--nc-ink)',
                    }}
                  >
                    {recipe.prep_time_minutes} min
                  </div>
                </div>
              )}
              {recipe.cook_time_minutes !== null && recipe.cook_time_minutes > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--nc-stone)',
                      marginBottom: 4,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {t('cook_label')}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: 'var(--nc-ink)',
                    }}
                  >
                    {recipe.cook_time_minutes} {t('min_unit')}
                  </div>
                </div>
              )}
              {totalTime > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--nc-stone)',
                      marginBottom: 4,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {t('total_label')}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: 'var(--nc-ink)',
                    }}
                  >
                    {totalTime} {t('min_unit')}
                  </div>
                </div>
              )}
            </div>

            {/* Nutrition */}
            {(recipe.calories_per_serving !== null ||
              recipe.protein_g_per_serving !== null ||
              recipe.carbs_g_per_serving !== null ||
              recipe.fat_g_per_serving !== null) && (
              <div
                style={{
                  paddingTop: 16,
                  borderTop: '1px solid var(--nc-border)',
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--nc-stone)',
                    marginBottom: 10,
                    fontWeight: 500,
                  }}
                >
                  {t('per_serving')}
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {recipe.calories_per_serving !== null && (
                    <div style={{ fontSize: 13, color: 'var(--nc-ink)' }}>
                      <strong>{recipe.calories_per_serving}</strong> kcal
                    </div>
                  )}
                  {recipe.protein_g_per_serving !== null && (
                    <div style={{ fontSize: 13, color: 'var(--nc-ink)' }}>
                      Prot <strong>{recipe.protein_g_per_serving}g</strong>
                    </div>
                  )}
                  {recipe.carbs_g_per_serving !== null && (
                    <div style={{ fontSize: 13, color: 'var(--nc-ink)' }}>
                      HC <strong>{recipe.carbs_g_per_serving}g</strong>
                    </div>
                  )}
                  {recipe.fat_g_per_serving !== null && (
                    <div style={{ fontSize: 13, color: 'var(--nc-ink)' }}>
                      Grasas <strong>{recipe.fat_g_per_serving}g</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {recipe.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {recipe.tags.map(tag => (
                  <span
                    key={tag.id}
                    style={{
                      fontSize: 11,
                      padding: '4px 10px',
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

        {/* Ingredients */}
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">{t('ingredients_section')}</div>
          </div>
          <div className="dash-section-body">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[...recipe.ingredients]
                .sort((a, b) => a.display_order - b.display_order)
                .map(ing => (
                  <li
                    key={ing.id}
                    style={{
                      padding: '8px 0',
                      borderBottom: '1px solid var(--nc-border)',
                      fontSize: 14,
                      color: 'var(--nc-ink)',
                    }}
                  >
                    <strong>
                      {ing.amount} {ing.unit}
                    </strong>{' '}
                    {ing.ingredient_name}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 32,
              maxWidth: 420,
              margin: 16,
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 500,
                color: 'var(--nc-forest)',
                marginBottom: 12,
              }}
            >
              {t('delete_recipe_modal_title')}
            </h3>
            <p
              style={{
                fontSize: 14,
                color: 'var(--nc-stone)',
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              {t('delete_recipe_modal_text')}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="dash-btn-draft"
                disabled={deleting}
              >
                {t('delete_recipe_cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  height: 38,
                  padding: '0 26px',
                  background: 'var(--nc-terra)',
                  border: 'none',
                  borderRadius: 6,
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'white',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? t('deleting') : t('delete_recipe_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
