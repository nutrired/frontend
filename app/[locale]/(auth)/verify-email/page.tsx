// frontend/app/[locale]/(auth)/verify-email/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { api, ApiRequestError } from '@/lib/api';

function VerifyEmailContent() {
  const t = useTranslations('auth.verify_email');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

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
            setErrorMsg(t('error_message'));
          } else {
            setErrorMsg(t('error_message'));
          }
        } else {
          setErrorMsg(t('error_message'));
        }
      });
  }, [token, router, t]);

  if (token) {
    return (
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <a href={`/${locale}/`} className="auth-logo" style={{ textAlign: 'left' }}>nutri<span>connect</span></a>

        {(status === 'idle' || status === 'verifying') && (
          <>
            <h1 className="auth-heading">{t('verifying')}</h1>
            <p className="auth-sub">{t('verifying_message')}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h1 className="auth-heading">{t('success')}</h1>
            <p className="auth-sub">{t('redirecting')}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="auth-alert auth-alert-error">{errorMsg}</div>
            <h1 className="auth-heading">{t('error')}</h1>
            <p className="auth-sub">{t('error_message')}</p>
            <a href={`/${locale}/register`} className="btn-auth" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1rem' }}>
              {t('back_to_register')}
            </a>
          </>
        )}
      </div>
    );
  }

  // No token — show "check your inbox" screen.
  return (
    <div className="auth-card" style={{ textAlign: 'center' }}>
      <a href={`/${locale}/`} className="auth-logo" style={{ textAlign: 'left' }}>nutri<span>connect</span></a>

      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
      <h1 className="auth-heading">{t('check_email_title')}</h1>
      <p className="auth-sub">
        {t('check_email_message')}
      </p>

      <a href={`/${locale}/register`} className="btn-auth" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', width: '100%' }}>
        {t('back_to_register')}
      </a>

      <hr className="auth-divider" />
      <p className="auth-footer">
        <a href={`/${locale}/login`}>{t('back_to_login')}</a>
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
