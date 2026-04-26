// frontend/app/dashboard/clients/[clientId]/plans/nutrition/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  useNutritionPlan,
  useExercisePlans,
  updateNutritionPlan,
  activateNutritionPlan,
  deleteNutritionPlan,
  duplicatePlans,
} from '@/lib/plans';
import type {
  MealOptionPayload,
  MealPayload,
  NutritionDayPayload,
  NutritionPlanPayload,
  SlotOptionPayload,
  NutritionPlanSlotPayload,
  SupplementPayload,
} from '@/lib/plans';
import type { PlanStatus, MealType } from '@/lib/types';
import RecipePickerModal from '@/components/RecipePickerModal';
import SupplementItem from './components/SupplementItem';

// MEAL_TYPES, MEAL_SLOT_LABELS, MEAL_SLOT_ORDER are populated in the component with translation support
const MEAL_SLOT_ORDER: MealType[] = ['breakfast', 'mid_morning', 'lunch', 'snack', 'dinner'];

function emptyOption(): MealOptionPayload {
  return { name: '', description: '', calories: null, protein_g: null, carbs_g: null, fat_g: null, display_order: 0 };
}

function emptyMeal(displayOrder: number): MealPayload {
  return { name: '', meal_type: 'breakfast', display_order: displayOrder, options: [emptyOption()] };
}

function emptyDay(dayNumber: number): NutritionDayPayload {
  return { day_number: dayNumber, label: '', notes: '', meals: [] };
}

function emptySlotOption(displayOrder: number): SlotOptionPayload {
  return {
    name: '', description: '',
    calories: null, protein_g: null, carbs_g: null, fat_g: null,
    display_order: displayOrder,
  };
}

function emptySupplement(displayOrder: number): SupplementPayload {
  return {
    name: '',
    dosage: '',
    timing: 'morning',
    display_order: displayOrder,
  };
}

function StatusPill({ status, t }: { status: PlanStatus; t: ReturnType<typeof useTranslations> }) {
  const labels: Record<PlanStatus, string> = {
    draft:    t('plan_status_draft'),
    active:   t('plan_status_active'),
    archived: t('plan_status_archived'),
  };
  const cfg: Record<PlanStatus, { bg: string; color: string }> = {
    draft:    { bg: 'rgba(139,115,85,0.1)',  color: 'var(--nc-stone)' },
    active:   { bg: 'rgba(74,124,89,0.1)',   color: '#4a7c59' },
    archived: { bg: 'rgba(0,0,0,0.06)',       color: 'var(--nc-stone)' },
  };
  const s = cfg[status];
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: s.bg, color: s.color }}>
      {labels[status]}
    </span>
  );
}

export default function EditNutritionPlanPage() {
  const t = useTranslations('dashboard.nutrition_plans');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ clientId: string; id: string }>();
  const { clientId, id } = params;

  const MEAL_TYPES = [
    { value: 'breakfast',   label: t('breakfast')   },
    { value: 'mid_morning', label: t('mid_morning') },
    { value: 'lunch',       label: t('lunch')       },
    { value: 'snack',       label: t('snack')       },
    { value: 'dinner',      label: t('dinner')      },
  ];

  const MEAL_SLOT_LABELS: Record<MealType, string> = {
    breakfast:   t('breakfast'),
    mid_morning: t('mid_morning'),
    lunch:       t('lunch'),
    snack:       t('snack'),
    dinner:      t('dinner'),
  };

  const DAY_LABELS = [t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday'), t('sunday')];

  const { plan, isLoading, mutate } = useNutritionPlan(id);
  const { plans: exercisePlans } = useExercisePlans(plan?.client_id);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [days, setDays] = useState<NutritionDayPayload[]>([]);
  const [slots, setSlots] = useState<NutritionPlanSlotPayload[]>([]);
  const [includeSupplements, setIncludeSupplements] = useState(false);
  const [supplements, setSupplements] = useState<SupplementPayload[]>([]);
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [error, setError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [recipeModalTarget, setRecipeModalTarget] = useState<{
    dayIndex: number;
    mealIndex: number;
    optionIndex: number;
  } | null>(null);
  const [slotRecipeModalOpen, setSlotRecipeModalOpen] = useState(false);
  const [slotRecipeModalTarget, setSlotRecipeModalTarget] = useState<{
    slotIndex: number;
    optionIndex: number;
  } | null>(null);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  useEffect(() => {
    if (!plan) return;
    setTitle(plan.title);
    setNotes(plan.notes);
    setIncludeSupplements(plan.include_supplements);
    setSupplements(plan.supplements.map((s) => ({
      id: s.id,
      name: s.name,
      brand: s.brand,
      dosage: s.dosage,
      timing: s.timing,
      linked_meal_id: s.linked_meal_id,
      notes: s.notes,
      calories: s.calories,
      protein_g: s.protein_g,
      carbs_g: s.carbs_g,
      fat_g: s.fat_g,
      display_order: s.display_order,
    })));

    // Merge plan.days (sparse) into a full 7-day array
    const merged: NutritionDayPayload[] = Array.from({ length: 7 }, (_, i) => {
      const found = plan.days.find((d) => d.day_number === i + 1);
      if (!found) return emptyDay(i + 1);
      return {
        day_number: found.day_number,
        label: found.label,
        notes: found.notes,
        meals: found.meals.map((m) => ({
          name: m.name,
          meal_type: m.meal_type,
          display_order: m.display_order,
          options: m.options.map((o) => ({
            name: o.name,
            description: o.description,
            calories: o.calories,
            protein_g: o.protein_g,
            carbs_g: o.carbs_g,
            fat_g: o.fat_g,
            display_order: o.display_order,
          })),
        })),
      };
    });
    setDays(merged);

    if (plan.plan_style === 'flexible') {
      const mergedSlots = MEAL_SLOT_ORDER.map((mealType, i) => {
        const found = (plan.slots ?? []).find((s) => s.meal_type === mealType);
        if (!found) return { meal_type: mealType, display_order: i, options: [] };
        return {
          meal_type: found.meal_type,
          display_order: found.display_order,
          options: found.options.map((o) => ({
            name: o.name,
            description: o.description,
            calories: o.calories,
            protein_g: o.protein_g,
            carbs_g: o.carbs_g,
            fat_g: o.fat_g,
            display_order: o.display_order,
          })),
        };
      });
      setSlots(mergedSlots);
    }
  }, [plan]);

  function updateDay(index: number, patch: Partial<NutritionDayPayload>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function addMeal(dayIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, meals: [...d.meals, emptyMeal(d.meals.length)] } : d,
      ),
    );
  }

  function removeMeal(dayIndex: number, mealIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, meals: d.meals.filter((_, mi) => mi !== mealIndex) } : d,
      ),
    );
  }

  function updateMeal(dayIndex: number, mealIndex: number, patch: Partial<MealPayload>) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? { ...d, meals: d.meals.map((m, mi) => (mi === mealIndex ? { ...m, ...patch } : m)) }
          : d,
      ),
    );
  }

  function addOption(dayIndex: number, mealIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              meals: d.meals.map((m, mi) =>
                mi === mealIndex ? { ...m, options: [...m.options, emptyOption()] } : m,
              ),
            }
          : d,
      ),
    );
  }

  function removeOption(dayIndex: number, mealIndex: number, optionIndex: number) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              meals: d.meals.map((m, mi) =>
                mi === mealIndex
                  ? { ...m, options: m.options.filter((_, oi) => oi !== optionIndex) }
                  : m,
              ),
            }
          : d,
      ),
    );
  }

  function updateOption(
    dayIndex: number,
    mealIndex: number,
    optionIndex: number,
    patch: Partial<MealOptionPayload>,
  ) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              meals: d.meals.map((m, mi) =>
                mi === mealIndex
                  ? {
                      ...m,
                      options: m.options.map((o, oi) =>
                        oi === optionIndex ? { ...o, ...patch } : o,
                      ),
                    }
                  : m,
              ),
            }
          : d,
      ),
    );
  }

  function addSlotOption(slotIndex: number) {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === slotIndex
          ? { ...s, options: [...s.options, emptySlotOption(s.options.length)] }
          : s,
      ),
    );
  }

  function removeSlotOption(slotIndex: number, optIndex: number) {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === slotIndex ? { ...s, options: s.options.filter((_, oi) => oi !== optIndex) } : s,
      ),
    );
  }

  function updateSlotOption(slotIndex: number, optIndex: number, patch: Partial<SlotOptionPayload>) {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === slotIndex
          ? { ...s, options: s.options.map((o, oi) => (oi === optIndex ? { ...o, ...patch } : o)) }
          : s,
      ),
    );
  }

  function openRecipeModal(dayIndex: number, mealIndex: number, optionIndex: number) {
    setRecipeModalTarget({ dayIndex, mealIndex, optionIndex });
    setRecipeModalOpen(true);
  }

  function handleRecipeSelect(optionData: {
    name: string;
    description: string;
    calories: number | null;
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
  }) {
    if (!recipeModalTarget) return;
    const { dayIndex, mealIndex, optionIndex } = recipeModalTarget;
    updateOption(dayIndex, mealIndex, optionIndex, optionData);
    setRecipeModalOpen(false);
    setRecipeModalTarget(null);
  }

  function openSlotRecipeModal(slotIndex: number, optionIndex: number) {
    setSlotRecipeModalTarget({ slotIndex, optionIndex });
    setSlotRecipeModalOpen(true);
  }

  function handleSlotRecipeSelect(optionData: {
    name: string;
    description: string;
    calories: number | null;
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
  }) {
    if (!slotRecipeModalTarget) return;
    const { slotIndex, optionIndex } = slotRecipeModalTarget;
    updateSlotOption(slotIndex, optionIndex, optionData);
    setSlotRecipeModalOpen(false);
    setSlotRecipeModalTarget(null);
  }

  function buildPayload(): NutritionPlanPayload {
    return {
      client_id: plan?.client_id ?? '',
      title: title.trim(),
      notes,
      plan_style: plan?.plan_style ?? 'structured',
      days: plan?.plan_style === 'structured'
        ? days.filter((d) => d.meals.length > 0).map((d) => ({
            ...d,
            meals: d.meals.map((m, mi) => ({
              ...m,
              display_order: mi,
              options: m.options.map((o, oi) => ({ ...o, display_order: oi })),
            })),
          }))
        : [],
      slots: plan?.plan_style === 'flexible'
        ? slots.map((s, si) => ({
            ...s,
            display_order: si,
            options: s.options.map((o, oi) => ({ ...o, display_order: oi })),
          }))
        : [],
      include_supplements: includeSupplements,
      supplements,
    };
  }

  async function handleSave() {
    if (!title.trim()) { setError('El título es obligatorio.'); return; }
    setSaving(true);
    setError('');
    setSaveMsg('');
    try {
      await updateNutritionPlan(id, buildPayload());
      await mutate();
      setSaveMsg('Guardado correctamente.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate() {
    setActivating(true);
    setError('');
    try {
      await activateNutritionPlan(id);
      await mutate();
      setShowActivateModal(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al activar el plan.');
    } finally {
      setActivating(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError('');
    try {
      await deleteNutritionPlan(id);
      router.push(`/${locale}/dashboard/clients/${clientId}`);
      setShowDeleteModal(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el plan.');
    } finally {
      setDeleting(false);
    }
  }

  async function handleDuplicate() {
    if (!plan) return;
    const activeExercisePlan = exercisePlans.find((p) => p.status === 'active');
    setDuplicating(true);
    setError('');
    try {
      const result = await duplicatePlans(
        plan.client_id,
        id,
        activeExercisePlan?.id,
      );
      if (result.nutrition_plan) {
        router.push(`/${locale}/dashboard/clients/${plan.client_id}/plans/nutrition/${result.nutrition_plan.id}`);
      }
      setShowDuplicateModal(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al duplicar el plan.');
    } finally {
      setDuplicating(false);
    }
  }

  function handleAddSupplement() {
    setSupplements([...supplements, emptySupplement(supplements.length)]);
  }

  function handleDeleteSupplement(index: number) {
    setSupplements(supplements.filter((_, i) => i !== index));
  }

  function handleMoveSupplementUp(index: number) {
    if (index <= 0) return;
    const newSupps = [...supplements];
    [newSupps[index], newSupps[index - 1]] = [newSupps[index - 1], newSupps[index]];
    // Update display_order
    newSupps.forEach((s, i) => (s.display_order = i));
    setSupplements(newSupps);
  }

  function handleMoveSupplementDown(index: number) {
    if (index >= supplements.length - 1) return;
    const newSupps = [...supplements];
    [newSupps[index], newSupps[index + 1]] = [newSupps[index + 1], newSupps[index]];
    // Update display_order
    newSupps.forEach((s, i) => (s.display_order = i));
    setSupplements(newSupps);
  }

  function updateSupplement(index: number, updates: Partial<SupplementPayload>) {
    const newSupps = [...supplements];
    newSupps[index] = { ...newSupps[index], ...updates };
    setSupplements(newSupps);
  }

  if (isLoading) {
    return (
      <div className="dash-content" style={{ padding: 40, color: 'var(--nc-stone)', fontWeight: 300 }}>
        Cargando plan…
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="dash-content" style={{ padding: 40 }}>
        <p style={{ color: 'var(--nc-stone)' }}>Plan no encontrado.</p>
        <Link href={`/dashboard/clients/${clientId}`} style={{ color: 'var(--nc-terra)', fontSize: 13 }}>
          ← Volver al cliente
        </Link>
      </div>
    );
  }

  const isDraft = plan.status === 'draft';

  return (
    <>
      <div className="dash-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href={`/dashboard/clients/${clientId}`}
            style={{ fontSize: 13, color: 'var(--nc-stone)', textDecoration: 'none' }}
          >
            ← Cliente
          </Link>
          <div className="dash-topbar-title">{plan.title}</div>
          <StatusPill status={plan.status} t={t} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isDraft && (
            <>
              <button
                onClick={() => setShowDuplicateModal(true)}
                disabled={duplicating}
                style={{
                  height: 34, padding: '0 16px',
                  background: 'rgba(139,115,85,0.1)', border: '1px solid rgba(139,115,85,0.3)',
                  borderRadius: 6, color: 'var(--nc-stone)', fontFamily: 'var(--font-body)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}
              >
                {duplicating ? 'Duplicando…' : 'Duplicar plan'}
              </button>
              <button
                onClick={() => setShowActivateModal(true)}
                disabled={activating}
                style={{
                  height: 34, padding: '0 16px',
                  background: 'rgba(74,124,89,0.1)', border: '1px solid rgba(74,124,89,0.3)',
                  borderRadius: 6, color: '#4a7c59', fontFamily: 'var(--font-body)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}
              >
                {activating ? 'Activando…' : 'Activar plan'}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                style={{
                  height: 34, padding: '0 16px',
                  background: 'transparent', border: '1px solid rgba(185,74,58,0.3)',
                  borderRadius: 6, color: '#b94a3a', fontFamily: 'var(--font-body)',
                  fontSize: 13, cursor: 'pointer',
                }}
              >
                {deleting ? 'Eliminando…' : 'Eliminar borrador'}
              </button>
            </>
          )}
          {!isDraft && (
            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              style={{
                height: 34, padding: '0 16px',
                background: 'rgba(139,115,85,0.1)', border: '1px solid rgba(139,115,85,0.3)',
                borderRadius: 6, color: 'var(--nc-stone)', fontFamily: 'var(--font-body)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              {duplicating ? 'Duplicando…' : 'Duplicar plan como borrador'}
            </button>
          )}
        </div>
      </div>
      <div className="dash-content">
        {/* Header fields */}
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">Información del plan</div>
          </div>
          <div className="dash-section-body">
            <div className="dash-row">
              <div className="dash-field">
                <label className="dash-label">Título</label>
                <input
                  className="dash-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!isDraft}
                />
              </div>
            </div>
            <div className="dash-row single">
              <div className="dash-field">
                <label className="dash-label">Notas generales</label>
                <textarea
                  className="dash-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!isDraft}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">Estilo del plan</div>
          </div>
          <div className="dash-section-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: '0 0 auto' }}>
                <button
                  type="button"
                  className={`dash-toggle ${includeSupplements ? 'on' : ''}`}
                  onClick={() => isDraft && setIncludeSupplements(!includeSupplements)}
                  disabled={!isDraft}
                  style={{ opacity: isDraft ? 1 : 0.5, cursor: isDraft ? 'pointer' : 'not-allowed' }}
                />
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--nc-ink)', marginBottom: '2px' }}>Incluir suplementos</h3>
                <p style={{ fontSize: '12px', fontWeight: 300, color: 'var(--nc-stone)', margin: 0 }}>Añade recomendaciones de suplementos a este plan</p>
              </div>
            </div>
          </div>
        </div>

        {plan.plan_style === 'structured' ? (
        /* Day accordion */
        days.map((day, dayIndex) => (
          <div key={day.day_number} style={{
            border: '1px solid var(--nc-border)', borderRadius: 8, marginBottom: 8, overflow: 'hidden',
          }}>
            <button
              onClick={() => setOpenDay(openDay === day.day_number ? null : day.day_number)}
              style={{
                width: '100%', padding: '14px 20px',
                background: openDay === day.day_number ? 'var(--nc-forest-pale)' : 'white',
                border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', fontFamily: 'var(--font-body)',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--nc-forest)' }}>
                Día {day.day_number} — {DAY_LABELS[dayIndex]}
              </span>
              <span style={{ fontSize: 12, color: 'var(--nc-stone)' }}>
                {day.meals.length} comida{day.meals.length !== 1 ? 's' : ''}
                {openDay === day.day_number ? ' ▲' : ' ▼'}
              </span>
            </button>

            {openDay === day.day_number && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--nc-border)', background: 'white' }}>
                <div className="dash-row" style={{ marginBottom: 12 }}>
                  <div className="dash-field">
                    <label className="dash-label">Etiqueta del día</label>
                    <input
                      className="dash-input"
                      value={day.label}
                      onChange={(e) => updateDay(dayIndex, { label: e.target.value })}
                      disabled={!isDraft}
                      placeholder="ej: Día de descanso"
                    />
                  </div>
                  <div className="dash-field">
                    <label className="dash-label">Notas del día</label>
                    <input
                      className="dash-input"
                      value={day.notes}
                      onChange={(e) => updateDay(dayIndex, { notes: e.target.value })}
                      disabled={!isDraft}
                      placeholder="ej: Evitar azúcares"
                    />
                  </div>
                </div>

                {day.meals.map((meal, mealIndex) => (
                  <div key={mealIndex} style={{
                    border: '1px solid var(--nc-border)', borderRadius: 6,
                    padding: '12px 16px', marginBottom: 8, background: 'var(--nc-cream)',
                  }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                      <div className="dash-field" style={{ flex: 2 }}>
                        <label className="dash-label">Nombre de la comida</label>
                        <input
                          className="dash-input"
                          value={meal.name}
                          onChange={(e) => updateMeal(dayIndex, mealIndex, { name: e.target.value })}
                          disabled={!isDraft}
                          placeholder="ej: Desayuno proteico"
                        />
                      </div>
                      <div className="dash-field" style={{ flex: 1 }}>
                        <label className="dash-label">Tipo</label>
                        <select
                          className="dash-input"
                          value={meal.meal_type}
                          onChange={(e) => updateMeal(dayIndex, mealIndex, { meal_type: e.target.value as MealPayload['meal_type'] })}
                          disabled={!isDraft}
                        >
                          {MEAL_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      {isDraft && (
                        <button
                          onClick={() => removeMeal(dayIndex, mealIndex)}
                          style={{
                            marginTop: 20, width: 30, height: 30, border: '1px solid var(--nc-border)',
                            borderRadius: 4, background: 'transparent', cursor: 'pointer',
                            color: 'var(--nc-stone)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div style={{ marginLeft: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--nc-stone)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Opciones
                      </div>
                      {meal.options.map((opt, optIndex) => (
                        <div key={optIndex} style={{
                          border: '1px solid rgba(139,115,85,0.15)', borderRadius: 4,
                          padding: '8px 10px', marginBottom: 6, background: 'white',
                        }}>
                          {isDraft && (
                            <button
                              onClick={() => openRecipeModal(dayIndex, mealIndex, optIndex)}
                              className="dash-btn-add-pkg"
                              style={{ marginBottom: 8, fontSize: 12, height: 28 }}
                            >
                              🍴 Seleccionar receta
                            </button>
                          )}
                          <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                            <div className="dash-field" style={{ flex: 2 }}>
                              <label className="dash-label">Nombre</label>
                              <input
                                className="dash-input"
                                value={opt.name}
                                onChange={(e) => updateOption(dayIndex, mealIndex, optIndex, { name: e.target.value })}
                                disabled={!isDraft}
                                placeholder="ej: Opción A"
                              />
                            </div>
                            <div className="dash-field" style={{ flex: 3 }}>
                              <label className="dash-label">Descripción</label>
                              <input
                                className="dash-input"
                                value={opt.description}
                                onChange={(e) => updateOption(dayIndex, mealIndex, optIndex, { description: e.target.value })}
                                disabled={!isDraft}
                                placeholder="Ingredientes o instrucciones"
                              />
                            </div>
                            {isDraft && (
                              <button
                                onClick={() => removeOption(dayIndex, mealIndex, optIndex)}
                                style={{
                                  marginTop: 20, width: 26, height: 26, border: '1px solid var(--nc-border)',
                                  borderRadius: 4, background: 'transparent', cursor: 'pointer',
                                  color: 'var(--nc-stone)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {[
                              { field: 'calories' as const,  label: 'Kcal'      },
                              { field: 'protein_g' as const, label: 'Prot (g)'  },
                              { field: 'carbs_g' as const,   label: 'HC (g)'    },
                              { field: 'fat_g' as const,     label: 'Grasas (g)'},
                            ].map(({ field, label }) => (
                              <div key={field} className="dash-field" style={{ flex: 1 }}>
                                <label className="dash-label">{label}</label>
                                <input
                                  className="dash-input"
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={opt[field] ?? ''}
                                  onChange={(e) =>
                                    updateOption(dayIndex, mealIndex, optIndex, {
                                      [field]: e.target.value === '' ? null : Number(e.target.value),
                                    })
                                  }
                                  disabled={!isDraft}
                                  placeholder="—"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {isDraft && (
                        <button
                          onClick={() => addOption(dayIndex, mealIndex)}
                          className="dash-btn-add-pkg"
                          style={{ marginTop: 4, height: 30, fontSize: 12 }}
                        >
                          + Añadir opción
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isDraft && (
                  <button
                    onClick={() => addMeal(dayIndex)}
                    className="dash-btn-add-pkg"
                    style={{ marginTop: 4 }}
                  >
                    + Añadir comida
                  </button>
                )}
              </div>
            )}
          </div>
        ))
        ) : (
          /* ─── Flexible slot builder ──────────────────────────────── */
          <div className="dash-section">
            <div className="dash-section-head">
              <div className="dash-section-title">Opciones por franja horaria</div>
              <div className="dash-section-sub">Añade 2–5 opciones por comida. El cliente elegirá una cada día.</div>
            </div>
            <div className="dash-section-body">
              {slots.map((slot, slotIndex) => (
                <div key={slot.meal_type} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nc-forest)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    {MEAL_SLOT_LABELS[slot.meal_type]}
                  </div>
                  {slot.options.map((opt, optIndex) => (
                    <div key={optIndex} style={{
                      border: '1px solid rgba(139,115,85,0.15)', borderRadius: 6,
                      padding: '10px 14px', marginBottom: 8, background: 'var(--nc-cream)',
                    }}>
                      {isDraft && (
                        <button
                          onClick={() => openSlotRecipeModal(slotIndex, optIndex)}
                          className="dash-btn-add-pkg"
                          style={{ marginBottom: 8, fontSize: 12, height: 28 }}
                        >
                          🍴 Seleccionar receta
                        </button>
                      )}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <div className="dash-field" style={{ flex: '2 1 180px' }}>
                          <label className="dash-label">Nombre</label>
                          <input
                            className="dash-input"
                            value={opt.name}
                            onChange={(e) => updateSlotOption(slotIndex, optIndex, { name: e.target.value })}
                            disabled={!isDraft}
                            placeholder="ej: Avena con frutas"
                          />
                        </div>
                        <div className="dash-field" style={{ flex: '3 1 220px' }}>
                          <label className="dash-label">Descripción</label>
                          <input
                            className="dash-input"
                            value={opt.description}
                            onChange={(e) => updateSlotOption(slotIndex, optIndex, { description: e.target.value })}
                            disabled={!isDraft}
                            placeholder="ej: 60 g avena, 1 plátano, canela"
                          />
                        </div>
                        {([
                          { field: 'calories'  as const, label: 'kcal',   step: '1'  },
                          { field: 'protein_g' as const, label: 'Prot(g)', step: '0.1'},
                          { field: 'carbs_g'   as const, label: 'HC(g)',   step: '0.1'},
                          { field: 'fat_g'     as const, label: 'Gras(g)', step: '0.1'},
                        ] as const).map(({ field, label, step }) => (
                          <div key={field} className="dash-field" style={{ flex: '0 0 72px' }}>
                            <label className="dash-label">{label}</label>
                            <input
                              className="dash-input"
                              type="number" min="0" step={step}
                              value={opt[field] ?? ''}
                              onChange={(e) =>
                                updateSlotOption(slotIndex, optIndex, {
                                  [field]: e.target.value === '' ? null : Number(e.target.value),
                                })
                              }
                              disabled={!isDraft}
                              placeholder="—"
                            />
                          </div>
                        ))}
                        {isDraft && (
                          <button
                            onClick={() => removeSlotOption(slotIndex, optIndex)}
                            style={{
                              marginTop: 20, width: 26, height: 26, border: '1px solid var(--nc-border)',
                              borderRadius: 4, background: 'transparent', cursor: 'pointer',
                              color: 'var(--nc-stone)', fontSize: 14, display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                            }}
                            title="Eliminar opción"
                          >×</button>
                        )}
                      </div>
                    </div>
                  ))}
                  {isDraft && (
                    <button
                      onClick={() => addSlotOption(slotIndex)}
                      className="dash-btn-add-pkg"
                      style={{ marginTop: 4 }}
                    >
                      + Añadir opción de {MEAL_SLOT_LABELS[slot.meal_type].toLowerCase()}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {includeSupplements && (
          <div className="dash-section" style={{ marginTop: '2rem' }}>
            <div className="dash-section-head">
              <div className="dash-section-title">Suplementos</div>
              {isDraft && (
                <button
                  type="button"
                  className="btn-link"
                  onClick={handleAddSupplement}
                >
                  + Agregar suplemento
                </button>
              )}
            </div>
            <div className="dash-section-body">
              {supplements.length === 0 ? (
                <p style={{ color: 'var(--nc-stone)', fontSize: 14 }}>
                  No hay suplementos agregados todavía.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {supplements.map((supp, idx) => (
                    <SupplementItem
                      key={idx}
                      supplement={supp}
                      index={idx}
                      onUpdate={updateSupplement}
                      onDelete={handleDeleteSupplement}
                      onMoveUp={handleMoveSupplementUp}
                      onMoveDown={handleMoveSupplementDown}
                      isFirst={idx === 0}
                      isLast={idx === supplements.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {error && <div style={{ color: '#b94a3a', fontSize: 13, marginTop: 8 }}>{error}</div>}
      </div>

      {isDraft && (
        <div className="dash-save-bar">
          <span className="dash-save-hint">{saveMsg || 'Cambios sin guardar'}</span>
          <div className="dash-save-actions">
            <Link
              href={`/dashboard/clients/${clientId}`}
              className="dash-btn-draft"
              style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              Cancelar
            </Link>
            <button className="dash-btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}

      {isDraft && (
        <RecipePickerModal
          isOpen={recipeModalOpen}
          onClose={() => {
            setRecipeModalOpen(false);
            setRecipeModalTarget(null);
          }}
          onSelect={handleRecipeSelect}
        />
      )}

      {isDraft && (
        <RecipePickerModal
          isOpen={slotRecipeModalOpen}
          onClose={() => {
            setSlotRecipeModalOpen(false);
            setSlotRecipeModalTarget(null);
          }}
          onSelect={handleSlotRecipeSelect}
        />
      )}

      {/* Activate Modal */}
      {showActivateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onClick={() => setShowActivateModal(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: 8, padding: 24, maxWidth: 400, width: '90%',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--nc-ink)' }}>
              {tCommon('activate_confirm')}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--nc-stone)', marginBottom: 20, lineHeight: 1.5 }}>
              {tCommon('activate_confirm_description')}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowActivateModal(false)}
                style={{
                  height: 36, padding: '0 16px', background: 'transparent',
                  border: '1px solid var(--nc-border)', borderRadius: 6,
                  color: 'var(--nc-stone)', fontFamily: 'var(--font-body)',
                  fontSize: 13, cursor: 'pointer',
                }}
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={handleActivate}
                disabled={activating}
                style={{
                  height: 36, padding: '0 16px',
                  background: '#4a7c59', border: 'none', borderRadius: 6,
                  color: 'white', fontFamily: 'var(--font-body)',
                  fontSize: 13, fontWeight: 500, cursor: activating ? 'not-allowed' : 'pointer',
                  opacity: activating ? 0.6 : 1,
                }}
              >
                {activating ? tCommon('activating') : tCommon('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onClick={() => setShowDeleteModal(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: 8, padding: 24, maxWidth: 400, width: '90%',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--nc-ink)' }}>
              {tCommon('delete_confirm')}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--nc-stone)', marginBottom: 20, lineHeight: 1.5 }}>
              {tCommon('delete_confirm_description')}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  height: 36, padding: '0 16px', background: 'transparent',
                  border: '1px solid var(--nc-border)', borderRadius: 6,
                  color: 'var(--nc-stone)', fontFamily: 'var(--font-body)',
                  fontSize: 13, cursor: 'pointer',
                }}
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  height: 36, padding: '0 16px',
                  background: '#b94a3a', border: 'none', borderRadius: 6,
                  color: 'white', fontFamily: 'var(--font-body)',
                  fontSize: 13, fontWeight: 500, cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? tCommon('deleting') : tCommon('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {showDuplicateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onClick={() => setShowDuplicateModal(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: 8, padding: 24, maxWidth: 400, width: '90%',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--nc-ink)' }}>
              {tCommon('duplicate_confirm')}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--nc-stone)', marginBottom: 20, lineHeight: 1.5 }}>
              {plan && exercisePlans.find((p) => p.status === 'active')
                ? tCommon('duplicate_with_exercise_description')
                : tCommon('duplicate_confirm_description')}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDuplicateModal(false)}
                style={{
                  height: 36, padding: '0 16px', background: 'transparent',
                  border: '1px solid var(--nc-border)', borderRadius: 6,
                  color: 'var(--nc-stone)', fontFamily: 'var(--font-body)',
                  fontSize: 13, cursor: 'pointer',
                }}
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={handleDuplicate}
                disabled={duplicating}
                style={{
                  height: 36, padding: '0 16px',
                  background: 'var(--nc-stone)', border: 'none', borderRadius: 6,
                  color: 'white', fontFamily: 'var(--font-body)',
                  fontSize: 13, fontWeight: 500, cursor: duplicating ? 'not-allowed' : 'pointer',
                  opacity: duplicating ? 0.6 : 1,
                }}
              >
                {duplicating ? tCommon('duplicating') : tCommon('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
