'use client';

import { useTranslations, useLocale } from 'next-intl';
import LandingAnimations from '@/components/LandingAnimations';
import { PublicNav } from '@/components/PublicNav';

export default function Home() {
  const t = useTranslations('public.landing');
  const locale = useLocale();

  return (
    <div className="lp-root">
      <LandingAnimations />

      <PublicNav />

      {/* ─────────── HERO ─────────── */}
      <section className="hero">

        {/* LEFT */}
        <div className="hero-left">
          <p className="hero-tag">{t('hero_tag')}</p>

          <h1 className="hero-heading">
            <span className="h-plain">{t('hero_heading_1')}</span>
            <span className="h-italic">{t('hero_heading_2')}</span>
            <span className="h-plain-2">{t('hero_heading_3')}</span>
          </h1>

          <p className="hero-sub">
            {t('hero_subtitle')}
          </p>

          <div className="hero-actions">
            <a href={`/${locale}/nutritionists`} className="btn-primary">
              {t('hero_cta_explore')}
            </a>
            <a href={`/${locale}/for-nutritionists`} className="btn-ghost">{t('hero_cta_nutritionist')}</a>
          </div>

          <div className="hero-proof">
            <div className="avatars">
              <div className="av av-1" />
              <div className="av av-2" />
              <div className="av av-3" />
              <div className="av av-4" />
            </div>
            <p className="proof-text">
              <strong>{t('hero_proof_stat')}</strong> {t('hero_proof_desc')}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hero-right">

          {/* Deep olive blob */}
          <div className="hero-blob">
            <svg viewBox="0 0 640 760" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <path d="M600 0H640V760H90C90 760-10 690 20 560 50 430 145 405 160 295 175 185 105 95 195 28 285-39 400 12 490 3 545-3 580 0 600 0Z" fill="#2C4A1E" />
            </svg>
          </div>

          {/* Grain texture over olive */}
          <div className="hero-grain" />

          {/* Pill photo placeholder */}
          <div className="hero-photo">
            <svg viewBox="0 0 280 380" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
              <circle cx="140" cy="130" r="72" fill="rgba(245,240,232,0.10)" />
              <circle cx="140" cy="130" r="50" fill="rgba(245,240,232,0.07)" />
              <ellipse cx="194" cy="68" rx="26" ry="46" fill="rgba(90,138,64,0.38)" transform="rotate(-28 194 68)" />
              <ellipse cx="86"  cy="60" rx="22" ry="38" fill="rgba(90,138,64,0.28)" transform="rotate(22 86 60)" />
              <ellipse cx="224" cy="108" rx="18" ry="32" fill="rgba(90,138,64,0.22)" transform="rotate(-45 224 108)" />
              <circle cx="140" cy="116" r="36" fill="rgba(245,240,232,0.22)" />
              <path d="M72 380 Q72 295 140 282 Q208 295 208 380Z" fill="rgba(245,240,232,0.18)" />
              <circle cx="190" cy="170" r="10" fill="rgba(196,98,45,0.50)" />
              <circle cx="90"  cy="185" r="7"  fill="rgba(196,98,45,0.35)" />
            </svg>
          </div>

          {/* Floating card: rating + profile */}
          <div className="fc fc-1">
            <div className="fc-label">{t('card_rating_label')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <span className="fc-stars">★★★★★</span>
              <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--ink)' }}>4.9</span>
            </div>
            <div className="fc-profile">
              <div className="fc-avatar" />
              <div>
                <div className="fc-name">Laura Martínez</div>
                <div className="fc-spec">{t('card_rating_specialty')}</div>
              </div>
            </div>
          </div>

          {/* Floating card: growth */}
          <div className="fc fc-2">
            <div className="fc-label">{t('card_growth_label')}</div>
            <div className="fc-val">+38%</div>
            <div className="fc-sub">{t('card_growth_period')}</div>
          </div>

        </div>
      </section>

      {/* ─────────── STATS ─────────── */}
      <section className="stats">
        <div className="stat">
          <div className="stat-num">500+</div>
          <div className="stat-lbl">{t('stats_nutritionists')}</div>
        </div>
        <div className="stat">
          <div className="stat-num">2.000+</div>
          <div className="stat-lbl">{t('stats_clients')}</div>
        </div>
        <div className="stat">
          <div className="stat-num">4.9</div>
          <div className="stat-lbl">{t('stats_rating')}</div>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section className="how">
        <div className="sec-hdr">
          <span className="sec-tag">{t('how_tag')}</span>
          <h2 className="sec-title">{t('how_title')} <em>sencillo</em></h2>
        </div>

        <div className="steps">

          <div className="step reveal">
            <span className="step-num">01</span>
            <div className="step-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="step-title">{t('step_1_title')}</h3>
            <p className="step-desc">{t('step_1_desc')}</p>
          </div>

          <div className="step reveal">
            <span className="step-num">02</span>
            <div className="step-icon">
              <svg viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3 className="step-title">{t('step_2_title')}</h3>
            <p className="step-desc">{t('step_2_desc')}</p>
          </div>

          <div className="step reveal">
            <span className="step-num">03</span>
            <div className="step-icon">
              <svg viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="step-title">{t('step_3_title')}</h3>
            <p className="step-desc">{t('step_3_desc')}</p>
          </div>

        </div>
      </section>

      {/* ─────────── NUTRITIONISTS ─────────── */}
      <section className="nutritionists">
        <div className="sec-hdr">
          <span className="sec-tag">{t('nutritionists_tag')}</span>
          <h2 className="sec-title">Nutricionistas <em>verificados</em></h2>
        </div>

        <div className="nut-grid">

          {/* Card 1 */}
          <div className="nut-card reveal">
            <div className="nut-photo">
              <div className="nut-photo-bg bg-green">
                <svg className="nut-figure" viewBox="0 0 140 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="108" cy="28" rx="14" ry="26" fill="rgba(90,138,64,0.5)" transform="rotate(-28 108 28)" />
                  <ellipse cx="32"  cy="38" rx="11" ry="20" fill="rgba(90,138,64,0.4)" transform="rotate(22 32 38)" />
                  <circle cx="70" cy="58" r="34" fill="rgba(245,240,232,0.28)" />
                  <path d="M20 200 Q20 138 70 128 Q120 138 120 200" fill="rgba(245,240,232,0.22)" />
                </svg>
              </div>
              <span className="nut-badge">⚡ Disponible</span>
            </div>
            <div className="nut-body">
              <div className="nut-rating">
                <span className="nut-stars">★★★★★</span>
                <span className="nut-rv">4.9</span>
                <span className="nut-rc">(124 reseñas)</span>
              </div>
              <div className="nut-name">Laura Martínez</div>
              <div className="nut-spec">Nutrición deportiva · Madrid</div>
              <div className="nut-tags">
                <span className="nut-tag">Pérdida de peso</span>
                <span className="nut-tag">Rendimiento</span>
                <span className="nut-tag">Vegana</span>
              </div>
              <div className="nut-footer">
                <div className="nut-price">60€ <span>/ sesión</span></div>
                <a href={`/${locale}/nutritionists/laura-martinez`} className="btn-sm">Ver perfil</a>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="nut-card reveal">
            <div className="nut-photo">
              <div className="nut-photo-bg bg-terra">
                <svg className="nut-figure" viewBox="0 0 140 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="112" cy="24" rx="15" ry="27" fill="rgba(196,98,45,0.45)" transform="rotate(-22 112 24)" />
                  <ellipse cx="28"  cy="36" rx="12" ry="21" fill="rgba(196,98,45,0.35)" transform="rotate(28 28 36)" />
                  <circle cx="70" cy="58" r="34" fill="rgba(245,240,232,0.28)" />
                  <path d="M20 200 Q20 138 70 128 Q120 138 120 200" fill="rgba(245,240,232,0.22)" />
                </svg>
              </div>
              <span className="nut-badge">⚡ Disponible</span>
            </div>
            <div className="nut-body">
              <div className="nut-rating">
                <span className="nut-stars">★★★★★</span>
                <span className="nut-rv">4.8</span>
                <span className="nut-rc">(89 reseñas)</span>
              </div>
              <div className="nut-name">Carlos Ruiz</div>
              <div className="nut-spec">Nutrición clínica · Barcelona</div>
              <div className="nut-tags">
                <span className="nut-tag">Diabetes</span>
                <span className="nut-tag">Hipertensión</span>
                <span className="nut-tag">Adultos</span>
              </div>
              <div className="nut-footer">
                <div className="nut-price">75€ <span>/ sesión</span></div>
                <a href={'/' + locale + '/nutritionists/carlos-ruiz'} className="btn-sm">Ver perfil</a>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="nut-card reveal">
            <div className="nut-photo">
              <div className="nut-photo-bg bg-slate">
                <svg className="nut-figure" viewBox="0 0 140 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="110" cy="26" rx="14" ry="25" fill="rgba(58,88,128,0.45)" transform="rotate(-26 110 26)" />
                  <ellipse cx="30"  cy="37" rx="11" ry="20" fill="rgba(58,88,128,0.35)" transform="rotate(25 30 37)" />
                  <circle cx="70" cy="58" r="34" fill="rgba(245,240,232,0.28)" />
                  <path d="M20 200 Q20 138 70 128 Q120 138 120 200" fill="rgba(245,240,232,0.22)" />
                </svg>
              </div>
              <span className="nut-badge">⚡ Disponible</span>
            </div>
            <div className="nut-body">
              <div className="nut-rating">
                <span className="nut-stars">★★★★★</span>
                <span className="nut-rv">5.0</span>
                <span className="nut-rc">(61 reseñas)</span>
              </div>
              <div className="nut-name">Ana González</div>
              <div className="nut-spec">Nutrición infantil · Valencia</div>
              <div className="nut-tags">
                <span className="nut-tag">Niños</span>
                <span className="nut-tag">Alergias</span>
                <span className="nut-tag">Intolerancias</span>
              </div>
              <div className="nut-footer">
                <div className="nut-price">55€ <span>/ sesión</span></div>
                <a href={`/${locale}/nutritionists/ana-gonzalez`} className="btn-sm">Ver perfil</a>
              </div>
            </div>
          </div>

        </div>

        <div className="see-all">
          <a href={`/${locale}/nutritionists`} className="btn-outline">{t('nutritionists_all')}</a>
        </div>
      </section>

      {/* ─────────── PRICING ─────────── */}
      <section className="pricing">
        <div className="pricing-inner">
          <div className="sec-hdr">
            <span className="sec-tag">{t('pricing_tag')}</span>
            <h2 className="sec-title">Planes y <em>precios</em></h2>
          </div>

          <div className="pricing-grid">

            {/* Free */}
            <div className="pricing-card reveal">
              <div className="pricing-tier">{t('pricing_free_tier')}</div>
              <div className="pricing-price-row">
                <span className="pricing-price">{'€0'}</span>
                <span className="pricing-period">/mes</span>
              </div>
              <p className="pricing-desc">{t('pricing_free_desc')}</p>
              <ul className="pricing-features">
                {t.raw('pricing_free_features').map((feature: string) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <a href={`/${locale}/register`} className="btn-outline pricing-btn">{t('pricing_free_cta')}</a>
            </div>

            {/* Pro */}
            <div className="pricing-card pricing-featured reveal">
              <div className="pricing-popular">{t('pricing_pro_popular')}</div>
              <div className="pricing-tier">{t('pricing_pro_tier')}</div>
              <div className="pricing-price-row">
                <span className="pricing-price">{'€29'}</span>
                <span className="pricing-period">/mes</span>
              </div>
              <p className="pricing-desc">{t('pricing_pro_desc')}</p>
              <ul className="pricing-features">
                {t.raw('pricing_pro_features').map((feature: string) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <a href={`/${locale}/register`} className="btn-terra pricing-btn">{t('pricing_pro_cta')}</a>
            </div>

            {/* Premium */}
            <div className="pricing-card reveal">
              <div className="pricing-tier">{t('pricing_premium_tier')}</div>
              <div className="pricing-price-row">
                <span className="pricing-price">{'€59'}</span>
                <span className="pricing-period">/mes</span>
              </div>
              <p className="pricing-desc">{t('pricing_premium_desc')}</p>
              <ul className="pricing-features">
                {t.raw('pricing_premium_features').map((feature: string) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <a href={`/${locale}/register`} className="btn-outline pricing-btn">{t('pricing_premium_cta')}</a>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────── CTA ─────────── */}
      <section className="cta">
        <div className="cta-ring cta-ring-1" />
        <div className="cta-ring cta-ring-2" />
        <div className="cta-blob" />
        <div className="cta-inner">
          <h2 className="cta-h reveal">
            {t('cta_heading')}
          </h2>
          <div className="cta-right reveal">
            <p className="cta-p">
              {t('cta_desc')}
            </p>
            <div className="cta-btns">
              <a href={`/${locale}/register`} className="btn-terra">
                {t('cta_free')}
              </a>
              <a href={`/${locale}/nutritionists`} className="btn-light">{t('cta_see_nutritionists')}</a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="lp-footer">
        <div className="ft-logo">nutri<span>red</span></div>
        <ul className="ft-links">
          <li><a href={`/${locale}/about`}>{t('footer_about')}</a></li>
          <li><a href={`/${locale}/for-nutritionists`}>{t('footer_for_nutritionists')}</a></li>
          <li><a href={`/${locale}/privacy`}>{t('footer_privacy')}</a></li>
          <li><a href={`/${locale}/terms`}>{t('footer_terms')}</a></li>
        </ul>
        <span className="ft-copy">{t('footer_copy')}</span>
      </footer>

    </div>
  );
}
