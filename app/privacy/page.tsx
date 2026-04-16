import { PublicNav } from '@/components/PublicNav';

export default function Privacy() {
  return (
    <div className="content-page">
      <PublicNav />

      <main className="content-main">
        <article className="content-article">

          <h1>Política de Privacidad</h1>
          <p><em>Última actualización: 15 de abril de 2026</em></p>

          <h2>1. Introducción</h2>
          <p>
            Bienvenido a Nutri Red ("nosotros", "nuestro" o "la plataforma"). Estamos comprometidos
            con la protección de tu privacidad y tus datos personales. Esta política de privacidad
            explica qué datos recopilamos, cómo los usamos, con quién los compartimos, y cuáles
            son tus derechos.
          </p>
          <p>
            Nutri Red es una plataforma con sede en España que conecta clientes con nutricionistas
            certificados. Al usar nuestros servicios, aceptas las prácticas descritas en esta política.
          </p>

          <h2>2. Datos que Recopilamos</h2>

          <h3>Datos de cuenta</h3>
          <ul>
            <li><strong>Información básica:</strong> Email, nombre completo, rol (cliente o nutricionista)</li>
            <li><strong>Credenciales:</strong> Contraseña encriptada (usamos bcrypt, nunca almacenamos contraseñas en texto plano)</li>
            <li><strong>Verificación:</strong> Tokens de verificación de email y restablecimiento de contraseña</li>
          </ul>

          <h3>Datos de perfil</h3>
          <p><strong>Para nutricionistas:</strong></p>
          <ul>
            <li>Biografía profesional</li>
            <li>Especialidades (nutrición deportiva, clínica, infantil, etc.)</li>
            <li>Ciudad de residencia o consulta</li>
            <li>Años de experiencia</li>
            <li>Idiomas hablados</li>
            <li>Foto de perfil (opcional)</li>
            <li>Precio por sesión</li>
          </ul>

          <p><strong>Para clientes:</strong></p>
          <ul>
            <li>Objetivos nutricionales (perder peso, ganar masa muscular, mejorar salud, etc.)</li>
            <li>Restricciones dietéticas (vegetariano, vegano, sin gluten, etc.)</li>
            <li>Alergias alimentarias</li>
            <li>Peso y entradas de seguimiento</li>
            <li>Nivel de actividad física y entradas de actividad</li>
          </ul>

          <h3>Datos de uso</h3>
          <ul>
            <li>Fecha y hora de inicio de sesión</li>
            <li>Funciones utilizadas dentro de la plataforma</li>
            <li>Interacciones (búsquedas, conexiones, mensajes enviados)</li>
          </ul>

          <h3>Datos de pago</h3>
          <ul>
            <li>Procesados por <strong>Stripe</strong> (nuestro proveedor de pagos)</li>
            <li>Solo guardamos: <code>stripe_customer_id</code> y <code>stripe_subscription_id</code></li>
            <li>No almacenamos números de tarjeta, CVV, ni datos bancarios completos</li>
            <li>Las suscripciones de nutricionistas se gestionan directamente con Stripe</li>
          </ul>

          <h3>Comunicaciones</h3>
          <ul>
            <li>Mensajes de chat entre cliente y nutricionista</li>
            <li>Planes de nutrición y ejercicio creados por nutricionistas</li>
            <li>Notas y comentarios en planes</li>
          </ul>

          <h2>3. Cómo Usamos los Datos</h2>
          <p>Usamos tus datos personales para:</p>
          <ul>
            <li><strong>Proporcionar el servicio:</strong> Matching entre clientes y nutricionistas, creación de planes, chat</li>
            <li><strong>Autenticación:</strong> Inicios de sesión seguros mediante JWT y refresh tokens</li>
            <li><strong>Comunicación:</strong> Emails transaccionales (verificación, notificaciones, recordatorios)</li>
            <li><strong>Mejora de la plataforma:</strong> Análisis agregados y anónimos para entender cómo se usa la plataforma</li>
            <li><strong>Soporte al cliente:</strong> Resolver problemas técnicos y responder consultas</li>
            <li><strong>Cumplimiento legal:</strong> Cumplir con obligaciones fiscales y normativas</li>
          </ul>

          <h2>4. Compartir Datos</h2>
          <p>No vendemos tus datos personales a terceros. Solo compartimos datos en estos casos:</p>

          <h3>Con proveedores de servicios</h3>
          <ul>
            <li><strong>Stripe:</strong> Para procesar suscripciones de nutricionistas</li>
            <li><strong>Resend:</strong> Para enviar emails transaccionales (verificación, notificaciones)</li>
            <li><strong>Sentry (opcional):</strong> Para monitoreo de errores y estabilidad de la plataforma</li>
          </ul>

          <h3>Entre cliente y nutricionista</h3>
          <p>
            Cuando un cliente conecta con un nutricionista, compartimos información relevante para
            el servicio profesional: nombre, objetivos nutricionales, restricciones dietéticas,
            alergias, peso, nivel de actividad. Esta compartición es necesaria para que el nutricionista
            pueda crear planes personalizados.
          </p>

          <h3>Obligaciones legales</h3>
          <p>
            Podemos compartir datos si es requerido por ley, orden judicial, o para proteger
            los derechos de la plataforma o de terceros.
          </p>

          <h2>5. Tus Derechos</h2>
          <p>Tienes derecho a:</p>
          <ul>
            <li><strong>Acceder a tus datos:</strong> Solicita una copia de toda tu información personal</li>
            <li><strong>Corregir datos incorrectos:</strong> Actualiza tu perfil en cualquier momento</li>
            <li><strong>Eliminar tu cuenta:</strong> Solicita la eliminación completa de tu cuenta y datos asociados</li>
            <li><strong>Oponerte al procesamiento:</strong> En ciertos casos, puedes oponerte a cómo usamos tus datos</li>
            <li><strong>Portabilidad de datos:</strong> Recibe tus datos en formato JSON para transferirlos a otro servicio</li>
          </ul>
          <p>
            Para ejercer estos derechos, envía un email a{' '}
            <a href="mailto:privacy@nutri.red">privacy@nutri.red</a>.
            Responderemos en un plazo de 30 días.
          </p>

          <h2>6. Cookies</h2>
          <p>
            Usamos cookies esenciales para el funcionamiento de la plataforma:
          </p>
          <ul>
            <li><strong>Cookie de sesión:</strong> Almacena tu refresh token para mantener tu sesión activa. Es <code>httpOnly</code> y <code>secure</code> (solo HTTPS).</li>
          </ul>
          <p>
            <strong>No usamos cookies de terceros</strong> para tracking, publicidad o análisis.
            Puedes deshabilitar cookies en tu navegador, pero esto impedirá que puedas iniciar sesión.
          </p>

          <h2>7. Seguridad</h2>
          <p>Tomamos la seguridad muy en serio:</p>
          <ul>
            <li><strong>Contraseñas encriptadas:</strong> Usamos bcrypt con salt para proteger contraseñas</li>
            <li><strong>Conexiones HTTPS:</strong> Todo el tráfico está cifrado en tránsito</li>
            <li><strong>Sesiones seguras:</strong> Tokens JWT con expiración de 15 minutos; refresh tokens rotados</li>
            <li><strong>Acceso limitado:</strong> Solo personal autorizado puede acceder a datos personales</li>
            <li><strong>Backups regulares:</strong> Para prevenir pérdida de datos</li>
          </ul>
          <p>
            A pesar de estas medidas, ningún sistema es 100% seguro. Si detectas actividad sospechosa
            en tu cuenta, contáctanos de inmediato.
          </p>

          <h2>8. Retención de Datos</h2>
          <ul>
            <li><strong>Cuenta activa:</strong> Mantenemos tus datos mientras tu cuenta esté activa</li>
            <li><strong>Tras cancelación:</strong> 30 días de gracia para permitir recuperación de cuenta</li>
            <li><strong>Después de 30 días:</strong> Eliminación permanente de todos los datos personales</li>
            <li><strong>Datos legales:</strong> Facturas y datos fiscales se conservan 5 años (obligación legal)</li>
          </ul>

          <h2>9. Internacional y GDPR</h2>
          <p>
            Nutri Red está diseñado para cumplir con el <strong>Reglamento General de Protección de Datos (GDPR)</strong>
            de la Unión Europea. Si nuestros servidores están ubicados fuera de la UE, garantizamos
            que las transferencias internacionales cumplen con las salvaguardas apropiadas.
          </p>

          <h2>10. Menores de Edad</h2>
          <p>
            Nutri Red es un servicio para <strong>mayores de 18 años</strong>. No recopilamos
            intencionalmente datos de menores. Si descubrimos que un menor se ha registrado,
            eliminaremos su cuenta de inmediato.
          </p>

          <h2>11. Cambios a esta Política</h2>
          <p>
            Podemos actualizar esta política de privacidad ocasionalmente. Si hacemos cambios
            importantes, te notificaremos por email (a la dirección registrada) y actualizaremos
            la fecha de "última actualización" al inicio del documento.
          </p>
          <p>
            El uso continuado de la plataforma tras los cambios constituye aceptación de la nueva política.
          </p>

          <h2>12. Contacto</h2>
          <p>
            Para preguntas, dudas o solicitudes relacionadas con privacidad y protección de datos,
            contáctanos en:
          </p>
          <p>
            <strong>Email:</strong> <a href="mailto:privacy@nutri.red">privacy@nutri.red</a>
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
