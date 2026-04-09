// frontend/app/nutritionists/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePublicProfiles } from '@/lib/profile';
import type { ProfileSummary } from '@/lib/types';

const BANNER_CLASSES = [
  'nc-banner-1', 'nc-banner-2', 'nc-banner-3',
  'nc-banner-4', 'nc-banner-5', 'nc-banner-6',
];

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function formatPrice(cents: number | null): string {
  if (cents === null) return '—';
  return `€${Math.floor(cents / 100)}`;
}

function NutriCard({ profile, index }: { profile: ProfileSummary; index: number }) {
  const bannerClass = BANNER_CLASSES[index % BANNER_CLASSES.length];
  return (
    <div className="nc-card">
      <div className={`nc-card-banner ${bannerClass}`}>
        <div className="nc-card-initials">{initials(profile.display_name)}</div>
      </div>
      <div className="nc-card-body">
        <div className="nc-card-name">{profile.display_name}</div>
        <div className="nc-card-meta">
          {profile.city && <span>{profile.city}</span>}
          {profile.city && profile.years_exp !== null && (
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--nc-stone-lt)', display: 'inline-block' }} />
          )}
          {profile.years_exp !== null && <span>{profile.years_exp} yrs exp.</span>}
        </div>
        <div className="nc-card-tags">
          {profile.specialties.slice(0, 2).map((s) => (
            <span key={s} className="nc-tag specialty">{s}</span>
          ))}
          {profile.languages.slice(0, 1).map((l) => (
            <span key={l} className="nc-tag lang">{l}</span>
          ))}
        </div>
        <div className="nc-card-divider" />
        <div className="nc-card-footer">
          <div className="nc-card-price">
            From <strong>{formatPrice(profile.lowest_price_cents)}</strong>
            {profile.lowest_price_cents !== null && <span style={{ fontSize: 11 }}>/session</span>}
          </div>
          <Link href={`/nutritionists/${profile.slug}`} className="nc-btn-view">
            View profile →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function NutritionistsPage() {
  const [page, setPage] = useState(1);
  const { profiles, total, isLoading } = usePublicProfiles(page, 12);

  return (
    <div style={{ background: 'var(--nc-cream)', minHeight: '100vh' }}>
      <nav className="nc-nav">
        <Link href="/" className="nc-nav-logo">Nutri<span>Connect</span></Link>
        <div className="nc-nav-links">
          <Link href="/login">Sign in</Link>
          <Link href="/register" className="nc-nav-cta">Join as nutritionist</Link>
        </div>
      </nav>

      <div className="nc-hero">
        <p className="nc-hero-label">Find your match</p>
        <h1>Meet the nutritionist<br />who <em>gets you</em></h1>
        <p>Browse certified professionals. Find someone whose approach fits your life.</p>
        <div className="nc-filters">
          <input className="nc-filter-input wide" type="text" placeholder="Search by name or keyword…" />
          <input className="nc-filter-input medium" type="text" placeholder="City" />
          <button className="nc-filter-btn">Search</button>
        </div>
      </div>

      <div className="nc-stats-bar">
        <div className="nc-stat-item">
          <span className="nc-stat-number">{total}</span>
          <span className="nc-stat-label">Certified nutritionists</span>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--nc-stone)', fontWeight: 300 }}>
          Loading nutritionists…
        </div>
      ) : profiles.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--nc-stone)', fontWeight: 300 }}>
          No nutritionists found yet.
        </div>
      ) : (
        <div className="nc-grid-container">
          <div className="nc-grid">
            {profiles.map((p, i) => (
              <NutriCard key={p.id} profile={p} index={i} />
            ))}
          </div>
        </div>
      )}

      {profiles.length > 0 && profiles.length < total && (
        <div style={{ textAlign: 'center', padding: '0 48px 64px' }}>
          <button
            onClick={() => setPage((p) => p + 1)}
            style={{
              height: 44, padding: '0 36px', background: 'transparent',
              border: '1.5px solid var(--nc-border)', borderRadius: 6,
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--nc-stone)',
              cursor: 'pointer',
            }}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
