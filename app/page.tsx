'use client';

import LandingAnimations from '@/components/LandingAnimations';
import { PublicNav } from '@/components/PublicNav';

export default function Home() {

  return (
    <div className="lp-root">
      <LandingAnimations />

      <PublicNav />

      {/* ─────────── HERO ─────────── */}
      <section className="hero">

        {/* LEFT */}
        <div className="hero-left">
          <p className="hero-tag">Marketplace de Nutrición</p>

          <h1 className="hero-heading">
            <span className="h-plain">Encuentra</span>
            <span className="h-italic">tu nutricionista</span>
            <span className="h-plain-2">de confianza</span>
          </h1>

          <p className="hero-sub">
            Conectamos a personas que quieren cuidar su alimentación
            con nutricionistas certificados que se adaptan a tu vida y tus objetivos.
          </p>

          <div className="hero-actions">
            <a href="/nutritionists" className="btn-primary">
              Explorar nutricionistas
            </a>
            <a href="/for-nutritionists" className="btn-ghost">Soy nutricionista →</a>
          </div>

          <div className="hero-proof">
            <div className="avatars">
              <div className="av av-1" />
              <div className="av av-2" />
              <div className="av av-3" />
              <div className="av av-4" />
            </div>
            <p className="proof-text">
              <strong>+2.000 personas</strong> ya cuidan su alimentación<br />
              con nuestros nutricionistas
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
            <div className="fc-label">Valoración media</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <span className="fc-stars">★★★★★</span>
              <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--ink)' }}>4.9</span>
            </div>
            <div className="fc-profile">
              <div className="fc-avatar" />
              <div>
                <div className="fc-name">Laura Martínez</div>
                <div className="fc-spec">Nutrición deportiva</div>
              </div>
            </div>
          </div>

          {/* Floating card: growth */}
          <div className="fc fc-2">
            <div className="fc-label">Nuevos clientes</div>
            <div className="fc-val">+38%</div>
            <div className="fc-sub">este mes ↑</div>
          </div>

        </div>
      </section>

      {/* ─────────── STATS ─────────── */}
      <section className="stats">
        <div className="stat">
          <div className="stat-num">500+</div>
          <div className="stat-lbl">Nutricionistas verificados</div>
        </div>
        <div className="stat">
          <div className="stat-num">2.000+</div>
          <div className="stat-lbl">Clientes activos</div>
        </div>
        <div className="stat">
          <div className="stat-num">4.9</div>
          <div className="stat-lbl">Valoración media</div>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section className="how">
        <div className="sec-hdr">
          <span className="sec-tag">Proceso</span>
          <h2 className="sec-title">Así de <em>sencillo</em></h2>
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
            <h3 className="step-title">Busca tu especialista</h3>
            <p className="step-desc">Filtra por especialidad, idioma, precio y valoraciones. Encuentra el nutricionista que mejor encaja con tus objetivos y tu presupuesto.</p>
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
            <h3 className="step-title">Elige tu plan</h3>
            <p className="step-desc">Selecciona el servicio que necesitas: consulta puntual o seguimiento mensual. Pago seguro a través de Stripe, sin sorpresas ni letra pequeña.</p>
          </div>

          <div className="step reveal">
            <span className="step-num">03</span>
            <div className="step-icon">
              <svg viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="step-title">Comienza tu camino</h3>
            <p className="step-desc">Recibe tu plan de nutrición personalizado, chatea con tu nutricionista en tiempo real y empieza a ver resultados reales en tu vida.</p>
          </div>

        </div>
      </section>

      {/* ─────────── NUTRITIONISTS ─────────── */}
      <section className="nutritionists">
        <div className="sec-hdr">
          <span className="sec-tag">Destacados</span>
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
                <a href="/nutritionists/laura-martinez" className="btn-sm">Ver perfil</a>
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
                <a href="/nutritionists/carlos-ruiz" className="btn-sm">Ver perfil</a>
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
                <a href="/nutritionists/ana-gonzalez" className="btn-sm">Ver perfil</a>
              </div>
            </div>
          </div>

        </div>

        <div className="see-all">
          <a href="/nutritionists" className="btn-outline">Ver todos los nutricionistas</a>
        </div>
      </section>

      {/* ─────────── PRICING ─────────── */}
      <section className="pricing">
        <div className="pricing-inner">
          <div className="sec-hdr">
            <span className="sec-tag">Para nutricionistas</span>
            <h2 className="sec-title">Planes y <em>precios</em></h2>
          </div>

          <div className="pricing-grid">

            {/* Free */}
            <div className="pricing-card reveal">
              <div className="pricing-tier">Free</div>
              <div className="pricing-price-row">
                <span className="pricing-price">{'€0'}</span>
                <span className="pricing-period">/mes</span>
              </div>
              <p className="pricing-desc">Empieza a construir tu práctica online sin ningún coste.</p>
              <ul className="pricing-features">
                <li>Hasta 5 clientes activos</li>
                <li>Perfil público</li>
                <li>Paquetes de servicios</li>
                <li>Soporte por email</li>
              </ul>
              <a href="/register" className="btn-outline pricing-btn">Empezar gratis</a>
            </div>

            {/* Pro */}
            <div className="pricing-card pricing-featured reveal">
              <div className="pricing-popular">Más popular</div>
              <div className="pricing-tier">Pro</div>
              <div className="pricing-price-row">
                <span className="pricing-price">{'€29'}</span>
                <span className="pricing-period">/mes</span>
              </div>
              <p className="pricing-desc">Para nutricionistas en crecimiento con una agenda activa.</p>
              <ul className="pricing-features">
                <li>Hasta 25 clientes activos</li>
                <li>Perfil destacado en búsqueda</li>
                <li>Todo lo del plan Free</li>
                <li>Análisis de rendimiento</li>
                <li>Soporte prioritario</li>
              </ul>
              <a href="/register" className="btn-terra pricing-btn">Empezar con Pro</a>
            </div>

            {/* Premium */}
            <div className="pricing-card reveal">
              <div className="pricing-tier">Premium</div>
              <div className="pricing-price-row">
                <span className="pricing-price">{'€59'}</span>
                <span className="pricing-period">/mes</span>
              </div>
              <p className="pricing-desc">Sin límites para los profesionales más exigentes.</p>
              <ul className="pricing-features">
                <li>Clientes ilimitados</li>
                <li>Posición top en búsqueda</li>
                <li>Todo lo del plan Pro</li>
                <li>Dashboard avanzado</li>
                <li>Soporte dedicado</li>
              </ul>
              <a href="/register" className="btn-outline pricing-btn">Empezar con Premium</a>
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
            ¿Listo para <em>transformar</em><br />
            tu alimentación?
          </h2>
          <div className="cta-right reveal">
            <p className="cta-p">
              Únete a más de 2.000 personas que ya están consiguiendo
              sus objetivos con la ayuda de un nutricionista de confianza.
              Sin compromisos, sin letra pequeña.
            </p>
            <div className="cta-btns">
              <a href="/register" className="btn-terra">
                Empezar gratis
              </a>
              <a href="/nutritionists" className="btn-light">Ver nutricionistas →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="lp-footer">
        <div className="ft-logo">nutri<span>red</span></div>
        <ul className="ft-links">
          <li><a href="/about">Sobre nosotros</a></li>
          <li><a href="/for-nutritionists">Para nutricionistas</a></li>
          <li><a href="/privacy">Privacidad</a></li>
          <li><a href="/terms">Términos</a></li>
        </ul>
        <span className="ft-copy">© 2026 Nutri Red</span>
      </footer>

    </div>
  );
}
