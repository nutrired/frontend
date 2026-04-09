// frontend/app/(auth)/verify-email/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, ApiRequestError } from '@/lib/api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  // Auto-verify when token is present in the URL.
  useEffect(() => {
    if (!token) return;
    setStatus('verifying');
    api.post('/auth/verify-email', { token })
      .then(() => {
        setStatus('success');
        setTimeout(() => router.push('/login'), 2000);
      })
      .catch((err) => {
        setStatus('error');
        if (err instanceof ApiRequestError) {
          if (err.code === 'TOKEN_EXPIRED') {
            setErrorMsg('El enlace ha expirado. Solicita uno nuevo.');
          } else {
            setErrorMsg('Enlace inválido o ya utilizado.');
          }
        } else {
          setErrorMsg('Algo salió mal. Inténtalo de nuevo.');
        }
      });
  }, [token, router]);

  async function handleResend() {
    // The resend flow re-registers with the same email isn't possible here since
    // we don't have the email. Redirect to register so the user can try again.
    // TODO Slice 3+: add a dedicated resend endpoint once email is stored in session.
    router.push('/register');
  }

  if (token) {
    return (
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <a href="/" className="auth-logo" style={{ textAlign: 'left' }}>nutri<span>connect</span></a>

        {status === 'verifying' && (
          <>
            <h1 className="auth-heading">Verificando…</h1>
            <p className="auth-sub">Por favor espera un momento.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h1 className="auth-heading">¡Email <em>verificado</em>!</h1>
            <p className="auth-sub">Redirigiendo al inicio de sesión…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="auth-alert auth-alert-error">{errorMsg}</div>
            <h1 className="auth-heading">Enlace <em>inválido</em></h1>
            <p className="auth-sub">El enlace de verificación no es válido o ya fue usado.</p>
            <a href="/register" className="btn-auth" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1rem' }}>
              Volver al registro
            </a>
          </>
        )}
      </div>
    );
  }

  // No token — show "check your inbox" screen.
  return (
    <div className="auth-card" style={{ textAlign: 'center' }}>
      <a href="/" className="auth-logo" style={{ textAlign: 'left' }}>nutri<span>connect</span></a>

      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
      <h1 className="auth-heading">Revisa tu <em>correo</em></h1>
      <p className="auth-sub">
        Te enviamos un enlace de verificación. Haz clic en él para activar tu cuenta.
      </p>

      {resendSent && (
        <div className="auth-alert auth-alert-success">
          Enlace reenviado. Revisa tu bandeja de entrada.
        </div>
      )}

      <button
        className="btn-auth"
        disabled={resendLoading || resendSent}
        onClick={handleResend}
        style={{ width: '100%' }}
      >
        {resendLoading ? 'Reenviando…' : resendSent ? 'Enviado ✓' : 'Reenviar enlace'}
      </button>

      <hr className="auth-divider" />
      <p className="auth-footer">
        <a href="/login">Volver al inicio de sesión</a>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
