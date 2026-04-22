// frontend/app/(auth)/reset-password/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { api, ApiRequestError } from '@/lib/api';

function ResetPasswordForm() {
  const t = useTranslations('auth.reset_password');
  const locale = useLocale();
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
        <a href={`/${locale}/`} className="auth-logo" style={{ textAlign: 'left' }}>nutri<span>connect</span></a>
        <div className="auth-alert auth-alert-error">
          {t('no_token_message')}
        </div>
        <a href={`/${locale}/forgot-password`} className="btn-auth" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1rem' }}>
          {t('request_new_link')}
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError(t('error_mismatch'));
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, new_password: password });
      router.push('/login?reset=1');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.code === 'TOKEN_EXPIRED') {
          setError(t('error_token_expired'));
        } else {
          setError(t('error_token_used'));
        }
      } else {
        setError(t('error_generic'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <a href={`/${locale}/`} className="auth-logo">nutri<span>connect</span></a>
      <h1 className="auth-heading">{t('title')}</h1>
      <p className="auth-sub">{t('subtitle')}</p>

      {error && <div className="auth-alert auth-alert-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="password">{t('password')}</label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder={t('password_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="confirm">{t('confirm_password')}</label>
          <input
            id="confirm"
            type="password"
            className="form-input"
            placeholder={t('confirm_password_placeholder')}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn-auth" disabled={loading}>
          {loading ? t('submitting') : t('submit')}
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
