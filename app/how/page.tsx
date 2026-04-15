import { PublicNav } from '@/components/PublicNav';

export default function HowItWorks() {
  return (
    <div className="content-page">
      <PublicNav />

      <main className="content-main">
        <article className="content-article">

          <h1>Tu camino hacia una mejor alimentación</h1>
          <p>
            Encontrar el nutricionista adecuado y empezar tu proceso de transformación
            es más simple de lo que piensas. En NutriConnect, todo está diseñado para que
            te centres en lo importante: tu salud y tus objetivos.
          </p>

          <h2>¿Cómo funciona?</h2>

          <div className="content-steps">

            <div className="content-step-card">
              <div className="content-step-number">Paso 1</div>
              <h3 className="content-step-title">Busca tu especialista</h3>
              <p className="content-step-desc">
                Utiliza nuestros filtros para encontrar nutricionistas que se ajusten
                a lo que necesitas. Puedes buscar por:
              </p>
              <ul>
                <li><strong>Especialidad:</strong> Nutrición deportiva, clínica, infantil, vegana...</li>
                <li><strong>Ciudad:</strong> Encuentra profesionales cerca de ti o con consulta online</li>
                <li><strong>Idioma:</strong> Asegúrate de poder comunicarte cómodamente</li>
                <li><strong>Precio:</strong> Compara tarifas y elige lo que se ajuste a tu presupuesto</li>
              </ul>
              <p className="content-step-desc">
                Cada perfil incluye la biografía del nutricionista, su experiencia, especialidades,
                y valoraciones de otros clientes. Así puedes tomar una decisión informada.
              </p>
            </div>

            <div className="content-step-card">
              <div className="content-step-number">Paso 2</div>
              <h3 className="content-step-title">Conecta con tu nutricionista</h3>
              <p className="content-step-desc">
                Una vez que encuentres el nutricionista ideal, conectar es <strong>completamente gratis</strong>.
                No pagás nada por usar la plataforma como cliente — los nutricionistas son quienes
                mantienen sus suscripciones con nosotros.
              </p>
              <p className="content-step-desc">
                Simplemente haz clic en "Conectar" y el nutricionista recibirá tu solicitud.
                Una vez que acepte, podrán empezar a trabajar juntos.
              </p>
            </div>

            <div className="content-step-card">
              <div className="content-step-number">Paso 3</div>
              <h3 className="content-step-title">Recibe tu plan personalizado</h3>
              <p className="content-step-desc">
                Tu nutricionista creará un plan adaptado a tus necesidades, objetivos y estilo de vida:
              </p>
              <ul>
                <li><strong>Plan de nutrición:</strong> Menús semanales, recetas, pautas alimentarias</li>
                <li><strong>Plan de ejercicio:</strong> Rutinas personalizadas para complementar tu alimentación</li>
                <li><strong>Chat en tiempo real:</strong> Resuelve dudas, comparte tu progreso, recibe apoyo continuo</li>
              </ul>
              <p className="content-step-desc">
                Todo en un solo lugar. Sin necesidad de múltiples apps o herramientas.
                Tu nutricionista puede ajustar tu plan cuando sea necesario, adaptándose
                a tu evolución.
              </p>
            </div>

          </div>

          <h2>Preguntas frecuentes</h2>

          <div className="content-faq">

            <div className="content-faq-item">
              <div className="content-faq-question">¿Cuánto cuesta para mí como cliente?</div>
              <div className="content-faq-answer">
                Usar NutriConnect es <strong>completamente gratis</strong> para clientes.
                No hay cargos por registrarte, buscar nutricionistas o conectar con ellos.
                El nutricionista establece su propia tarifa por sus servicios profesionales,
                que pagas directamente a ellos — no hay comisiones ocultas ni cargos adicionales
                por parte de la plataforma.
              </div>
            </div>

            <div className="content-faq-item">
              <div className="content-faq-question">¿Qué incluye el servicio del nutricionista?</div>
              <div className="content-faq-answer">
                Cada nutricionista define sus propios paquetes de servicio, pero típicamente incluyen:
                plan de nutrición personalizado, plan de ejercicio (opcional), seguimiento continuo
                mediante chat, ajustes según tu progreso, y soporte para resolver dudas. Revisa el perfil
                de cada nutricionista para ver exactamente qué ofrece.
              </div>
            </div>

            <div className="content-faq-item">
              <div className="content-faq-question">¿Puedo cambiar de nutricionista?</div>
              <div className="content-faq-answer">
                Sí, puedes cancelar tu relación con un nutricionista en cualquier momento desde tu
                panel de control. No hay compromisos a largo plazo. Si no estás satisfecho, puedes
                buscar y conectar con otro profesional sin ningún problema.
              </div>
            </div>

            <div className="content-faq-item">
              <div className="content-faq-question">¿Los nutricionistas están certificados?</div>
              <div className="content-faq-answer">
                Sí. Todos los nutricionistas en NutriConnect son profesionales certificados y licenciados.
                Verificamos sus credenciales antes de aprobar sus perfiles en la plataforma.
              </div>
            </div>

            <div className="content-faq-item">
              <div className="content-faq-question">¿Cómo me comunico con mi nutricionista?</div>
              <div className="content-faq-answer">
                Una vez conectado, puedes chatear con tu nutricionista directamente dentro de la plataforma.
                El chat es privado y seguro. No necesitas usar WhatsApp, email u otras herramientas externas.
              </div>
            </div>

            <div className="content-faq-item">
              <div className="content-faq-question">¿Cuánto tardan en responder los nutricionistas?</div>
              <div className="content-faq-answer">
                El tiempo de respuesta depende de cada nutricionista y su carga de trabajo. La mayoría
                responde dentro de 24-48 horas. Algunos ofrecen soporte más rápido como parte de sus
                paquetes premium. Revisa el perfil del nutricionista para ver sus tiempos de respuesta típicos.
              </div>
            </div>

            <div className="content-faq-item">
              <div className="content-faq-question">¿Qué pasa con mis datos personales?</div>
              <div className="content-faq-answer">
                Tus datos están protegidos y son privados. Solo tu nutricionista puede ver la información
                que compartes con ellos. No vendemos ni compartimos tus datos con terceros. Lee nuestra{' '}
                <a href="/privacy">política de privacidad</a> para más detalles.
              </div>
            </div>

          </div>

          <div className="content-cta">
            <a href="/nutritionists" className="content-cta-btn">
              Encuentra tu nutricionista ahora
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
