'use client';
// frontend/app/dashboard/my-exercises/new/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createExerciseTemplate } from '@/lib/exercise-templates';
import type { ExerciseCategory } from '@/lib/types';

const CATEGORY_KEYS: Record<ExerciseCategory, string> = {
  strength: 'category_strength',
  cardio: 'category_cardio',
  flexibility: 'category_flexibility',
  balance: 'category_balance',
};

export default function NewExercisePage() {
  const t = useTranslations('dashboard.exercises');
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
      setError(t('name_required'));
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
      setError(err.message || t('create_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">{t('new_exercise_button')}</div>
        <div className="dash-topbar-right">
          <button onClick={() => router.back()} className="dash-btn-plain">
            {t('cancel_button')}
          </button>
        </div>
      </div>

      <div className="dash-content">
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

          <div className="dash-section">
            <div className="dash-section-head">
              <div className="dash-section-title">{t('basic_info_title')}</div>
            </div>
            <div className="dash-section-body">
              <div className="dash-row single">
                <div className="dash-field">
                  <label className="dash-label">
                    {t('name_label')} <span style={{ color: 'var(--nc-terra)' }}>{t('required_indicator')}</span>
                  </label>
                  <input
                    type="text"
                    className="dash-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={200}
                    required
                  />
                </div>
              </div>

              <div className="dash-row single">
                <div className="dash-field">
                  <label className="dash-label">{t('description_label')}</label>
                  <textarea
                    className="dash-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={2000}
                    rows={3}
                    placeholder={t('description_placeholder')}
                  />
                </div>
              </div>

              <div className="dash-row">
                <div className="dash-field">
                  <label className="dash-label">
                    {t('category_label')} <span style={{ color: 'var(--nc-terra)' }}>{t('required_indicator')}</span>
                  </label>
                  <select
                    className="dash-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
                    required
                  >
                    {Object.entries(CATEGORY_KEYS).map(([val, key]) => (
                      <option key={val} value={val}>{t(key)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="dash-row">
                <div className="dash-field">
                  <label className="dash-label">{t('muscle_groups_field')}</label>
                  <input
                    type="text"
                    className="dash-input"
                    value={muscleGroups}
                    onChange={(e) => setMuscleGroups(e.target.value)}
                    maxLength={500}
                    placeholder={t('muscle_groups_placeholder')}
                  />
                </div>
                <div className="dash-field">
                  <label className="dash-label">{t('equipment_field')}</label>
                  <input
                    type="text"
                    className="dash-input"
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    maxLength={500}
                    placeholder={t('equipment_placeholder')}
                  />
                </div>
              </div>

              <div className="dash-row single">
                <div className="dash-field">
                  <label className="dash-label">{t('instructions_field')}</label>
                  <textarea
                    className="dash-textarea"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    maxLength={5000}
                    rows={6}
                    placeholder={t('instructions_placeholder')}
                  />
                </div>
              </div>

              <div className="dash-row single">
                <div className="dash-field">
                  <label className="dash-label">{t('demo_video_field')}</label>
                  <input
                    type="url"
                    className="dash-input"
                    value={demoVideoUrl}
                    onChange={(e) => setDemoVideoUrl(e.target.value)}
                    maxLength={500}
                    placeholder={t('demo_video_placeholder')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="submit" disabled={loading} className="dash-btn-publish" style={{ flex: 1 }}>
              {loading ? t('saving_button') : t('submit_button')}
            </button>
            <button type="button" onClick={() => router.back()} className="dash-btn-plain" style={{ flex: 1 }}>
              {t('cancel_button')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
