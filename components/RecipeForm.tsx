'use client';
// frontend/components/RecipeForm.tsx

import { useState, useCallback, ChangeEvent, FormEvent, useRef, DragEvent } from 'react';
import type { Recipe, RecipeCategory, RecipeIngredient, Tag, RecipePhoto } from '@/lib/types';
import type { RecipePayload, RecipeIngredientPayload } from '@/lib/recipes';
import { autocompleteTags, uploadRecipePhoto, deleteRecipePhoto, setPrimaryPhoto } from '@/lib/recipes';

const CATEGORIES: { value: RecipeCategory; label: string }[] = [
  { value: 'breakfast', label: 'Desayuno' },
  { value: 'lunch', label: 'Almuerzo' },
  { value: 'dinner', label: 'Cena' },
  { value: 'snack', label: 'Snack' },
  { value: 'beverage', label: 'Bebida' },
  { value: 'dessert', label: 'Postre' },
];

interface IngredientRow {
  tempId: string;
  amount: string;
  unit: string;
  ingredient_name: string;
}

interface RecipeFormProps {
  initialData?: Recipe | null;
  onSubmit: (payload: RecipePayload) => Promise<void>;
  submitLabel?: string;
}

export default function RecipeForm({
  initialData,
  onSubmit,
  submitLabel = 'Guardar receta',
}: RecipeFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [category, setCategory] = useState<RecipeCategory>(initialData?.category ?? 'lunch');
  const [baseServings, setBaseServings] = useState(String(initialData?.base_servings ?? 1));
  const [prepTime, setPrepTime] = useState(
    initialData?.prep_time_minutes !== null && initialData?.prep_time_minutes !== undefined
      ? String(initialData.prep_time_minutes)
      : '',
  );
  const [cookTime, setCookTime] = useState(
    initialData?.cook_time_minutes !== null && initialData?.cook_time_minutes !== undefined
      ? String(initialData.cook_time_minutes)
      : '',
  );
  const [calories, setCalories] = useState(
    initialData?.calories_per_serving !== null && initialData?.calories_per_serving !== undefined
      ? String(initialData.calories_per_serving)
      : '',
  );
  const [protein, setProtein] = useState(
    initialData?.protein_g_per_serving !== null && initialData?.protein_g_per_serving !== undefined
      ? String(initialData.protein_g_per_serving)
      : '',
  );
  const [carbs, setCarbs] = useState(
    initialData?.carbs_g_per_serving !== null && initialData?.carbs_g_per_serving !== undefined
      ? String(initialData.carbs_g_per_serving)
      : '',
  );
  const [fat, setFat] = useState(
    initialData?.fat_g_per_serving !== null && initialData?.fat_g_per_serving !== undefined
      ? String(initialData.fat_g_per_serving)
      : '',
  );

  const [ingredients, setIngredients] = useState<IngredientRow[]>(() => {
    if (initialData && initialData.ingredients.length > 0) {
      return initialData.ingredients
        .sort((a, b) => a.display_order - b.display_order)
        .map(ing => ({
          tempId: ing.id,
          amount: String(ing.amount),
          unit: ing.unit,
          ingredient_name: ing.ingredient_name,
        }));
    }
    return [{ tempId: crypto.randomUUID(), amount: '', unit: '', ingredient_name: '' }];
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags.map(t => t.name) ?? [],
  );
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);

  // Photo state
  const [photos, setPhotos] = useState<RecipePhoto[]>(initialData?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ─── Ingredients ──────────────────────────────────────────────────────────────

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { tempId: crypto.randomUUID(), amount: '', unit: '', ingredient_name: '' },
    ]);
  };

  const removeIngredient = (tempId: string) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter(ing => ing.tempId !== tempId));
  };

  const updateIngredient = (tempId: string, field: keyof IngredientRow, value: string) => {
    setIngredients(
      ingredients.map(ing => (ing.tempId === tempId ? { ...ing, [field]: value } : ing)),
    );
  };

  // ─── Tags ─────────────────────────────────────────────────────────────────────

  const handleTagInputChange = async (value: string) => {
    setTagInput(value);
    if (value.trim().length >= 2) {
      try {
        const results = await autocompleteTags(value.trim());
        setTagSuggestions(results);
      } catch {
        setTagSuggestions([]);
      }
    } else {
      setTagSuggestions([]);
    }
  };

  const addTag = (tagName: string) => {
    const normalized = tagName.trim().toLowerCase();
    if (!normalized) return;
    if (selectedTags.includes(normalized)) return;
    setSelectedTags([...selectedTags, normalized]);
    setTagInput('');
    setTagSuggestions([]);
  };

  const removeTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tagName));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    }
  };

  // ─── Photo Upload ─────────────────────────────────────────────────────────────

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0 || !initialData) return;

    const recipeId = initialData.id;
    const currentCount = photos.length;
    const remainingSlots = 10 - currentCount;

    if (remainingSlots <= 0) {
      setError('Has alcanzado el límite de 10 fotos por receta.');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);
    setUploadProgress(`Subiendo ${filesToUpload.length} foto(s)...`);
    setError('');

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        setUploadProgress(`Subiendo foto ${i + 1} de ${filesToUpload.length}...`);

        // Get presigned URL from backend
        const { photo, presigned_url } = await uploadRecipePhoto(recipeId, file.type);

        // Upload file directly to R2
        const uploadResponse = await fetch(presigned_url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Error al subir foto ${i + 1}`);
        }

        // Add photo to local state
        setPhotos(prev => [...prev, photo]);
      }
      setUploadProgress('');
    } catch (err: any) {
      setError(err?.message ?? 'Error al subir las fotos.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!initialData) return;
    if (!confirm('¿Eliminar esta foto?')) return;

    try {
      await deleteRecipePhoto(initialData.id, photoId);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (err: any) {
      setError(err?.message ?? 'Error al eliminar la foto.');
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    if (!initialData) return;

    try {
      await setPrimaryPhoto(initialData.id, photoId);
      setPhotos(prev =>
        prev.map(p => ({
          ...p,
          is_primary: p.id === photoId,
        }))
      );
    } catch (err: any) {
      setError(err?.message ?? 'Error al establecer foto principal.');
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('El nombre de la receta es obligatorio.');
      return;
    }
    const servings = parseInt(baseServings, 10);
    if (isNaN(servings) || servings < 1) {
      setError('Las porciones deben ser un número mayor a 0.');
      return;
    }

    const ingredientPayloads: RecipeIngredientPayload[] = [];
    for (let i = 0; i < ingredients.length; i++) {
      const ing = ingredients[i];
      if (!ing.ingredient_name.trim()) continue;
      const amount = parseFloat(ing.amount);
      if (isNaN(amount) || amount <= 0) {
        setError(`Ingrediente ${i + 1}: la cantidad debe ser un número positivo.`);
        return;
      }
      if (!ing.unit.trim()) {
        setError(`Ingrediente ${i + 1}: la unidad es obligatoria.`);
        return;
      }
      ingredientPayloads.push({
        amount,
        unit: ing.unit.trim(),
        ingredient_name: ing.ingredient_name.trim(),
        display_order: i,
      });
    }

    if (ingredientPayloads.length === 0) {
      setError('Debes agregar al menos un ingrediente.');
      return;
    }

    const payload: RecipePayload = {
      name: name.trim(),
      description: description.trim(),
      category,
      base_servings: servings,
      prep_time_minutes: prepTime ? parseInt(prepTime, 10) : null,
      cook_time_minutes: cookTime ? parseInt(cookTime, 10) : null,
      calories_per_serving: calories ? parseInt(calories, 10) : null,
      protein_g_per_serving: protein ? parseFloat(protein) : null,
      carbs_g_per_serving: carbs ? parseFloat(carbs) : null,
      fat_g_per_serving: fat ? parseFloat(fat) : null,
      ingredients: ingredientPayloads,
      tags: selectedTags,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar la receta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 820 }}>
      {error && (
        <div
          style={{
            background: 'rgba(196,98,45,0.08)',
            color: 'var(--nc-terra)',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className="dash-section">
        <div className="dash-section-head">
          <div className="dash-section-title">Información básica</div>
        </div>
        <div className="dash-section-body">
          <div className="dash-row single">
            <div className="dash-field">
              <label className="dash-label">Nombre de la receta</label>
              <input
                type="text"
                className="dash-input"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="dash-row single">
            <div className="dash-field">
              <label className="dash-label">Descripción</label>
              <textarea
                className="dash-textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="dash-row">
            <div className="dash-field">
              <label className="dash-label">Categoría</label>
              <select
                className="dash-input"
                value={category}
                onChange={e => setCategory(e.target.value as RecipeCategory)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="dash-field">
              <label className="dash-label">Porciones base</label>
              <input
                type="number"
                className="dash-input"
                value={baseServings}
                onChange={e => setBaseServings(e.target.value)}
                min={1}
                required
              />
            </div>
          </div>

          <div className="dash-row">
            <div className="dash-field">
              <label className="dash-label">
                Tiempo de preparación <span className="opt">(min)</span>
              </label>
              <input
                type="number"
                className="dash-input"
                value={prepTime}
                onChange={e => setPrepTime(e.target.value)}
                min={0}
              />
            </div>
            <div className="dash-field">
              <label className="dash-label">
                Tiempo de cocción <span className="opt">(min)</span>
              </label>
              <input
                type="number"
                className="dash-input"
                value={cookTime}
                onChange={e => setCookTime(e.target.value)}
                min={0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition */}
      <div className="dash-section">
        <div className="dash-section-head">
          <div className="dash-section-title">Información nutricional (por porción)</div>
          <div className="dash-section-sub">Todos los valores son opcionales</div>
        </div>
        <div className="dash-section-body">
          <div className="dash-row">
            <div className="dash-field">
              <label className="dash-label">Calorías (kcal)</label>
              <input
                type="number"
                className="dash-input"
                value={calories}
                onChange={e => setCalories(e.target.value)}
                min={0}
              />
            </div>
            <div className="dash-field">
              <label className="dash-label">Proteínas (g)</label>
              <input
                type="number"
                step="0.1"
                className="dash-input"
                value={protein}
                onChange={e => setProtein(e.target.value)}
                min={0}
              />
            </div>
          </div>
          <div className="dash-row">
            <div className="dash-field">
              <label className="dash-label">Carbohidratos (g)</label>
              <input
                type="number"
                step="0.1"
                className="dash-input"
                value={carbs}
                onChange={e => setCarbs(e.target.value)}
                min={0}
              />
            </div>
            <div className="dash-field">
              <label className="dash-label">Grasas (g)</label>
              <input
                type="number"
                step="0.1"
                className="dash-input"
                value={fat}
                onChange={e => setFat(e.target.value)}
                min={0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="dash-section">
        <div className="dash-section-head">
          <div className="dash-section-title">Ingredientes</div>
        </div>
        <div className="dash-section-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ingredients.map((ing, idx) => (
              <div
                key={ing.tempId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 120px 1fr 40px',
                  gap: 10,
                  alignItems: 'start',
                }}
              >
                <div className="dash-field">
                  <label className="dash-label" style={{ fontSize: 11 }}>
                    Cantidad
                  </label>
                  <input
                    type="text"
                    className="dash-input"
                    style={{ fontSize: 13 }}
                    value={ing.amount}
                    onChange={e => updateIngredient(ing.tempId, 'amount', e.target.value)}
                  />
                </div>
                <div className="dash-field">
                  <label className="dash-label" style={{ fontSize: 11 }}>
                    Unidad
                  </label>
                  <input
                    type="text"
                    className="dash-input"
                    style={{ fontSize: 13 }}
                    value={ing.unit}
                    onChange={e => updateIngredient(ing.tempId, 'unit', e.target.value)}
                    placeholder="g, ml, taza..."
                  />
                </div>
                <div className="dash-field">
                  <label className="dash-label" style={{ fontSize: 11 }}>
                    Ingrediente
                  </label>
                  <input
                    type="text"
                    className="dash-input"
                    style={{ fontSize: 13 }}
                    value={ing.ingredient_name}
                    onChange={e =>
                      updateIngredient(ing.tempId, 'ingredient_name', e.target.value)
                    }
                    placeholder="Nombre del ingrediente"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeIngredient(ing.tempId)}
                  disabled={ingredients.length === 1}
                  style={{
                    marginTop: 22,
                    width: 34,
                    height: 34,
                    border: '1px solid var(--nc-border)',
                    borderRadius: 6,
                    background: 'transparent',
                    color: ingredients.length === 1 ? 'var(--nc-stone-lt)' : 'var(--nc-stone)',
                    cursor: ingredients.length === 1 ? 'not-allowed' : 'pointer',
                    fontSize: 16,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addIngredient}
            style={{
              marginTop: 10,
              height: 36,
              width: '100%',
              background: 'transparent',
              border: '1.5px dashed var(--nc-border)',
              borderRadius: 6,
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--nc-stone)',
              cursor: 'pointer',
            }}
          >
            + Agregar ingrediente
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="dash-section">
        <div className="dash-section-head">
          <div className="dash-section-title">Etiquetas</div>
          <div className="dash-section-sub">
            Ayuda a categorizar y buscar recetas (vegana, sin gluten, etc.)
          </div>
        </div>
        <div className="dash-section-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="dash-chip specialty"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="dash-chip-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="dash-input"
              value={tagInput}
              onChange={e => handleTagInputChange(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Escribe y presiona Enter para agregar"
              style={{ width: '100%' }}
            />
            {tagSuggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  background: 'white',
                  border: '1px solid var(--nc-border)',
                  borderRadius: 6,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                {tagSuggestions.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => addTag(tag.name)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: 'var(--nc-ink)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--nc-forest-pale)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photos section - only show for edit mode when recipe exists */}
      {initialData && (
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">Fotos</div>
            <div className="dash-section-sub">
              Máximo 10 fotos. Haz clic en la estrella para establecer la foto principal.
            </div>
          </div>
          <div className="dash-section-body">
            {/* Upload area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                padding: '32px',
                border: `2px dashed ${dragActive ? 'var(--nc-forest)' : 'var(--nc-border)'}`,
                borderRadius: 8,
                textAlign: 'center',
                background: dragActive ? 'var(--nc-forest-pale)' : 'var(--nc-bg-pale)',
                cursor: photos.length >= 10 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                marginBottom: photos.length > 0 ? 20 : 0,
              }}
              onClick={() => {
                if (photos.length < 10 && !uploading) {
                  fileInputRef.current?.click();
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={e => handleFileSelect(e.target.files)}
                disabled={uploading || photos.length >= 10}
              />
              {uploading ? (
                <>
                  <div style={{ fontSize: 14, color: 'var(--nc-forest)', marginBottom: 4 }}>
                    {uploadProgress}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--nc-stone-light)' }}>
                    Por favor espera...
                  </div>
                </>
              ) : photos.length >= 10 ? (
                <>
                  <div style={{ fontSize: 14, color: 'var(--nc-stone)', marginBottom: 4 }}>
                    Límite de fotos alcanzado
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--nc-stone-light)' }}>
                    Has subido el máximo de 10 fotos
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 14, color: 'var(--nc-forest)', marginBottom: 4 }}>
                    Arrastra fotos aquí o haz clic para seleccionar
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--nc-stone-light)' }}>
                    {photos.length > 0
                      ? `${photos.length}/10 fotos subidas`
                      : 'JPG, PNG o WebP'}
                  </div>
                </>
              )}
            </div>

            {/* Photo grid */}
            {photos.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: 12,
                }}
              >
                {photos
                  .sort((a, b) => a.display_order - b.display_order)
                  .map(photo => (
                    <div
                      key={photo.id}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: photo.is_primary
                          ? '3px solid var(--nc-forest)'
                          : '1px solid var(--nc-border)',
                        boxShadow: photo.is_primary
                          ? '0 4px 12px rgba(26,51,41,0.15)'
                          : 'none',
                      }}
                    >
                      <img
                        src={photo.photo_url}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />

                      {/* Primary badge */}
                      {photo.is_primary && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            background: 'var(--nc-forest)',
                            color: 'white',
                            fontSize: 10,
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Principal
                        </div>
                      )}

                      {/* Actions overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          opacity: 0,
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.opacity = '0';
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(photo.id)}
                          disabled={photo.is_primary}
                          style={{
                            background: photo.is_primary
                              ? 'rgba(255,255,255,0.3)'
                              : 'white',
                            border: 'none',
                            borderRadius: 4,
                            padding: '8px 10px',
                            cursor: photo.is_primary ? 'default' : 'pointer',
                            fontSize: 16,
                            lineHeight: 1,
                          }}
                          title="Establecer como principal"
                        >
                          {photo.is_primary ? '⭐' : '☆'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          style={{
                            background: 'var(--nc-terra)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            padding: '8px 10px',
                            cursor: 'pointer',
                            fontSize: 16,
                            lineHeight: 1,
                          }}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit */}
      <div
        style={{
          marginTop: 24,
          padding: '14px 0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
        }}
      >
        <button type="submit" disabled={submitting} className="dash-btn-save">
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
