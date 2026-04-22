'use client';
// frontend/app/dashboard/my-recipes/[id]/edit/page.tsx

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import RecipeForm from '@/components/RecipeForm';
import { useRecipe, updateRecipe } from '@/lib/recipes';
import type { RecipePayload } from '@/lib/recipes';

export default function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations('dashboard.recipes');
  const locale = useLocale();
  const resolvedParams = use(params);
  const router = useRouter();
  const { recipe, isLoading } = useRecipe(resolvedParams.id);

  const handleSubmit = async (payload: RecipePayload) => {
    if (!recipe) return;
    await updateRecipe(recipe.id, payload);
    router.push(`/dashboard/my-recipes/${recipe.id}`);
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

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">Edit recipe</div>
      </div>
      <div className="dash-content">
        <RecipeForm
          initialData={recipe}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
        />
      </div>
    </>
  );
}
