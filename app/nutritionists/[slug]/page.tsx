'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { usePublicProfile } from '@/lib/profile';
import { connectWithNutritionist } from '@/lib/hiring';
import { api } from '@/lib/api';
import { WaitlistButton } from '@/components/WaitlistButton';
import useSWR from 'swr';

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function formatPrice(cents: number): string {
  return `€${Math.floor(cents / 100)}`;
}

function billingLabel(type: string): string {
  return type === 'monthly' ? '/month' : ' one-time';
}

export default function PublicProfilePage() {
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
      alert('Could not send connection request. Please try again.');
    } finally {
      setConnecting(null);
    }
  }

  if (isLoading) {
    return (
      <div style={{ background: 'var(--nc-cream)', minHeight: '100vh' }}>
        <nav className="nc-nav">
          <Link href="/nutritionists" className="nc-nav-logo">Nutri<span>Connect</span></Link>
        </nav>
        <div style={{ padding: '80px 48px', color: 'var(--nc-stone)', fontWeight: 300 }}>Loading…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ background: 'var(--nc-cream)', minHeight: '100vh' }}>
        <nav className="nc-nav">
          <Link href="/nutritionists" className="nc-nav-logo">Nutri<span>Connect</span></Link>
          <Link href="/nutritionists" className="nc-nav-links" style={{ color: 'rgba(245,240,232,0.65)', textDecoration: 'none', fontSize: 13 }}>← Back to nutritionists</Link>
        </nav>
        <div style={{ padding: '80px 48px', color: 'var(--nc-stone)', fontWeight: 300 }}>
          Profile not found.
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
        <Link href="/nutritionists" className="nc-nav-logo">Nutri<span>Connect</span></Link>
        <Link href="/nutritionists" style={{ color: 'rgba(245,240,232,0.65)', textDecoration: 'none', fontSize: 13 }}>← Back to nutritionists</Link>
      </nav>

      <div className="nc-profile-hero">
        <div className="nc-profile-hero-inner">
          <div>
            {isAvailable && <div className="nc-profile-badge">Available</div>}
            {isAtCapacity && <div className="nc-profile-badge" style={{ background: 'rgba(180,140,60,0.15)', color: '#b48c3c' }}>Lista de espera</div>}
            {isClosed && <div className="nc-profile-badge" style={{ background: 'rgba(139,115,85,0.12)', color: 'var(--nc-stone)' }}>No acepta nuevos clientes</div>}
            <h1 className="nc-profile-name">
              {firstName}
              {rest && <><br /><em>{rest}</em></>}
            </h1>
            <div className="nc-profile-pills">
              {profile.city && <span className="nc-pill">📍 {profile.city}</span>}
              {profile.years_exp !== null && <span className="nc-pill">{profile.years_exp} years experience</span>}
            </div>
          </div>
          <div className="nc-hero-avatar">{initials(profile.display_name)}</div>
        </div>
        <div className="nc-hero-tabs">
          <div className="nc-hero-tab active">About</div>
          <div className="nc-hero-tab">Packages</div>
          <div className="nc-hero-tab">Certifications</div>
        </div>
      </div>

      <div className="nc-profile-content">
        {/* Left column */}
        <div>
          <p className="nc-section-label">About</p>
          <p className="nc-bio">{profile.bio || 'No bio provided yet.'}</p>

          <div className="nc-divider" />

          {profile.specialties.length > 0 && (
            <div className="nc-tags-section">
              <p className="nc-section-label">Specialties</p>
              <div className="nc-tags-row">
                {profile.specialties.map((s) => (
                  <span key={s} className="nc-profile-tag specialty">{s}</span>
                ))}
              </div>
            </div>
          )}

          {profile.languages.length > 0 && (
            <div className="nc-tags-section">
              <p className="nc-section-label">Languages</p>
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
                <p className="nc-section-label">Certifications</p>
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
            <div className="nc-pkg-title">Service packages</div>
            <div className="nc-pkg-subtitle">Choose the plan that fits you</div>
          </div>
          {profile.packages.length === 0 ? (
            <div style={{ padding: '20px 22px', color: 'var(--nc-stone)', fontSize: 13, fontWeight: 300 }}>
              No packages listed yet.
            </div>
          ) : (
            profile.packages.map((pkg) => (
              <div key={pkg.id} className="nc-pkg-item">
                <div className="nc-pkg-row">
                  <div>
                    <div className="nc-pkg-name">{pkg.name}</div>
                    <div className="nc-pkg-sessions">
                      {pkg.sessions} session{pkg.sessions !== 1 ? 's' : ''}
                      {' · '}
                      <span style={{ color: 'var(--nc-stone)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {pkg.billing_type === 'monthly' ? 'Monthly' : 'One-time'}
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
                  {isClosed && (
                    <p style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300, padding: '8px 0', margin: 0 }}>
                      No acepta nuevos clientes
                    </p>
                  )}
                  {isAtCapacity && (
                    <WaitlistButton slug={slug} />
                  )}
                  {isAvailable && (
                    connected ? (
                      <div style={{ fontSize: 13, color: '#4a7c59', fontWeight: 500, padding: '8px 0' }}>
                        ✓ Request sent — check your dashboard
                      </div>
                    ) : (
                      <button
                        className="nc-btn-contact"
                        style={{ width: '100%', cursor: connecting === pkg.id ? 'wait' : 'pointer' }}
                        disabled={connecting === pkg.id}
                        onClick={() => handleConnect(pkg.id)}
                      >
                        {connecting === pkg.id ? 'Sending request…' : 'Work with me'}
                      </button>
                    )
                  )}
                </div>
              </div>
            ))
          )}
          {profile.intro_consultation_required && (
            <div style={{ padding: '12px 22px', fontSize: 12, color: 'var(--nc-stone)', borderTop: '1px solid rgba(139,115,85,0.1)' }}>
              Includes a free intro consultation before your plan begins.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
