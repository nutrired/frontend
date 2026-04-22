import { PublicNav } from '@/components/PublicNav';

export default function ForNutritionists() {
  const locale = useLocale();
  return (
    <div className="content-page">
      <PublicNav />

      <main className="content-main">
        <article className="content-article">

          <h1>Haz crecer tu práctica de nutrición online</h1>
          <p>
            Consigue más clientes, gestiona todo tu trabajo en un solo lugar,
            y céntrate en lo que mejor sabes hacer: ayudar a las personas a transformar
            su alimentación y su salud.
          </p>

          <h2>¿Por qué elegir Nutri Red?</h2>

          <div className="content-value-grid">

            <div className="content-value-card">
              <h3 className="content-value-title">🎯 Consigue más clientes</h3>
              <p className="content-value-desc">
                Marketplace con alta visibilidad donde los clientes te encuentran
                por especialidad, ciudad, idioma y precio. El sistema de valoraciones
                aumenta la confianza y te ayuda a destacar.
              </p>
            </div>

            <div className="content-value-card">
              <h3 className="content-value-title">🛠️ Gestiona todo en un lugar</h3>
              <p className="content-value-desc">
                Crea planes de nutrición y ejercicio personalizados, chatea con tus clientes,
                y realiza seguimiento de su progreso. Todo integrado en una sola plataforma.
              </p>
            </div>

            <div className="content-value-card">
              <h3 className="content-value-title">💰 Modelo simple y transparente</h3>
              <p className="content-value-desc">
                Sin comisiones por cliente. Pagas una suscripción mensual fija según tu volumen.
                Tú decides tu precio por sesión y te quedas con el 100% de tus ingresos.
              </p>
            </div>

            <div className="content-value-card">
              <h3 className="content-value-title">🚀 Empieza gratis</h3>
              <p className="content-value-desc">
                Plan Free hasta 5 clientes activos, para siempre. Sin tarjeta de crédito.
                Escala a Pro o Premium cuando estés listo. Sin compromisos, cancela cuando quieras.
              </p>
            </div>

          </div>

          <h2>Planes y precios</h2>
          <p>
            Elige el plan que se adapte a tu volumen de clientes. Puedes cambiar de plan
            en cualquier momento desde tu panel de control.
          </p>

          <div className="content-pricing-table">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Clientes activos</th>
                  <th>Precio</th>
                  <th>Características</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Free</strong></td>
                  <td>Hasta 5</td>
                  <td><strong>€0/mes</strong></td>
                  <td>Perfil público, paquetes de servicios, soporte por email</td>
                </tr>
                <tr>
                  <td><strong>Pro</strong></td>
                  <td>Hasta 25</td>
                  <td><strong>€29/mes</strong></td>
                  <td>Todo lo de Free + perfil destacado, análisis de rendimiento, soporte prioritario</td>
                </tr>
                <tr>
                  <td><strong>Premium</strong></td>
                  <td>Ilimitado</td>
                  <td><strong>€59/mes</strong></td>
                  <td>Todo lo de Pro + posición top en búsqueda, dashboard avanzado, soporte dedicado</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>¿Cómo funciona para nutricionistas?</h2>

          <div className="content-steps">

            <div className="content-step-card">
              <div className="content-step-number">Paso 1</div>
              <h3 className="content-step-title">Crea tu perfil profesional</h3>
              <p className="content-step-desc">
                Regístrate y completa tu perfil: biografía, especialidades, ciudad, años de experiencia,
                idiomas, foto profesional. Define tus paquetes de servicios con precios transparentes.
              </p>
            </div>

            <div className="content-step-card">
              <div className="content-step-number">Paso 2</div>
              <h3 className="content-step-title">Te encuentran en búsquedas</h3>
              <p className="content-step-desc">
                Los clientes buscan nutricionistas usando filtros (especialidad, ciudad, precio, valoraciones).
                Tu perfil aparece en los resultados relevantes. Cuanto más completo y mejor valorado,
                más visible serás.
              </p>
            </div>

            <div className="content-step-card">
              <div className="content-step-number">Paso 3</div>
              <h3 className="content-step-title">Clientes solicitan conectar contigo</h3>
              <p className="content-step-desc">
                Recibes notificaciones cuando un cliente quiere trabajar contigo. Puedes revisar su perfil
                (objetivos, restricciones dietéticas, alergias) y decidir si aceptar la solicitud.
                Tú tienes el control: sin compromiso hasta que aceptes.
              </p>
            </div>

            <div className="content-step-card">
              <div className="content-step-number">Paso 4</div>
              <h3 className="content-step-title">Gestiona tu práctica</h3>
              <p className="content-step-desc">
                Crea planes de nutrición y ejercicio personalizados para cada cliente. Chatea con ellos
                para resolver dudas y dar seguimiento. Ajusta planes según su evolución. Todo en un solo lugar.
              </p>
            </div>

          </div>

          <h2>Preguntas frecuentes</h2>

          <div className="content-faq">

            <div className="content-faq-item">
              <div className="content-faq-question">¿Qué pasa si supero el límite de clientes de mi plan?</div>
              <div className="content-faq-answer">
                Si alcanzas el límite de tu plan, no podrás aceptar nuevas conexiones hasta que
                actualices a un plan superior o algún cliente cancele. Tus clientes actuales no se ven
                afectados. Te avisamos con antelación cuando estés cerca del límite.
              </div>
            </div>

            <div className="content-faq-item">
              <div className="content-faq-question">¿Puedo cambiar de plan en cualquier momento?</div>
              <div className="content-faq-answer">
                Sí. Puedes actualizar a un plan superior de inmediato (el cambio se aplica al instante).
                Si quieres bajar de plan, el cambio se hará efectivo al final de tu período de facturación
                actual.
              </div>
            </div>

            <div className="content-faq-item">
              <div className="content-faq-question">¿Hay comisiones por las sesiones con clientes?</div>
              <div className="content-faq-answer">
                No. Tú estableces tus precios y cobras directamente a tus clientes. No tomamos ninguna
                comisión. Solo pagas tu suscripción mensual fija a Nutri Red.
              </div>
            </div>

            <div className="content-faq-item">
              <div className="content-faq-question">¿Puedo ofrecer consultas online y presenciales?</div>
              <div className="content-faq-answer">
                Sí. En tu perfil puedes indicar si ofreces consultas online, presenciales, o ambas.
                Los clientes pueden filtrar por esta preferencia al buscar.
              </div>
            </div>

          </div>

          <div className="content-cta">
            <a href={`/${locale}/register`} className="content-cta-btn">
              Crea tu perfil gratis
            </a>
            <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--nc-stone)' }}>
              Empieza con el plan Free. Sin tarjeta de crédito.
            </p>
          </div>

        </article>
      </main>

      <footer className="lp-footer">
        <div className="ft-logo">nutri<span>red</span></div>
        <ul className="ft-links">
          <li><a href={`/${locale}/about`}>Sobre nosotros</a></li>
          <li><a href={`/${locale}/for-nutritionists`}>Para nutricionistas</a></li>
          <li><a href={`/${locale}/privacy`}>Privacidad</a></li>
          <li><a href={`/${locale}/terms`}>Términos</a></li>
        </ul>
        <span className="ft-copy">© 2026 Nutri Red</span>
      </footer>
    </div>
  );
}
