'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { usePublicProfile } from '@/lib/profile';

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function formatPrice(cents: number): string {
  return `€${Math.floor(cents / 100)}`;
}

export default function PublicProfilePage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { profile, isLoading } = usePublicProfile(slug);

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

  return (
    <div style={{ background: 'var(--nc-cream)', minHeight: '100vh' }}>
      <nav className="nc-nav">
        <Link href="/nutritionists" className="nc-nav-logo">Nutri<span>Connect</span></Link>
        <Link href="/nutritionists" style={{ color: 'rgba(245,240,232,0.65)', textDecoration: 'none', fontSize: 13 }}>← Back to nutritionists</Link>
      </nav>

      <div className="nc-profile-hero">
        <div className="nc-profile-hero-inner">
          <div>
            <div className="nc-profile-badge">Available</div>
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
                    <div className="nc-pkg-sessions">{pkg.sessions} session{pkg.sessions !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="nc-pkg-price">{formatPrice(pkg.price_cents)}</div>
                </div>
                {pkg.description && <div className="nc-pkg-desc">{pkg.description}</div>}
              </div>
            ))
          )}
          <div className="nc-pkg-footer">
            {/* Placeholder CTA — booking/messaging is a future slice */}
            <button className="nc-btn-contact">Get in touch</button>
            <p className="nc-contact-note">Coming soon: direct booking</p>
          </div>
        </div>
      </div>
    </div>
  );
}
