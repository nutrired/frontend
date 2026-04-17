'use client';
// frontend/app/dashboard/my-exercises/new/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createExerciseTemplate } from '@/lib/exercise-templates';
import type { ExerciseCategory } from '@/lib/types';

const CATEGORY_OPTIONS: { value: ExerciseCategory; label: string }[] = [
  { value: 'strength', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibilidad' },
  { value: 'balance', label: 'Equilibrio' },
];

export default function NewExercisePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('strength');
  const [muscleGroups, setMuscleGroups] = useState('');
  const [equipment, setEquipment] = useState('');
  const [instructions, setInstructions] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createExerciseTemplate({
        name: name.trim(),
        description: description.trim(),
        category,
        muscle_groups: muscleGroups.trim(),
        equipment: equipment.trim(),
        instructions: instructions.trim(),
        demo_video_url: demoVideoUrl.trim() || null,
      });
      router.push(`/dashboard/my-exercises/${result.id}`);
    } catch (err: any) {
      setError(err.message || 'Error al crear ejercicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nc-container">
      <div className="nc-topbar">
        <h1 className="text-2xl font-bold">Nuevo ejercicio</h1>
        <button
          onClick={() => router.back()}
          className="nc-btn-secondary"
        >
          Cancelar
        </button>
      </div>

      {error && (
        <div className="nc-card bg-red-50 border-red-200 text-red-700 p-4 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="nc-card max-w-3xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              className="dash-input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Breve descripción del ejercicio..."
              className="dash-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
              className="dash-input w-full"
              required
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Grupos musculares</label>
            <input
              type="text"
              value={muscleGroups}
              onChange={(e) => setMuscleGroups(e.target.value)}
              maxLength={500}
              placeholder="ej. Pectorales, Tríceps, Core"
              className="dash-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Equipamiento</label>
            <input
              type="text"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              maxLength={500}
              placeholder="ej. Barra, Banco plano"
              className="dash-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Instrucciones</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              maxLength={5000}
              rows={6}
              placeholder="Instrucciones paso a paso..."
              className="dash-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL de video de demostración</label>
            <input
              type="url"
              value={demoVideoUrl}
              onChange={(e) => setDemoVideoUrl(e.target.value)}
              maxLength={500}
              placeholder="https://youtube.com/watch?v=..."
              className="dash-input w-full"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="nc-btn-primary flex-1"
            >
              {loading ? 'Guardando...' : 'Guardar ejercicio'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="nc-btn-secondary flex-1"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
