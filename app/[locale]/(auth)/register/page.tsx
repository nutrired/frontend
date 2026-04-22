// frontend/app/(auth)/register/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { api, ApiRequestError } from '@/lib/api';

type Role = 'client' | 'nutritionist';

function RegisterForm() {
  const router = useRouter();
  const t = useTranslations('auth.register');
  const locale = useLocale();
  const [role, setRole] = useState<Role>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password, role });
      router.push('/verify-email');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.code === 'EMAIL_TAKEN') {
          setError(t('error_email_exists'));
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
      <a href={`/${locale}/`} className="auth-logo">nutri<span>connect</span></a>

      <h1 className="auth-heading">{t('title')}</h1>
      <p className="auth-sub">{t('subtitle')}</p>

      {error && <div className="auth-alert auth-alert-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">{t('role_label')}</label>
          <div className="role-grid">
            <label className={`role-option${role === 'client' ? ' selected' : ''}`}>
              <input type="radio" name="role" value="client" checked={role === 'client'} onChange={() => setRole('client')} />
              <div className="role-icon">🥗</div>
              <div className="role-label">{t('client')}</div>
              <div className="role-desc">{t('client_desc')}</div>
            </label>
            <label className={`role-option${role === 'nutritionist' ? ' selected' : ''}`}>
              <input type="radio" name="role" value="nutritionist" checked={role === 'nutritionist'} onChange={() => setRole('nutritionist')} />
              <div className="role-icon">👩‍⚕️</div>
              <div className="role-label">{t('nutritionist')}</div>
              <div className="role-desc">{t('nutritionist_desc')}</div>
            </label>
          </div>
        </div>

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
            suppressHydrationWarning
          />
        </div>

        <button type="submit" className="btn-auth" disabled={loading}>
          {loading ? t('submitting') : t('submit')}
        </button>
      </form>

      <hr className="auth-divider" />

      <p className="auth-footer">
        {t('already_have_account')} <a href={`/${locale}/login`}>{t('login')}</a>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
