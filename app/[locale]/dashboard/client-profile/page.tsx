// frontend/app/dashboard/client-profile/page.tsx
'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { useMyClientProfile, useWeightEntries, useActivityEntries } from '@/lib/client-profile';
import { api, ApiRequestError } from '@/lib/api';
import { AvatarUpload } from '@/components/AvatarUpload';
import { BMIBadge } from '@/components/BMIBadge';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

// ─── TagInput ─────────────────────────────────────────────────────────────────

function TagInput({
  tags,
  onChange,
  placeholder,
  chipClass,
}: {
  tags: string[];
  onChange: (t: string[]) => void;
  placeholder: string;
  chipClass: string;
}) {
  const [input, setInput] = useState('');

  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput('');
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="dash-tag-area">
      {tags.map((t) => (
        <span key={t} className={`dash-chip ${chipClass}`}>
          {t}
          <button className="dash-chip-remove" onClick={() => onChange(tags.filter((x) => x !== t))}>×</button>
        </span>
      ))}
      <input
        className="dash-chip-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={tags.length === 0 ? placeholder : ''}
      />
    </div>
  );
}

// ─── Weight Chart ─────────────────────────────────────────────────────────────

type ChartEntry = { id: string; weight_kg: number; recorded_at: string };

function WeightChart({ entries }: { entries: ChartEntry[] }) {
  if (entries.length < 2) return null;

  const sorted = [...entries].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
  const W = 600;
  const H = 160;
  const PX = 40;
  const PY = 16;
  const innerW = W - PX * 2;
  const innerH = H - PY * 2;

  const weights = sorted.map((e) => e.weight_kg);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const toX = (i: number) => PX + (i / (sorted.length - 1)) * innerW;
  const toY = (w: number) => PY + innerH - ((w - minW) / range) * innerH;

  const linePoints = sorted.map((e, i) => `${toX(i)},${toY(e.weight_kg)}`).join(' ');
  const areaPoints = `${PX},${PY + innerH} ${linePoints} ${PX + innerW},${PY + innerH}`;

  const fmtDate = (s: string) => {
    const parts = s.split('-');
    return `${parts[2]}/${parts[1]}`;
  };

  const labelMax = maxW.toFixed(1);
  const labelMin = minW.toFixed(1);
  const dateFirst = fmtDate(sorted[0].recorded_at);
  const dateLast = fmtDate(sorted[sorted.length - 1].recorded_at);
  const midY = PY + innerH / 2;

  return (
    <div style={{ marginBottom: 20 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <line x1={PX} y1={PY} x2={PX} y2={PY + innerH} stroke="rgba(139,115,85,0.15)" strokeWidth={1} />
        <line x1={PX} y1={PY + innerH} x2={PX + innerW} y2={PY + innerH} stroke="rgba(139,115,85,0.15)" strokeWidth={1} />
        <line x1={PX} y1={PY} x2={PX + innerW} y2={PY} stroke="rgba(139,115,85,0.08)" strokeWidth={1} strokeDasharray="4 4" />
        <line x1={PX} y1={midY} x2={PX + innerW} y2={midY} stroke="rgba(139,115,85,0.08)" strokeWidth={1} strokeDasharray="4 4" />
        <polygon points={areaPoints} fill="rgba(26,51,41,0.06)" />
        <polyline points={linePoints} fill="none" stroke="#1A3329" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {sorted.map((e, i) => (
          <circle key={e.id} cx={toX(i)} cy={toY(e.weight_kg)} r={3.5} fill="#C4622D" stroke="white" strokeWidth={1.5} />
        ))}
        <text x={PX - 4} y={PY + 4} textAnchor="end" fontSize={10} fill="#8B7355">{labelMax}</text>
        <text x={PX - 4} y={PY + innerH + 4} textAnchor="end" fontSize={10} fill="#8B7355">{labelMin}</text>
        <text x={PX} y={H - 2} textAnchor="middle" fontSize={10} fill="#8B7355">{dateFirst}</text>
        <text x={PX + innerW} y={H - 2} textAnchor="middle" fontSize={10} fill="#8B7355">{dateLast}</text>
      </svg>
    </div>
  );
}

// ─── Weight Log Widget ────────────────────────────────────────────────────────

function WeightLogWidget() {
  const t = useTranslations('dashboard.client_profile');
  const { entries, mutate } = useWeightEntries();
  const today = new Date().toISOString().split('T')[0];
  const [weightKg, setWeightKg] = useState('');
  const [recordedAt, setRecordedAt] = useState(today);
  const [saving, setSaving] = useState(false);

  const handleLog = async () => {
    const kg = parseFloat(weightKg);
    if (!kg || kg <= 0) return;
    setSaving(true);
    try {
      await api.post('/client/me/weight', { weight_kg: kg, recorded_at: recordedAt });
      await mutate();
      setWeightKg('');
      setRecordedAt(today);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const rollback = entries;
    await mutate(entries.filter((e) => e.id !== id), false);
    try {
      await api.del(`/client/me/weight/${id}`);
      await mutate();
    } catch {
      await mutate(rollback, false);
    }
  };

  return (
    <div className="dash-section">
      <div className="dash-section-head">
        <div className="dash-section-title">{t('weight_log')}</div>
        <div className="dash-section-sub">{t('weight_log_desc')}</div>
      </div>
      <div className="dash-section-body">
        <WeightChart entries={entries} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
          <input
            className="dash-input"
            type="number"
            step="0.1"
            min="0"
            placeholder={t('weight_placeholder')}
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            style={{ width: 90 }}
          />
          <input
            className="dash-input"
            type="date"
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            style={{ width: 150 }}
          />
          <button className="dash-btn-save" onClick={handleLog} disabled={saving || !weightKg}>
            {saving ? t('weight_saving') : t('weight_save')}
          </button>
        </div>
        {entries.length > 0 && (
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid rgba(139,115,85,0.1)' }}>
                  <td style={{ padding: '6px 0', color: 'var(--nc-stone)' }}>{e.recorded_at}</td>
                  <td style={{ padding: '6px 0', fontWeight: 600 }}>{e.weight_kg} kg</td>
                  <td style={{ padding: '6px 0', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(e.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--nc-stone)', fontSize: 16 }}
                      aria-label={t('delete_entry')}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Activity Log Widget ──────────────────────────────────────────────────────

function ActivityLogWidget() {
  const t = useTranslations('dashboard.client_profile');
  const { entries, mutate } = useActivityEntries();
  const today = new Date().toISOString().split('T')[0];
  const [activityType, setActivityType] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [recordedAt, setRecordedAt] = useState(today);
  const [saving, setSaving] = useState(false);

  const handleLog = async () => {
    const duration = parseInt(durationMinutes, 10);
    if (!activityType.trim() || !duration || duration <= 0) return;
    setSaving(true);
    try {
      await api.post('/client/me/activity', {
        activity_type: activityType.trim(),
        duration_minutes: duration,
        recorded_at: recordedAt,
      });
      await mutate();
      setActivityType('');
      setDurationMinutes('');
      setRecordedAt(today);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const rollback = entries;
    await mutate(entries.filter((e) => e.id !== id), false);
    try {
      await api.del(`/client/me/activity/${id}`);
      await mutate();
    } catch {
      await mutate(rollback, false);
    }
  };

  return (
    <div className="dash-section">
      <div className="dash-section-head">
        <div className="dash-section-title">{t('activity_log')}</div>
        <div className="dash-section-sub">{t('activity_log_desc')}</div>
      </div>
      <div className="dash-section-body">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            className="dash-input"
            type="text"
            placeholder={t('activity_type_placeholder')}
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            style={{ width: 180 }}
          />
          <input
            className="dash-input"
            type="number"
            min="1"
            placeholder={t('duration_placeholder')}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            style={{ width: 80 }}
          />
          <input
            className="dash-input"
            type="date"
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            style={{ width: 150 }}
          />
          <button className="dash-btn-save" onClick={handleLog} disabled={saving || !activityType || !durationMinutes}>
            {saving ? t('activity_saving') : t('activity_save')}
          </button>
        </div>
        {entries.length > 0 && (
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid rgba(139,115,85,0.1)' }}>
                  <td style={{ padding: '6px 0', color: 'var(--nc-stone)' }}>{e.recorded_at}</td>
                  <td style={{ padding: '6px 0', fontWeight: 600 }}>{e.activity_type}</td>
                  <td style={{ padding: '6px 0', color: 'var(--nc-stone)' }}>{e.duration_minutes} min</td>
                  <td style={{ padding: '6px 0', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(e.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--nc-stone)', fontSize: 16 }}
                      aria-label={t('delete_activity')}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClientProfilePage() {
  const t = useTranslations('dashboard.client_profile');
  const { user } = useAuth();
  const { profile, isLoading, mutate } = useMyClientProfile();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [activityLevel, setActivityLevel] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [preferredLocale, setPreferredLocale] = useState<'es' | 'en'>(locale as 'es' | 'en');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio);
      setCity(profile.city);
      setBirthDate(profile.birth_date ?? '');
      setHeightCm(profile.height_cm !== null ? String(profile.height_cm) : '');
      setGender(profile.gender || null);
      setActivityLevel(profile.activity_level ?? '');
      setGoals(profile.goals);
      setDietaryRestrictions(profile.dietary_restrictions);
      setAllergies(profile.allergies);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!displayName.trim()) { setSaveMsg(t('error_display_name_required')); return; }
    setSaving(true);
    setSaveMsg('');
    try {
      const body = {
        display_name: displayName.trim(),
        bio,
        city,
        birth_date: birthDate || undefined,
        height_cm: heightCm ? parseInt(heightCm, 10) : null,
        gender: gender || null,
        activity_level: activityLevel,
        goals,
        dietary_restrictions: dietaryRestrictions,
        allergies,
      };
      if (!profile) {
        await api.post('/client/me', body);
      } else {
        await api.put('/client/me', body);
      }
      await mutate();
      setSaveMsg(t('saved'));
    } catch (err) {
      setSaveMsg(err instanceof ApiRequestError ? err.message : t('error_save_failed'));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dash-content" style={{ padding: 40, color: 'var(--nc-stone)', fontWeight: 300 }}>
        {t('loading')}
      </div>
    );
  }

  if (user && user.role !== 'client') {
    return (
      <div className="dash-content" style={{ padding: 40 }}>
        <p style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>
          {t('client_only')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">{t('title')}</div>
      </div>

      <div className="dash-content">
        {/* Profile Photo */}
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">{t('profile_photo')}</div>
            <div className="dash-section-sub">{t('profile_photo_desc')}</div>
          </div>
          <div className="dash-section-body">
            <AvatarUpload
              currentAvatarUrl={profile?.avatar_url ?? null}
              displayName={displayName}
              onUploadSuccess={(url) => {
                mutate();
              }}
              onDeleteSuccess={() => {
                mutate();
              }}
            />
          </div>
        </div>

        {/* Info básica */}
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">{t('basic_info')}</div>
            <div className="dash-section-sub">{t('basic_info_desc')}</div>
          </div>
          <div className="dash-section-body">
            <div className="dash-row">
              <div className="dash-field">
                <label className="dash-label">{t('display_name')} <span className="opt">{t('display_name_required')}</span></label>
                <input
                  className="dash-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('display_name_placeholder')}
                />
              </div>
              <div className="dash-field">
                <label className="dash-label">{t('city')}</label>
                <input
                  className="dash-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('city_placeholder')}
                />
              </div>
            </div>
            <div className="dash-row">
              <div className="dash-field">
                <label className="dash-label">{t('language')}</label>
                <select
                  className="dash-input"
                  value={preferredLocale}
                  onChange={async (e) => {
                    const newLocale = e.target.value as 'es' | 'en';
                    setPreferredLocale(newLocale);
                    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
                    try {
                      await api.put('/user/preferences', { preferred_locale: newLocale });
                    } catch (e) {
                      console.error('Failed to update locale preference:', e);
                    }
                    const segments = pathname.split('/');
                    segments[1] = newLocale;
                    const newPath = segments.join('/');
                    router.push(newPath);
                    router.refresh();
                  }}
                >
                  <option value="es">🇪🇸 Español (Spanish)</option>
                  <option value="en">🇬🇧 English (Inglés)</option>
                </select>
              </div>
            </div>
            <div className="dash-row single">
              <div className="dash-field">
                <label className="dash-label">{t('bio')}</label>
                <textarea
                  className="dash-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('bio_placeholder')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Salud */}
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">{t('health')}</div>
            <div className="dash-section-sub">{t('health_desc')}</div>
          </div>
          <div className="dash-section-body">
            <div className="dash-row three">
              <div className="dash-field">
                <label className="dash-label">{t('birth_date')}</label>
                <input
                  className="dash-input"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              <div className="dash-field">
                <label className="dash-label">{t('height')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    className="dash-input"
                    type="number"
                    min="50"
                    max="250"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="178"
                    style={{ flex: 1 }}
                  />
                  <span style={{ color: 'var(--nc-stone)', fontSize: 13 }}>{t('height_unit')}</span>
                </div>
              </div>
              <div className="dash-field">
                <label className="dash-label">{t('gender')}</label>
                <select
                  value={gender || ''}
                  onChange={(e) => setGender(e.target.value || null)}
                  className="dash-input"
                >
                  <option value="">{t('gender_not_specified')}</option>
                  <option value="male">{t('gender_male')}</option>
                  <option value="female">{t('gender_female')}</option>
                  <option value="other">{t('gender_other')}</option>
                  <option value="prefer_not_to_say">{t('gender_prefer_not_to_say')}</option>
                </select>
              </div>
              <div className="dash-field">
                <label className="dash-label">{t('activity_level')}</label>
                <select
                  className="dash-input"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                >
                  <option value="">{t('activity_level_select')}</option>
                  <option value="sedentary">{t('activity_level_sedentary')}</option>
                  <option value="lightly_active">{t('activity_level_lightly_active')}</option>
                  <option value="moderately_active">{t('activity_level_moderately_active')}</option>
                  <option value="very_active">{t('activity_level_very_active')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Objetivos y preferencias */}
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">{t('objectives_preferences')}</div>
            <div className="dash-section-sub">{t('objectives_preferences_desc')}</div>
          </div>
          <div className="dash-section-body">
            <div className="dash-row single" style={{ marginBottom: 18 }}>
              <div className="dash-field">
                <label className="dash-label">{t('goals')}</label>
                <TagInput
                  tags={goals}
                  onChange={setGoals}
                  placeholder={t('goals_placeholder')}
                  chipClass="specialty"
                />
              </div>
            </div>
            <div className="dash-row">
              <div className="dash-field">
                <label className="dash-label">{t('dietary_restrictions')}</label>
                <TagInput
                  tags={dietaryRestrictions}
                  onChange={setDietaryRestrictions}
                  placeholder={t('dietary_restrictions_placeholder')}
                  chipClass="lang"
                />
              </div>
              <div className="dash-field">
                <label className="dash-label">{t('allergies')}</label>
                <TagInput
                  tags={allergies}
                  onChange={setAllergies}
                  placeholder={t('allergies_placeholder')}
                  chipClass="cert"
                />
              </div>
            </div>
          </div>
        </div>

        <WeightLogWidget />
        <ActivityLogWidget />

        {profile?.bmi && (
          <div className="dash-section">
            <div className="dash-section-head">
              <div className="dash-section-title">{t('bmi')}</div>
              <div className="dash-section-sub">{t('bmi_desc')}</div>
            </div>
            <div className="dash-section-body">
              <BMIBadge
                bmi={profile.bmi}
                bmi_category={profile.bmi_category}
              />
            </div>
          </div>
        )}
      </div>

      <div className="dash-save-bar">
        <span className="dash-save-hint">{saveMsg || (profile ? t('unsaved_changes') : t('create_profile_prompt'))}</span>
        <div className="dash-save-actions">
          <button className="dash-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? t('saving') : profile ? t('save_changes') : t('create_profile')}
          </button>
        </div>
      </div>
    </>
  );
}
