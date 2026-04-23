'use client';
import { toastError } from '@/lib/toast';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { usePublicProfile } from '@/lib/profile';
import { connectWithNutritionist } from '@/lib/hiring';
import { api } from '@/lib/api';
import { WaitlistButton } from '@/components/WaitlistButton';
import { Avatar } from '@/components/Avatar';
import useSWR from 'swr';

function formatPrice(cents: number): string {
  return `€${Math.floor(cents / 100)}`;
}

function billingLabel(type: string): string {
  return type === 'monthly' ? '/month' : ' one-time';
}

export default function PublicProfilePage() {
  const t = useTranslations('public.nutritionist_profile');
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { profile, isLoading } = usePublicProfile(slug);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const { data: me } = useSWR('/auth/me', () =>
    api.get<{ id: string; role: string }>('/auth/me').catch(() => null),
  );
  const isClient = me?.role === 'client';
  const isOwnProfile = me?.id === profile?.user_id;

  async function handleConnect(packageID: string) {
    if (!isClient) {
      router.push(`/login?from=/nutritionists/${slug}`);
      return;
    }
    setConnecting(packageID);
    try {
      await connectWithNutritionist(slug, packageID);
      setConnected(true);
    } catch {
      toastError('Could not send connection request. Please try again.');
    } finally {
      setConnecting(null);
    }
  }

  if (isLoading) {
    return (
      <div style={{ background: 'var(--nc-cream)', minHeight: '100vh' }}>
        <nav className="nc-nav">
          <Link href={`/${locale}/nutritionists`} className="nc-nav-logo">Nutri<span>Red</span></Link>
        </nav>
        <div style={{ padding: '80px 48px', color: 'var(--nc-stone)', fontWeight: 300 }}>{t('loading')}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ background: 'var(--nc-cream)', minHeight: '100vh' }}>
        <nav className="nc-nav">
          <Link href={`/${locale}/nutritionists`} className="nc-nav-logo">Nutri<span>Red</span></Link>
          <Link href={`/${locale}/nutritionists`} className="nc-nav-links" style={{ color: 'rgba(245,240,232,0.65)', textDecoration: 'none', fontSize: 13 }}>{t('back_to_nutritionists')}</Link>
        </nav>
        <div style={{ padding: '80px 48px', color: 'var(--nc-stone)', fontWeight: 300 }}>
          {t('not_found')}
        </div>
      </div>
    );
  }

  const nameParts = profile.display_name.split(' ');
  const firstName = nameParts[0];
  const rest = nameParts.slice(1).join(' ');

  const isClosed = !profile.accepting_new_clients;
  const isAtCapacity = profile.accepting_new_clients && profile.at_capacity;
  const isAvailable = profile.accepting_new_clients && !profile.at_capacity;

  return (
    <div style={{ background: 'var(--nc-cream)', minHeight: '100vh' }}>
      <nav className="nc-nav">
        <Link href={`/${locale}/nutritionists`} className="nc-nav-logo">Nutri<span>Red</span></Link>
        <Link href={`/${locale}/nutritionists`} style={{ color: 'rgba(245,240,232,0.65)', textDecoration: 'none', fontSize: 13 }}>{t('back_to_nutritionists')}</Link>
      </nav>

      <div className="nc-profile-hero">
        <div className="nc-profile-hero-inner">
          <div>
            {isAvailable && <div className="nc-profile-badge">{t('available')}</div>}
            {isAtCapacity && <div className="nc-profile-badge" style={{ background: 'rgba(180,140,60,0.15)', color: '#b48c3c' }}>{t('waitlist')}</div>}
            {isClosed && <div className="nc-profile-badge" style={{ background: 'rgba(139,115,85,0.12)', color: 'var(--nc-stone)' }}>{t('not_accepting')}</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
              <Avatar
                avatarUrl={profile.avatar_url}
                displayName={profile.display_name}
                size="large"
              />
              <h1 className="nc-profile-name" style={{ margin: 0 }}>
                {firstName}
                {rest && <><br /><em>{rest}</em></>}
              </h1>
            </div>
            <div className="nc-profile-pills">
              {profile.city && <span className="nc-pill">📍 {profile.city}</span>}
              {profile.years_exp !== null && <span className="nc-pill">{profile.years_exp} {t('years_experience')}</span>}
            </div>
          </div>
        </div>
        <div className="nc-hero-tabs">
          <div className="nc-hero-tab active">{t('about')}</div>
          <div className="nc-hero-tab">{t('packages')}</div>
          <div className="nc-hero-tab">{t('certifications')}</div>
        </div>
      </div>

      <div className="nc-profile-content">
        {/* Left column */}
        <div>
          <p className="nc-section-label">{t('about')}</p>
          <p className="nc-bio">{profile.bio || t('not_provided')}</p>

          <div className="nc-divider" />

          {profile.specialties.length > 0 && (
            <div className="nc-tags-section">
              <p className="nc-section-label">{t('specialties')}</p>
              <div className="nc-tags-row">
                {profile.specialties.map((s) => (
                  <span key={s} className="nc-profile-tag specialty">{s}</span>
                ))}
              </div>
            </div>
          )}

          {profile.languages.length > 0 && (
            <div className="nc-tags-section">
              <p className="nc-section-label">{t('languages')}</p>
              <div className="nc-tags-row">
                {profile.languages.map((l) => (
                  <span key={l} className="nc-profile-tag lang">{l}</span>
                ))}
              </div>
            </div>
          )}

          {profile.certifications.length > 0 && (
            <>
              <div className="nc-divider" />
              <div className="nc-tags-section">
                <p className="nc-section-label">{t('certifications')}</p>
                <div className="nc-tags-row">
                  {profile.certifications.map((c) => (
                    <span key={c} className="nc-profile-tag cert">{c}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right column: packages */}
        <div className="nc-pkg-card">
          <div className="nc-pkg-head">
            <div className="nc-pkg-title">{t('service_packages')}</div>
            <div className="nc-pkg-subtitle">{t('choose_plan')}</div>
          </div>
          {profile.packages.length === 0 ? (
            <div style={{ padding: '20px 22px', color: 'var(--nc-stone)', fontSize: 13, fontWeight: 300 }}>
              {t('no_packages')}
            </div>
          ) : (
            profile.packages.map((pkg) => (
              <div key={pkg.id} className="nc-pkg-item">
                <div className="nc-pkg-row">
                  <div>
                    <div className="nc-pkg-name">{pkg.name}</div>
                    <div className="nc-pkg-sessions">
                      {pkg.sessions} {pkg.sessions !== 1 ? t('sessions_plural') : t('sessions')}
                      {' · '}
                      <span style={{ color: 'var(--nc-stone)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {pkg.billing_type === 'monthly' ? t('monthly') : t('one_time')}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="nc-pkg-price">{formatPrice(pkg.price_cents)}</div>
                    <div style={{ fontSize: 11, color: 'var(--nc-stone)', fontWeight: 300 }}>
                      {billingLabel(pkg.billing_type)}
                    </div>
                  </div>
                </div>
                {pkg.description && <div className="nc-pkg-desc">{pkg.description}</div>}
                <div style={{ marginTop: 12 }}>
                  {isOwnProfile ? (
                    <p style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300, padding: '8px 0', margin: 0 }}>
                      {t('your_profile')}
                    </p>
                  ) : (
                    <>
                      {isClosed && (
                        <p style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300, padding: '8px 0', margin: 0 }}>
                          {t('not_accepting_clients')}
                        </p>
                      )}
                      {isAtCapacity && (
                        <WaitlistButton slug={slug} />
                      )}
                      {isAvailable && (
                        connected ? (
                          <div style={{ fontSize: 13, color: '#4a7c59', fontWeight: 500, padding: '8px 0' }}>
                            {t('request_sent')}
                          </div>
                        ) : (
                          <button
                            className="nc-btn-contact"
                            style={{ width: '100%', cursor: connecting === pkg.id ? 'wait' : 'pointer' }}
                            disabled={connecting === pkg.id}
                            onClick={() => handleConnect(pkg.id)}
                          >
                            {connecting === pkg.id ? t('sending') : t('work_with_me')}
                          </button>
                        )
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          {profile.intro_consultation_required && (
            <div style={{ padding: '12px 22px', fontSize: 12, color: 'var(--nc-stone)', borderTop: '1px solid rgba(139,115,85,0.1)' }}>
              {t('intro_consultation')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
