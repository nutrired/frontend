// frontend/app/(auth)/login/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { api, ApiRequestError } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth.login');
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
      const res = await api.post<{ id: string; email: string; role: string; access_token: string }>('/auth/login', { email, password });

      // Store access token for WebSocket authentication
      if (res.access_token) {
        sessionStorage.setItem('access_token', res.access_token);
      }

      const defaultRoute = res.role === 'nutritionist' ? '/dashboard/profile' : '/dashboard';
      router.push(from === '/' ? defaultRoute : from);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.code === 'EMAIL_NOT_VERIFIED') {
          setUnverified(true);
        } else if (err.code === 'INVALID_CREDENTIALS') {
          setError(t('error_invalid', { default: err.message }));
        } else {
          setError(t('error_network'));
        }
      } else {
        setError(t('error_network'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <a href="/" className="auth-logo">nutri<span>red</span></a>

      <h1 className="auth-heading">
        {t('title')}
      </h1>
      <p className="auth-sub">{t('subtitle')}</p>

      {error && <div className="auth-alert auth-alert-error">{error}</div>}

      {unverified && (
        <div className="auth-alert auth-alert-error">
          Your email has not been verified.{' '}
          <a href="/verify-email" style={{ fontWeight: 500, color: 'inherit', textDecoration: 'underline' }}>
            Resend verification
          </a>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="email">{t('email')}</label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder={t('email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            suppressHydrationWarning
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="password">
            {t('password')}
            <a href="/forgot-password" style={{ float: 'right', fontWeight: 400, color: 'var(--ink-soft)', fontSize: '0.8125rem' }}>
              {t('forgot_password')}
            </a>
          </label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder={t('password_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            suppressHydrationWarning
          />
        </div>

        <button type="submit" className="btn-auth" disabled={loading}>
          {loading ? t('submitting') : t('submit')}
        </button>
      </form>

      <hr className="auth-divider" />

      <p className="auth-footer">
        {t('no_account')} <a href="/register">{t('register')}</a>
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
