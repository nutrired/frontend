// frontend/app/(auth)/reset-password/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, ApiRequestError } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <a href="/" className="auth-logo" style={{ textAlign: 'left' }}>nutri<span>connect</span></a>
        <div className="auth-alert auth-alert-error">
          Enlace inválido. Solicita un nuevo enlace de restablecimiento.
        </div>
        <a href="/forgot-password" className="btn-auth" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1rem' }}>
          Solicitar nuevo enlace
        </a>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, new_password: password });
      router.push('/login?reset=1');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.code === 'TOKEN_EXPIRED') {
          setError('El enlace ha expirado. Solicita uno nuevo.');
        } else {
          setError('Enlace inválido o ya utilizado. Solicita uno nuevo.');
        }
      } else {
        setError('Algo salió mal. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <a href="/" className="auth-logo">nutri<span>connect</span></a>
      <h1 className="auth-heading">Nueva <em>contraseña</em></h1>
      <p className="auth-sub">Elige una contraseña segura de al menos 8 caracteres.</p>

      {error && <div className="auth-alert auth-alert-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="password">Nueva contraseña</label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="confirm">Confirmar contraseña</label>
          <input
            id="confirm"
            type="password"
            className="form-input"
            placeholder="Repite la contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn-auth" disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
