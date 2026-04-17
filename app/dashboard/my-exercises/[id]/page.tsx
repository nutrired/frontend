'use client';
// frontend/app/dashboard/my-exercises/[id]/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExerciseTemplate, deleteExerciseTemplate, uploadTemplatePhoto, deleteTemplatePhoto, setPrimaryTemplatePhoto, updateExerciseTemplate } from '@/lib/exercise-templates';
import type { ExerciseCategory } from '@/lib/types';

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  strength: 'Fuerza',
  cardio: 'Cardio',
  flexibility: 'Flexibilidad',
  balance: 'Equilibrio',
};

const CATEGORY_OPTIONS: { value: ExerciseCategory; label: string }[] = [
  { value: 'strength', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibilidad' },
  { value: 'balance', label: 'Equilibrio' },
];

export default function ExerciseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { template, isLoading, error, mutate } = useExerciseTemplate(params.id);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('strength');
  const [muscleGroups, setMuscleGroups] = useState('');
  const [equipment, setEquipment] = useState('');
  const [instructions, setInstructions] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');

  const handleEdit = () => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setCategory(template.category);
      setMuscleGroups(template.muscle_groups);
      setEquipment(template.equipment);
      setInstructions(template.instructions);
      setDemoVideoUrl(template.demo_video_url || '');
      setEditMode(true);
    }
  };

  const handleSave = async () => {
    if (!template) return;
    setActionLoading(true);
    try {
      await updateExerciseTemplate(template.id, {
        name: name.trim(),
        description: description.trim(),
        category,
        muscle_groups: muscleGroups.trim(),
        equipment: equipment.trim(),
        instructions: instructions.trim(),
        demo_video_url: demoVideoUrl.trim() || null,
      });
      await mutate();
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!template) return;
    setActionLoading(true);
    try {
      await deleteExerciseTemplate(template.id);
      router.push('/dashboard/my-exercises');
    } catch (err) {
      console.error('Failed to delete:', err);
      setActionLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!template || !e.target.files?.[0]) return;
    setActionLoading(true);
    try {
      await uploadTemplatePhoto(template.id, e.target.files[0]);
      await mutate();
    } catch (err) {
      console.error('Failed to upload photo:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePhotoDelete = async (photoId: string) => {
    if (!template) return;
    setActionLoading(true);
    try {
      await deleteTemplatePhoto(template.id, photoId);
      await mutate();
    } catch (err) {
      console.error('Failed to delete photo:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    if (!template) return;
    setActionLoading(true);
    try {
      await setPrimaryTemplatePhoto(template.id, photoId);
      await mutate();
    } catch (err) {
      console.error('Failed to set primary:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) return <div className="nc-container text-center py-12">Cargando...</div>;
  if (error || !template) return <div className="nc-container text-center py-12 text-red-600">Error al cargar ejercicio</div>;

  return (
    <div className="nc-container">
      <div className="nc-topbar">
        <h1 className="text-2xl font-bold">{editMode ? 'Editar ejercicio' : template.name}</h1>
        <div className="flex gap-2">
          {!editMode && (
            <>
              <button onClick={handleEdit} className="nc-btn-primary">Editar</button>
              <button onClick={() => setDeleteConfirm(true)} className="nc-btn-secondary text-red-600">Eliminar</button>
            </>
          )}
          {editMode && (
            <>
              <button onClick={handleSave} disabled={actionLoading} className="nc-btn-primary">
                {actionLoading ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setEditMode(false)} className="nc-btn-secondary">Cancelar</button>
            </>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="nc-card max-w-md">
            <h3 className="text-lg font-bold mb-4">¿Eliminar ejercicio?</h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. Los planes que usan este ejercicio no se verán afectados.
            </p>
            <div className="flex gap-4">
              <button onClick={handleDelete} disabled={actionLoading} className="nc-btn-primary bg-red-600 flex-1">
                {actionLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
              <button onClick={() => setDeleteConfirm(false)} className="nc-btn-secondary flex-1">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {editMode ? (
            <div className="nc-card space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="dash-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="dash-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Categoría *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as ExerciseCategory)} className="dash-input w-full">
                  {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Grupos musculares</label>
                <input type="text" value={muscleGroups} onChange={(e) => setMuscleGroups(e.target.value)} className="dash-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Equipamiento</label>
                <input type="text" value={equipment} onChange={(e) => setEquipment(e.target.value)} className="dash-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Instrucciones</label>
                <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={6} className="dash-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL de video</label>
                <input type="url" value={demoVideoUrl} onChange={(e) => setDemoVideoUrl(e.target.value)} className="dash-input w-full" />
              </div>
            </div>
          ) : (
            <div className="nc-card space-y-6">
              <div>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">{CATEGORY_LABELS[template.category]}</span>
              </div>
              {template.description && <p className="text-gray-700">{template.description}</p>}
              {template.muscle_groups && (
                <div>
                  <h3 className="font-semibold mb-2">Grupos musculares</h3>
                  <p className="text-gray-700">{template.muscle_groups}</p>
                </div>
              )}
              {template.equipment && (
                <div>
                  <h3 className="font-semibold mb-2">Equipamiento</h3>
                  <p className="text-gray-700">{template.equipment}</p>
                </div>
              )}
              {template.instructions && (
                <div>
                  <h3 className="font-semibold mb-2">Instrucciones</h3>
                  <p className="text-gray-700 whitespace-pre-line">{template.instructions}</p>
                </div>
              )}
              {template.demo_video_url && (
                <div>
                  <h3 className="font-semibold mb-2">Video de demostración</h3>
                  <a href={template.demo_video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Ver video
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="nc-card">
          <h3 className="font-semibold mb-4">Fotos</h3>
          {template.photos.length < 10 && (
            <label className="block mb-4">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400">
                <span className="text-gray-600">Subir foto</span>
              </div>
            </label>
          )}
          <div className="space-y-4">
            {template.photos.map(photo => (
              <div key={photo.id} className="relative">
                <img src={photo.photo_url} alt="" className="w-full rounded-lg" />
                {photo.is_primary && <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Principal</span>}
                <div className="flex gap-2 mt-2">
                  {!photo.is_primary && (
                    <button onClick={() => handleSetPrimary(photo.id)} className="nc-btn-secondary text-xs flex-1">Marcar principal</button>
                  )}
                  <button onClick={() => handlePhotoDelete(photo.id)} className="nc-btn-secondary text-xs text-red-600 flex-1">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
