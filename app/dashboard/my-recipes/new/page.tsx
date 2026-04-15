'use client';
// frontend/app/dashboard/my-recipes/new/page.tsx

import { useRouter } from 'next/navigation';
import RecipeForm from '@/components/RecipeForm';
import { createRecipe } from '@/lib/recipes';
import type { RecipePayload } from '@/lib/recipes';

export default function NewRecipePage() {
  const router = useRouter();

  const handleSubmit = async (payload: RecipePayload) => {
    const result = await createRecipe(payload);
    router.push(`/dashboard/my-recipes/${result.id}`);
  };

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">Nueva receta</div>
      </div>
      <div className="dash-content">
        <RecipeForm onSubmit={handleSubmit} submitLabel="Crear receta" />
      </div>
    </>
  );
}
