// frontend/app/(auth)/login/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, ApiRequestError } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get('from') ?? '/';
  const from = raw.startsWith('/') ? raw : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unverified, setUnverified] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setUnverified(false);
    setLoading(true);
    try {
      const res = await api.post<{ id: string; email: string; role: string }>('/auth/login', { email, password });
      const defaultRoute = res.role === 'nutritionist' ? '/dashboard/profile' : '/dashboard';
      router.push(from === '/' ? defaultRoute : from);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.code === 'EMAIL_NOT_VERIFIED') {
          setUnverified(true);
        } else if (err.code === 'INVALID_CREDENTIALS') {
          setError('Email o contraseña incorrectos.');
        } else {
          setError(err.message);
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

      <h1 className="auth-heading">Bienvenido <em>de vuelta</em></h1>
      <p className="auth-sub">Inicia sesión para continuar.</p>

      {error && <div className="auth-alert auth-alert-error">{error}</div>}

      {unverified && (
        <div className="auth-alert auth-alert-error">
          Tu email no ha sido verificado.{' '}
          <a href="/verify-email" style={{ fontWeight: 500, color: 'inherit', textDecoration: 'underline' }}>
            Reenviar verificación
          </a>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="password">
            Contraseña
            <a href="/forgot-password" style={{ float: 'right', fontWeight: 400, color: 'var(--ink-soft)', fontSize: '0.8125rem' }}>
              ¿Olvidaste tu contraseña?
            </a>
          </label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn-auth" disabled={loading}>
          {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </button>
      </form>

      <hr className="auth-divider" />

      <p className="auth-footer">
        ¿No tienes cuenta? <a href="/register">Regístrate gratis</a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
