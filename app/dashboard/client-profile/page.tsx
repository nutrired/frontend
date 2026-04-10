// frontend/app/dashboard/client-profile/page.tsx
'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { useMyClientProfile, useWeightEntries, useActivityEntries } from '@/lib/client-profile';
import { api, ApiRequestError } from '@/lib/api';

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

// ─── Weight Log Widget ────────────────────────────────────────────────────────

function WeightLogWidget() {
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
    await mutate(
      entries.filter((e) => e.id !== id),
      false,
    );
    await api.del(`/client/me/weight/${id}`);
    await mutate();
  };

  return (
    <div className="dash-section">
      <div className="dash-section-head">
        <div className="dash-section-title">Registro de peso</div>
        <div className="dash-section-sub">Añade tu peso diario para hacer seguimiento</div>
      </div>
      <div className="dash-section-body">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
          <input
            className="dash-input"
            type="number"
            step="0.1"
            min="0"
            placeholder="kg"
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
            {saving ? 'Guardando…' : 'Registrar'}
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
                      aria-label="Delete weight entry"
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
    await mutate(
      entries.filter((e) => e.id !== id),
      false,
    );
    await api.del(`/client/me/activity/${id}`);
    await mutate();
  };

  return (
    <div className="dash-section">
      <div className="dash-section-head">
        <div className="dash-section-title">Registro de actividad</div>
        <div className="dash-section-sub">Registra tu actividad física diaria</div>
      </div>
      <div className="dash-section-body">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            className="dash-input"
            type="text"
            placeholder="Actividad (ej: Running)"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            style={{ width: 180 }}
          />
          <input
            className="dash-input"
            type="number"
            min="1"
            placeholder="min"
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
            {saving ? 'Guardando…' : 'Registrar'}
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
                      aria-label="Delete activity entry"
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
  const { user } = useAuth();
  const { profile, isLoading, mutate } = useMyClientProfile();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio);
      setCity(profile.city);
      setBirthDate(profile.birth_date ?? '');
      setHeightCm(profile.height_cm !== null ? String(profile.height_cm) : '');
      setActivityLevel(profile.activity_level ?? '');
      setGoals(profile.goals);
      setDietaryRestrictions(profile.dietary_restrictions);
      setAllergies(profile.allergies);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!displayName.trim()) { setSaveMsg('El nombre es obligatorio.'); return; }
    setSaving(true);
    setSaveMsg('');
    try {
      const body = {
        display_name: displayName.trim(),
        bio,
        city,
        birth_date: birthDate || undefined,
        height_cm: heightCm ? parseInt(heightCm, 10) : null,
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
      setSaveMsg('Guardado.');
    } catch (err) {
      setSaveMsg(err instanceof ApiRequestError ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dash-content" style={{ padding: 40, color: 'var(--nc-stone)', fontWeight: 300 }}>
        Cargando…
      </div>
    );
  }

  if (user && user.role !== 'client') {
    return (
      <div className="dash-content" style={{ padding: 40 }}>
        <p style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>
          Esta sección es solo para clientes.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">Mi perfil</div>
      </div>

      <div className="dash-content">
        {/* Info básica */}
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">Info básica</div>
            <div className="dash-section-sub">Cómo te conocerá tu nutricionista</div>
          </div>
          <div className="dash-section-body">
            <div className="dash-row">
              <div className="dash-field">
                <label className="dash-label">Nombre <span className="opt">(obligatorio)</span></label>
                <input
                  className="dash-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>
              <div className="dash-field">
                <label className="dash-label">Ciudad</label>
                <input
                  className="dash-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Madrid"
                />
              </div>
            </div>
            <div className="dash-row single">
              <div className="dash-field">
                <label className="dash-label">Bio</label>
                <textarea
                  className="dash-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntanos algo sobre ti y tus hábitos…"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Salud */}
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">Salud</div>
            <div className="dash-section-sub">Información para personalizar tu plan</div>
          </div>
          <div className="dash-section-body">
            <div className="dash-row three">
              <div className="dash-field">
                <label className="dash-label">Fecha de nacimiento</label>
                <input
                  className="dash-input"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              <div className="dash-field">
                <label className="dash-label">Altura</label>
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
                  <span style={{ color: 'var(--nc-stone)', fontSize: 13 }}>cm</span>
                </div>
              </div>
              <div className="dash-field">
                <label className="dash-label">Nivel de actividad</label>
                <select
                  className="dash-input"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                >
                  <option value="">— seleccionar —</option>
                  <option value="sedentary">Sedentario</option>
                  <option value="lightly_active">Ligeramente activo</option>
                  <option value="moderately_active">Moderadamente activo</option>
                  <option value="very_active">Muy activo</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Objetivos y preferencias */}
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">Objetivos y preferencias</div>
            <div className="dash-section-sub">Enter o coma para añadir cada elemento</div>
          </div>
          <div className="dash-section-body">
            <div className="dash-row single" style={{ marginBottom: 18 }}>
              <div className="dash-field">
                <label className="dash-label">Objetivos</label>
                <TagInput
                  tags={goals}
                  onChange={setGoals}
                  placeholder="ej: Pérdida de peso"
                  chipClass="specialty"
                />
              </div>
            </div>
            <div className="dash-row">
              <div className="dash-field">
                <label className="dash-label">Restricciones dietéticas</label>
                <TagInput
                  tags={dietaryRestrictions}
                  onChange={setDietaryRestrictions}
                  placeholder="ej: Vegano"
                  chipClass="lang"
                />
              </div>
              <div className="dash-field">
                <label className="dash-label">Alergias</label>
                <TagInput
                  tags={allergies}
                  onChange={setAllergies}
                  placeholder="ej: Frutos secos"
                  chipClass="cert"
                />
              </div>
            </div>
          </div>
        </div>

        <WeightLogWidget />
        <ActivityLogWidget />
      </div>

      <div className="dash-save-bar">
        <span className="dash-save-hint">{saveMsg || (profile ? 'Cambios sin guardar' : 'Crea tu perfil para empezar')}</span>
        <div className="dash-save-actions">
          <button className="dash-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : profile ? 'Guardar cambios' : 'Crear perfil'}
          </button>
        </div>
      </div>
    </>
  );
}
