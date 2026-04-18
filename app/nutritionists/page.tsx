// frontend/app/nutritionists/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePublicProfiles } from '@/lib/profile';
import { SearchFilters } from './SearchFilters';
import { Avatar } from '@/components/Avatar';
import type { ProfileSummary } from '@/lib/types';

// ─── helpers (unchanged from before) ─────────────────────────────────────────

const BANNER_CLASSES = [
  'nc-banner-1', 'nc-banner-2', 'nc-banner-3',
  'nc-banner-4', 'nc-banner-5', 'nc-banner-6',
];

function formatPrice(cents: number | null): string {
  if (cents === null) return '—';
  return `€${Math.floor(cents / 100)}`;
}

function NutriCard({ profile, index }: { profile: ProfileSummary; index: number }) {
  const bannerClass = BANNER_CLASSES[index % BANNER_CLASSES.length];
  return (
    <div className="nc-card">
      <div className={`nc-card-banner ${bannerClass}`}>
        <Avatar
          avatarUrl={profile.avatar_url}
          displayName={profile.display_name}
          size="medium"
          className="nc-card-initials"
        />
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
        {!profile.accepting_new_clients && (
          <div style={{ padding: '6px 16px 12px' }}>
            <span style={{ fontSize: 11, color: 'var(--nc-stone)', background: 'rgba(139,115,85,0.1)', padding: '3px 8px', borderRadius: 4, fontWeight: 400 }}>
              No disponible
            </span>
          </div>
        )}
        {profile.at_capacity && profile.accepting_new_clients && (
          <div style={{ padding: '6px 16px 12px' }}>
            <span style={{ fontSize: 11, color: '#b48c3c', background: 'rgba(180,140,60,0.1)', padding: '3px 8px', borderRadius: 4, fontWeight: 400 }}>
              Lista de espera
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── list (reads URL params) ──────────────────────────────────────────────────

function NutritionistsList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const raw = Number(searchParams.get('page'));
  const page = Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1;
  const filters = {
    q: searchParams.get('q') ?? undefined,
    city: searchParams.get('city') ?? undefined,
    specialty: searchParams.get('specialty') ?? undefined,
    language: searchParams.get('language') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    minPrice: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    maxPrice: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
  };

  const LIMIT = 12;
  const { profiles, total, isLoading } = usePublicProfiles(page, LIMIT, filters);
  const totalPages = Math.ceil(total / LIMIT);

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/nutritionists?${params.toString()}`);
  }

  return (
    <>
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
          No nutritionists found. Try adjusting your filters.
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

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '0 48px 64px' }}>
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            style={{
              height: 40, padding: '0 24px', background: 'transparent',
              border: '1.5px solid var(--nc-border)', borderRadius: 6,
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--nc-stone)',
              cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1,
            }}
          >
            ← Previous
          </button>
          <span style={{ lineHeight: '40px', fontSize: 13, color: 'var(--nc-stone)' }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            style={{
              height: 40, padding: '0 24px', background: 'transparent',
              border: '1.5px solid var(--nc-border)', borderRadius: 6,
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--nc-stone)',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}

// ─── page shell ───────────────────────────────────────────────────────────────

export default function NutritionistsPage() {
  return (
    <div style={{ background: 'var(--nc-cream)', minHeight: '100vh' }}>
      <nav className="nc-nav">
        <Link href="/" className="nc-nav-logo">Nutri<span>Red</span></Link>
        <div className="nc-nav-links">
          <Link href="/login">Sign in</Link>
          <Link href="/register" className="nc-nav-cta">Join as nutritionist</Link>
        </div>
      </nav>

      <div className="nc-hero">
        <p className="nc-hero-label">Find your match</p>
        <h1>Meet the nutritionist<br />who <em>gets you</em></h1>
        <p>Browse certified professionals. Find someone whose approach fits your life.</p>
        <Suspense>
          <SearchFilters />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--nc-stone)', fontWeight: 300 }}>
            Loading nutritionists…
          </div>
        }
      >
        <NutritionistsList />
      </Suspense>
    </div>
  );
}
