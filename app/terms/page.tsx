import { PublicNav } from '@/components/PublicNav';

export default function Terms() {
  return (
    <div className="content-page">
      <PublicNav />

      <main className="content-main">
        <article className="content-article">

          <h1>Términos de Servicio</h1>
          <p><em>Última actualización: 15 de abril de 2026</em></p>

          <h2>1. Aceptación de Términos</h2>
          <p>
            Al acceder o usar NutriConnect ("la plataforma", "nosotros", "nuestro"),
            aceptas estar vinculado por estos Términos de Servicio. Si no estás de acuerdo
            con alguna parte de estos términos, no puedes usar la plataforma.
          </p>

          <h2>2. Elegibilidad</h2>
          <ul>
            <li>Debes tener al menos <strong>18 años</strong> para usar NutriConnect</li>
            <li>Debes proporcionar información veraz, completa y actualizada al registrarte</li>
            <li>No puedes usar el servicio para fines ilegales o no autorizados</li>
            <li>No puedes violar ninguna ley en tu jurisdicción al usar la plataforma</li>
          </ul>

          <h2>3. Tipos de Cuenta</h2>

          <h3>Cuentas de Cliente</h3>
          <ul>
            <li>Acceso <strong>gratuito</strong> a la plataforma</li>
            <li>Puedes buscar y conectar con nutricionistas ilimitadamente</li>
            <li>Sin cargos por usar la plataforma</li>
            <li>Pagas directamente al nutricionista por sus servicios profesionales</li>
          </ul>

          <h3>Cuentas de Nutricionista</h3>
          <ul>
            <li>Requieren suscripción activa (Free, Pro o Premium)</li>
            <li>Sujetas a <strong>verificación de credenciales</strong> antes de aprobación</li>
            <li>Límites de clientes activos según tier (5 / 25 / ilimitado)</li>
            <li>Procesamiento de pagos mediante Stripe</li>
          </ul>

          <h2>4. Obligaciones de Nutricionistas</h2>
          <p>Si te registras como nutricionista, aceptas que:</p>
          <ul>
            <li>Eres un profesional <strong>certificado o licenciado</strong> en nutrición</li>
            <li>Eres responsable de todo el consejo profesional que das a tus clientes</li>
            <li>Debes mantener una suscripción activa para acceder a funciones de gestión de clientes</li>
            <li><strong>No puedes ofrecer servicios fuera de la plataforma</strong> a clientes que conociste en NutriConnect (cláusula anticompetencia durante la relación activa)</li>
            <li>Debes responder a tus clientes en un tiempo razonable según lo indicado en tu perfil</li>
            <li>No puedes garantizar resultados de salud específicos</li>
          </ul>

          <h2>5. Responsabilidades de Clientes</h2>
          <p>Si te registras como cliente, aceptas que:</p>
          <ul>
            <li>NutriConnect es una <strong>plataforma</strong>, no un proveedor de consejo médico o nutricional</li>
            <li>El consejo nutricional proviene directamente de tu nutricionista contratado</li>
            <li>Debes consultar a un médico antes de realizar cambios dietéticos significativos</li>
            <li>Eres responsable de seguir (o no) el consejo de tu nutricionista</li>
            <li>No puedes acosar, hacer spam o abusar del sistema de mensajería con nutricionistas</li>
          </ul>

          <h2>6. Pagos y Suscripciones</h2>

          <h3>Suscripciones de Nutricionistas</h3>
          <ul>
            <li>Procesadas por <strong>Stripe</strong></li>
            <li>Facturación <strong>mensual</strong></li>
            <li>Límites de clientes por tier:
              <ul>
                <li>Free: hasta 5 clientes activos, €0/mes</li>
                <li>Pro: hasta 25 clientes activos, €29/mes</li>
                <li>Premium: clientes ilimitados, €59/mes</li>
              </ul>
            </li>
            <li><strong>Renovación automática</strong> al final de cada período</li>
            <li>Puedes cancelar en cualquier momento (se aplica al final del período actual)</li>
            <li>No reembolsamos períodos parciales (política estándar SaaS)</li>
          </ul>

          <h3>Política de Reembolsos</h3>
          <ul>
            <li><strong>Sin reembolsos</strong> para suscripciones ya pagadas (estándar SaaS)</li>
            <li><strong>Excepción:</strong> Si un error técnico impide completamente el uso de la plataforma, evaluaremos reembolsos caso por caso</li>
          </ul>

          <h3>Cambios de Precio</h3>
          <ul>
            <li>Nos reservamos el derecho de modificar precios de suscripción</li>
            <li>Te notificaremos con <strong>30 días de antelación</strong> antes de aplicar nuevos precios</li>
            <li>Tienes la opción de cancelar tu suscripción antes de que el nuevo precio entre en vigor</li>
          </ul>

          <h2>7. Reglas de la Plataforma</h2>
          <p>Está prohibido:</p>
          <ul>
            <li>Acoso, lenguaje ofensivo, discriminación basada en raza, género, orientación sexual, religión, etc.</li>
            <li>Spam, phishing, malware, o cualquier actividad maliciosa</li>
            <li>Crear perfiles falsos o suplantar la identidad de otra persona</li>
            <li>Compartir cuentas con otras personas</li>
            <li>Scraping o acceso automatizado sin autorización</li>
            <li>Garantizar resultados de salud específicos (para nutricionistas)</li>
            <li>Ofrecer servicios fuera de la plataforma a clientes conocidos aquí (durante relación activa)</li>
          </ul>
          <p>
            <strong>Consecuencias:</strong> Violación de estas reglas puede resultar en suspensión
            o eliminación permanente de tu cuenta, sin previo aviso en casos graves.
          </p>

          <h2>8. Propiedad Intelectual</h2>

          <h3>Contenido de Usuarios</h3>
          <ul>
            <li>Tú posees el contenido que creas: planes de nutrición, planes de ejercicio, mensajes, fotos de perfil</li>
            <li>Al usar la plataforma, otorgas a NutriConnect una <strong>licencia no exclusiva</strong> para mostrar, almacenar y usar ese contenido dentro de la plataforma</li>
            <li>Esta licencia termina cuando eliminas el contenido o tu cuenta</li>
          </ul>

          <h3>Plataforma</h3>
          <ul>
            <li>NutriConnect posee todo el código, diseño, marca, logos y funcionalidad de la plataforma</li>
            <li>Está prohibido copiar, modificar, distribuir o crear servicios derivados sin autorización</li>
          </ul>

          <h2>9. Limitación de Responsabilidad</h2>
          <p>
            NutriConnect proporciona la plataforma "tal cual" (<em>as-is</em>). No garantizamos:
          </p>
          <ul>
            <li>Resultados de salud específicos por usar el servicio</li>
            <li>Que el consejo de nutricionistas sea adecuado para ti</li>
            <li>Que la plataforma esté disponible 100% del tiempo sin interrupciones</li>
            <li>Que los outcomes de salud serán positivos</li>
          </ul>
          <p>
            <strong>Los nutricionistas son contratistas independientes.</strong> NutriConnect no es
            responsable del consejo profesional, errores, omisiones o negligencia de los nutricionistas.
          </p>
          <p>
            <strong>Límite de responsabilidad:</strong> En la máxima medida permitida por la ley,
            nuestra responsabilidad total no excederá la cantidad que hayas pagado a NutriConnect
            en los últimos 12 meses (para nutricionistas) o €0 (para clientes).
          </p>

          <h2>10. Descargo de Garantías</h2>
          <ul>
            <li>No garantizamos disponibilidad 100% (puede haber mantenimiento, interrupciones)</li>
            <li>Puede haber bugs, errores o funcionalidades que no funcionen perfectamente</li>
            <li>No garantizamos que todos los nutricionistas sean adecuados para cada cliente</li>
            <li>Debes usar tu propio juicio al elegir un nutricionista</li>
          </ul>

          <h2>11. Terminación</h2>

          <h3>Por nuestra parte</h3>
          <ul>
            <li>Podemos suspender o eliminar cuentas que violen estos Términos de Servicio</li>
            <li>Intentaremos notificar con antelación cuando sea posible</li>
            <li>En casos graves (fraude, ilegalidad, acoso), eliminación inmediata sin previo aviso</li>
          </ul>

          <h3>Por tu parte</h3>
          <ul>
            <li>Puedes cancelar tu cuenta en cualquier momento desde tu panel de control</li>
            <li><strong>Clientes:</strong> Eliminación inmediata</li>
            <li><strong>Nutricionistas:</strong> Acceso hasta el final de tu período de facturación actual, luego eliminación</li>
          </ul>

          <h3>Retención de Datos tras Terminación</h3>
          <ul>
            <li>Conservamos datos durante <strong>30 días</strong> tras cancelación (para permitir recuperación de cuenta)</li>
            <li>Después de 30 días: <strong>eliminación permanente</strong> de todos los datos personales</li>
            <li>Excepción: Datos legales requeridos (facturas) se conservan 5 años por obligación fiscal</li>
          </ul>

          <h2>12. Ley Aplicable</h2>
          <p>
            Estos términos se rigen por las <strong>leyes españolas</strong>. Cualquier disputa
            se resolverá en los tribunales competentes de Madrid, España (o tu ubicación si estás en España).
          </p>

          <h2>13. Resolución de Disputas</h2>
          <ul>
            <li>Si tienes un problema, intenta resolverlo primero contactándonos por email: <a href="mailto:legal@nutriconnect.com">legal@nutriconnect.com</a></li>
            <li>Si no se resuelve por email: consideraremos <strong>mediación</strong> antes de litigio</li>
            <li>Como último recurso: tribunales competentes según la sección 12</li>
          </ul>

          <h2>14. Cambios a los Términos</h2>
          <p>
            Podemos actualizar estos Términos de Servicio ocasionalmente. Si hacemos cambios importantes:
          </p>
          <ul>
            <li>Te notificaremos por email (a tu dirección registrada)</li>
            <li>Actualizaremos la fecha de "última actualización" al inicio del documento</li>
            <li>El uso continuado de la plataforma después de los cambios constituye aceptación de los nuevos términos</li>
            <li>Si no estás de acuerdo con los nuevos términos, puedes cancelar tu cuenta</li>
          </ul>

          <h2>15. Divisibilidad</h2>
          <p>
            Si alguna cláusula de estos términos es declarada inválida o inaplicable por un tribunal,
            el resto del acuerdo sigue siendo válido y vinculante.
          </p>

          <h2>16. Acuerdo Completo</h2>
          <p>
            Estos Términos de Servicio, junto con nuestra <a href="/privacy">Política de Privacidad</a>,
            constituyen el acuerdo completo entre tú y NutriConnect. Sustituyen cualquier acuerdo
            previo, verbal o escrito.
          </p>

          <h2>17. Contacto</h2>
          <p>
            Para preguntas o dudas sobre estos Términos de Servicio, contáctanos en:
          </p>
          <p>
            <strong>Email:</strong> <a href="mailto:legal@nutriconnect.com">legal@nutriconnect.com</a>
          </p>

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
