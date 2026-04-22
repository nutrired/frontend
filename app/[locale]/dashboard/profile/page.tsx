'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useMyProfile } from '@/lib/profile';
import { api, ApiRequestError } from '@/lib/api';
import type { ServicePackage } from '@/lib/types';
import { AvatarUpload } from '@/components/AvatarUpload';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

interface PkgDraft {
  id?: string;
  name: string;
  description: string;
  price_cents: number;
  sessions: number;
}

function TagInput({
  tags, onChange, placeholder, chipClass,
}: { tags: string[]; onChange: (t: string[]) => void; placeholder: string; chipClass: string }) {
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

export default function DashboardProfilePage() {
  const t = useTranslations('dashboard.profile');
  const { user } = useAuth();
  const { profile, isLoading, mutate } = useMyProfile();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [packages, setPackages] = useState<PkgDraft[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [introConsultationRequired, setIntroConsultationRequired] = useState(false);
  const [acceptingNewClients, setAcceptingNewClients] = useState(true);
  const [consultationType, setConsultationType] = useState<'in_person' | 'online' | 'both'>('in_person');
  const [preferredLocale, setPreferredLocale] = useState<'es' | 'en'>(locale as 'es' | 'en');

  // Pre-fill form when profile loads.
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio);
      setCity(profile.city);
      setYearsExp(profile.years_exp !== null ? String(profile.years_exp) : '');
      setSpecialties(profile.specialties);
      setLanguages(profile.languages);
      setCertifications(profile.certifications);
      setStatus(profile.status);
      setIntroConsultationRequired(profile.intro_consultation_required ?? false);
      setAcceptingNewClients(profile.accepting_new_clients ?? true);
      setConsultationType(profile.consultation_type || 'in_person');
      setPackages(
        profile.packages.map((p: ServicePackage) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price_cents: p.price_cents,
          sessions: p.sessions,
        }))
      );
    }
  }, [profile]);

  const isProfileComplete = () => {
    if (!displayName.trim() || !bio.trim() || specialties.length === 0) {
      return false;
    }
    if ((consultationType === 'in_person' || consultationType === 'both') && !city.trim()) {
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!displayName.trim()) { setSaveMsg(t('display_name_required_msg')); return; }
    setSaving(true);
    setSaveMsg('');
    try {
      const body = {
        display_name: displayName.trim(),
        bio,
        city: (consultationType === 'in_person' || consultationType === 'both') ? city : '',
        consultation_type: consultationType,
        years_exp: yearsExp ? parseInt(yearsExp, 10) : null,
        specialties, languages, certifications,
        intro_consultation_required: introConsultationRequired,
        accepting_new_clients: acceptingNewClients,
      };

      if (!profile) {
        // Create profile.
        await api.post('/profile/me', body);
      } else {
        // Update profile.
        await api.put('/profile/me', body);

        // Sync packages: delete removed, create new, update existing.
        const existingIds = new Set(profile.packages.map((p: ServicePackage) => p.id));
        const draftIds = new Set(packages.filter((p) => p.id).map((p) => p.id!));

        // Delete removed packages.
        for (const p of profile.packages as ServicePackage[]) {
          if (!draftIds.has(p.id)) {
            await api.del(`/profile/me/packages/${p.id}`);
          }
        }

        for (const pkg of packages) {
          const pkgBody = {
            name: pkg.name, description: pkg.description,
            price_cents: pkg.price_cents, sessions: pkg.sessions,
          };
          if (pkg.id && existingIds.has(pkg.id)) {
            await api.put(`/profile/me/packages/${pkg.id}`, pkgBody);
          } else if (!pkg.id) {
            await api.post('/profile/me/packages', pkgBody);
          }
        }
      }

      await mutate();
      setSaveMsg('Saved.');
    } catch (err) {
      setSaveMsg(err instanceof ApiRequestError ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    const next = status === 'draft' ? 'published' : 'draft';
    try {
      await api.put('/profile/me/status', { status: next });
      setStatus(next);
      await mutate();
    } catch {
      /* ignore */
    }
  };

  const addPackage = () => setPackages([...packages, { name: '', description: '', price_cents: 0, sessions: 1 }]);
  const removePackage = (i: number) => setPackages(packages.filter((_, idx) => idx !== i));
  const updatePkg = (i: number, field: keyof PkgDraft, value: string | number) =>
    setPackages(packages.map((p, idx) => idx === i ? { ...p, [field]: value } : p));

  if (isLoading) {
    return (
      <div className="dash-content" style={{ padding: 40, color: 'var(--nc-stone)', fontWeight: 300 }}>
        {t('loading')}
      </div>
    );
  }

  // Only nutritionists can have profiles.
  if (user && user.role !== 'nutritionist') {
    return (
      <div className="dash-content" style={{ padding: 40 }}>
        <p style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>
          {t('nutritionist_only')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">{t('title')}</div>
        <div className="dash-topbar-right">
          <span className={`dash-status-badge ${status}`}>{status}</span>
          {profile && (
            <Link href={`/${locale}/nutritionists/${profile.slug}`} target="_blank" className="dash-btn-preview">
              {t('preview')}
            </Link>
          )}
          {profile && (
            <button className="dash-btn-publish" onClick={handleToggleStatus}>
              {status === 'draft' ? t('publish') : t('unpublish')}
            </button>
          )}
        </div>
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

        {/* Basic info */}
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">{t('basic_info')}</div>
            <div className="dash-section-sub">{t('basic_info_desc')}</div>
          </div>
          <div className="dash-section-body">
            <div className="dash-row">
              <div className="dash-field">
                <label className="dash-label">{t('display_name')} <span className="opt">{t('display_name_required')}</span></label>
                <input className="dash-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t('display_name_placeholder')} />
                {profile && (
                  <span style={{ fontSize: 11, color: 'var(--nc-stone)', fontFamily: 'monospace', background: 'rgba(139,115,85,0.08)', padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(139,115,85,0.15)' }}>
                    nutri.red/nutritionists/<strong style={{ color: 'var(--nc-terra)' }}>{profile.slug}</strong>
                  </span>
                )}
              </div>
              <div className="dash-field">
                <label className="dash-label">{t('consultation_type')}</label>
                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="radio" name="consultation_type" value="in_person"
                           checked={consultationType === 'in_person'}
                           onChange={(e) => setConsultationType(e.target.value as any)} />
                    <span style={{ fontSize: 14 }}>{t('consultation_type_in_person')}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="radio" name="consultation_type" value="online"
                           checked={consultationType === 'online'}
                           onChange={(e) => setConsultationType(e.target.value as any)} />
                    <span style={{ fontSize: 14 }}>{t('consultation_type_online')}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="radio" name="consultation_type" value="both"
                           checked={consultationType === 'both'}
                           onChange={(e) => setConsultationType(e.target.value as any)} />
                    <span style={{ fontSize: 14 }}>{t('consultation_type_both')}</span>
                  </label>
                </div>
              </div>
              <div className="dash-field">
                <label className="dash-label">{t('preferred_language')}</label>
                <select
                  className="dash-input"
                  value={preferredLocale}
                  onChange={async (e) => {
                    const newLocale = e.target.value as 'es' | 'en';
                    setPreferredLocale(newLocale);

                    // Update cookie
                    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

                    // Update backend
                    try {
                      await api.put('/user/preferences', { preferred_locale: newLocale });
                    } catch (e) {
                      console.error('Failed to update locale preference:', e);
                    }

                    // Redirect to new locale
                    const segments = pathname.split('/');
                    segments[1] = newLocale;
                    const newPath = segments.join('/');
                    router.push(newPath);
                    router.refresh();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="es">🇪🇸 Español (Spanish)</option>
                  <option value="en">🇬🇧 English (Inglés)</option>
                </select>
                <span style={{ fontSize: 12, color: 'var(--nc-stone)', marginTop: 4 }}>
                  {t('interface_language')}
                </span>
              </div>
            </div>
            <div className="dash-row">
              {(consultationType === 'in_person' || consultationType === 'both') && (
                <div className="dash-field">
                  <label className="dash-label">{t('city')}</label>
                  <input className="dash-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder={t('city_placeholder')} />
                </div>
              )}
            </div>
            <div className="dash-row single">
              <div className="dash-field">
                <label className="dash-label">{t('bio')}</label>
                <textarea className="dash-textarea" value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t('bio_placeholder')} />
              </div>
            </div>
            <div className="dash-row three">
              <div className="dash-field">
                <label className="dash-label">{t('years_experience')}</label>
                <input className="dash-input" type="number" min="0" max="60" value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} placeholder={t('years_experience_placeholder')} />
              </div>
            </div>
          </div>
        </div>

        {/* Expertise */}
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">{t('expertise')}</div>
            <div className="dash-section-sub">{t('expertise_desc')}</div>
          </div>
          <div className="dash-section-body">
            <div className="dash-row single" style={{ marginBottom: 18 }}>
              <div className="dash-field">
                <label className="dash-label">{t('specialties')}</label>
                <TagInput tags={specialties} onChange={setSpecialties} placeholder={t('specialties_placeholder')} chipClass="specialty" />
              </div>
            </div>
            <div className="dash-row">
              <div className="dash-field">
                <label className="dash-label">{t('languages')}</label>
                <TagInput tags={languages} onChange={setLanguages} placeholder={t('languages_placeholder')} chipClass="lang" />
              </div>
              <div className="dash-field">
                <label className="dash-label">{t('certifications')}</label>
                <TagInput tags={certifications} onChange={setCertifications} placeholder={t('certifications_placeholder')} chipClass="cert" />
              </div>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">{t('service_packages')}</div>
            <div className="dash-section-sub">{t('service_packages_desc')}</div>
          </div>
          <div className="dash-section-body">
            <div className="dash-pkg-list">
              {packages.map((pkg, i) => (
                <div key={i} className="dash-pkg-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <input
                      className="dash-pkg-input"
                      value={pkg.name}
                      onChange={(e) => updatePkg(i, 'name', e.target.value)}
                      placeholder={t('package_name')}
                    />
                    <input
                      className="dash-pkg-input sm"
                      value={pkg.description}
                      onChange={(e) => updatePkg(i, 'description', e.target.value)}
                      placeholder={t('package_description')}
                    />
                  </div>
                  <div className="dash-field">
                    <label className="dash-label" style={{ fontSize: 11 }}>{t('sessions')}</label>
                    <input
                      className="dash-pkg-input"
                      type="number" min="1"
                      value={pkg.sessions}
                      onChange={(e) => updatePkg(i, 'sessions', parseInt(e.target.value, 10) || 1)}
                    />
                  </div>
                  <div className="dash-field">
                    <label className="dash-label" style={{ fontSize: 11 }}>{t('price_eur')}</label>
                    <input
                      className="dash-pkg-input"
                      type="number" min="0"
                      value={Math.floor(pkg.price_cents / 100)}
                      onChange={(e) => updatePkg(i, 'price_cents', (parseInt(e.target.value, 10) || 0) * 100)}
                    />
                  </div>
                  <button className="dash-pkg-delete" onClick={() => removePackage(i)}>×</button>
                </div>
              ))}
            </div>
            <button className="dash-btn-add-pkg" onClick={addPackage}>{t('add_package')}</button>
          </div>
        </div>

        {/* Plan & Settings */}
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">{t('plan_settings')}</div>
            <div className="dash-section-sub">{t('plan_settings_desc')}</div>
          </div>
          <div className="dash-section-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="checkbox"
                id="intro-consultation"
                checked={introConsultationRequired}
                onChange={(e) => setIntroConsultationRequired(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--nc-terra)' }}
              />
              <label htmlFor="intro-consultation" style={{ fontSize: 14, color: 'var(--nc-ink)', cursor: 'pointer' }}>
                {t('intro_consultation')}
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <button
                role="switch"
                aria-checked={acceptingNewClients}
                className={`dash-toggle${acceptingNewClients ? ' on' : ''}`}
                onClick={() => {
                  if (!acceptingNewClients && !isProfileComplete()) {
                    setSaveMsg(t('profile_incomplete'));
                    return;
                  }
                  setAcceptingNewClients((v) => !v);
                }}
                disabled={!isProfileComplete()}
                aria-label={t('accepting_new_clients')}
                style={{ opacity: !isProfileComplete() ? 0.5 : 1, cursor: isProfileComplete() ? 'pointer' : 'not-allowed' }}
              />
              <label
                htmlFor="accepting-new-clients"
                style={{ fontSize: 14, color: 'var(--nc-ink)', cursor: isProfileComplete() ? 'pointer' : 'not-allowed' }}
                onClick={() => {
                  if (!isProfileComplete()) return;
                  if (!acceptingNewClients && !isProfileComplete()) {
                    setSaveMsg(t('profile_incomplete'));
                    return;
                  }
                  setAcceptingNewClients((v) => !v);
                }}
              >
                {t('accepting_new_clients')}
              </label>
              {!isProfileComplete() && (
                <span style={{ fontSize: 12, color: 'var(--nc-stone)', marginLeft: 'auto' }}>
                  {t('complete_profile_first')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Visibility */}
        {profile && (
          <div className="dash-section">
            <div className="dash-section-head">
              <div className="dash-section-title">{t('visibility')}</div>
              <div className="dash-section-sub">{t('visibility_desc')}</div>
            </div>
            <div className="dash-publish-row">
              <div className="dash-publish-label">
                <h3>{t('publish_profile')}</h3>
                <p>{t('publish_profile_desc')}</p>
              </div>
              <button
                className={`dash-toggle${status === 'published' ? ' on' : ''}`}
                onClick={handleToggleStatus}
                aria-label="Toggle publish status"
              />
            </div>
          </div>
        )}
      </div>

      {/* Plan info */}
      <div style={{ margin: '24px 40px 0', background: 'white', border: '1px solid rgba(139,115,85,0.15)', borderRadius: 8, padding: '20px 24px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--nc-ink)', marginBottom: 6 }}>
          {t('subscription_plan')}
        </div>
        <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>
          {t('current_tier')} <strong style={{ color: 'var(--nc-terra)', textTransform: 'capitalize' }}>{profile?.tier ?? 'free'}</strong>. {t('manage_plan')}{' '}
          <a href={`/${locale}/dashboard/billing`} style={{ color: 'var(--nc-terra)' }}>{t('billing_page')}</a>.
        </div>
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
