// frontend/app/(auth)/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgot_password');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await api.post('/auth/forgot-password', { email }).catch(() => {}); // always succeeds
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <a href={`/${locale}/`} className="auth-logo" style={{ textAlign: 'left' }}>nutri<span>connect</span></a>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
        <h1 className="auth-heading">{t('success')}</h1>
        <p className="auth-sub">
          {t('success_message')}
        </p>
        <hr className="auth-divider" />
        <p className="auth-footer"><a href={`/${locale}/login`}>{t('back_to_login')}</a></p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <a href={`/${locale}/`} className="auth-logo">nutri<span>connect</span></a>
      <h1 className="auth-heading">{t('title')}</h1>
      <p className="auth-sub">{t('subtitle')}</p>

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
          />
        </div>
        <button type="submit" className="btn-auth" disabled={loading}>
          {loading ? t('submitting') : t('submit')}
        </button>
      </form>

      <hr className="auth-divider" />
      <p className="auth-footer"><a href={`/${locale}/login`}>{t('back_to_login')}</a></p>
    </div>
  );
}
