import { PublicNav } from '@/components/PublicNav';

export default function About() {
  return (
    <div className="content-page">
      <PublicNav />

      <main className="content-main">
        <article className="content-article">

          <h1>Sobre Nutri Red</h1>

          <h2>El problema que estamos resolviendo</h2>
          <p>
            Encontrar el nutricionista adecuado es más difícil de lo que debería ser.
            El mercado está fragmentado: algunos nutricionistas tienen presencia en Instagram,
            otros tienen páginas web personales, algunos aparecen en directorios obsoletos.
            No hay una forma centralizada de comparar, evaluar credenciales, o ver precios
            de manera transparente.
          </p>
          <p>
            Y una vez que encuentras un nutricionista, la gestión del servicio es igual de
            fragmentada: WhatsApp para chatear, email para recibir planes, PDFs sueltos,
            hojas de cálculo. No hay continuidad ni seguimiento claro.
          </p>
          <p>
            Para los nutricionistas, la situación es igual de complicada. Conseguir clientes
            nuevos requiere marketing constante en múltiples canales. Gestionar clientes
            significa hacer malabarismos con múltiples herramientas. Y los modelos de negocio
            (comisiones altas, plataformas que controlan los precios) no siempre benefician
            al profesional.
          </p>

          <h2>Nuestra solución</h2>
          <p>
            Nutri Red conecta personas con nutricionistas certificados de forma transparente
            y segura. Somos la plataforma todo-en-uno para descubrir, conectar y trabajar con
            nutricionistas profesionales.
          </p>
          <p>
            <strong>Para clientes:</strong> Busca por especialidad, ciudad, idioma y precio.
            Compara perfiles, lee valoraciones, y conecta gratis. Recibe tus planes de nutrición
            y ejercicio, chatea con tu nutricionista, y haz seguimiento de tu progreso — todo
            en un solo lugar.
          </p>
          <p>
            <strong>Para nutricionistas:</strong> Crea tu perfil profesional, consigue más clientes,
            y gestiona todo tu trabajo (planes, chat, seguimiento) desde una sola plataforma.
            Sin comisiones por cliente — solo una suscripción mensual fija según tu volumen.
          </p>

          <h2>¿Qué nos hace diferentes?</h2>

          <div className="content-value-grid">

            <div className="content-value-card">
              <h3 className="content-value-title">✓ Nutricionistas verificados</h3>
              <p className="content-value-desc">
                Todos los profesionales en nuestra plataforma son certificados y licenciados.
                Verificamos sus credenciales antes de aprobar sus perfiles.
              </p>
            </div>

            <div className="content-value-card">
              <h3 className="content-value-title">✓ Precios transparentes</h3>
              <p className="content-value-desc">
                Cada nutricionista publica sus tarifas claramente. Sin cargos ocultos,
                sin sorpresas. Sabes exactamente cuánto vas a pagar antes de conectar.
              </p>
            </div>

            <div className="content-value-card">
              <h3 className="content-value-title">✓ Plataforma completa</h3>
              <p className="content-value-desc">
                Planes de nutrición, planes de ejercicio, chat, seguimiento de progreso —
                todo integrado. No necesitas múltiples apps o herramientas externas.
              </p>
            </div>

            <div className="content-value-card">
              <h3 className="content-value-title">✓ Gratis para clientes</h3>
              <p className="content-value-desc">
                Los nutricionistas mantienen suscripciones con nosotros. Los clientes
                conectan gratis y pagan solo por los servicios del nutricionista, sin comisiones adicionales.
              </p>
            </div>

            <div className="content-value-card">
              <h3 className="content-value-title">✓ Sin compromiso</h3>
              <p className="content-value-desc">
                Cancela en cualquier momento. No hay contratos a largo plazo ni penalizaciones.
                Tanto clientes como nutricionistas tienen libertad total.
              </p>
            </div>

            <div className="content-value-card">
              <h3 className="content-value-title">✓ Modelo justo para profesionales</h3>
              <p className="content-value-desc">
                Los nutricionistas se quedan con el 100% de sus ingresos. Sin comisiones
                por cliente. Solo una suscripción mensual fija y transparente.
              </p>
            </div>

          </div>

          <h2>Nuestra misión</h2>
          <p>
            Nuestra misión es hacer que el acceso a nutrición profesional sea tan fácil
            como encontrar un buen restaurante online. Queremos que cualquier persona,
            independientemente de dónde viva o cuál sea su presupuesto, pueda encontrar
            y trabajar con un nutricionista certificado que entienda sus necesidades.
          </p>
          <p>
            Y para los nutricionistas, queremos ofrecer una plataforma que realmente
            les ayude a hacer crecer su práctica, sin sacrificar sus ingresos ni su
            autonomía profesional.
          </p>

          <h2>¿Quién está construyendo Nutri Red?</h2>
          <p>
            Somos un equipo pequeño de profesionales apasionados por la nutrición y la tecnología.
            Creemos que la tecnología debe servir a las personas, no al revés. Por eso construimos
            Nutri Red con transparencia, simplicidad y respeto tanto para clientes como para
            profesionales.
          </p>
          <p>
            Estamos en fase inicial (MVP) y mejorando constantemente. Si tienes preguntas,
            sugerencias o feedback, nos encantaría escucharte en{' '}
            <a href="mailto:hola@nutri.red">hola@nutri.red</a>.
          </p>

          <div className="content-cta">
            <a href="/register" className="content-cta-btn">
              Únete a Nutri Red
            </a>
          </div>

        </article>
      </main>

      <footer className="lp-footer">
        <div className="ft-logo">nutri<span>connect</span></div>
        <ul className="ft-links">
          <li><a href="/about">Sobre nosotros</a></li>
          <li><a href="/for-nutritionists">Para nutricionistas</a></li>
          <li><a href="/privacy">Privacidad</a></li>
          <li><a href="/terms">Términos</a></li>
        </ul>
        <span className="ft-copy">© 2026 Nutriconnect</span>
      </footer>
    </div>
  );
}
