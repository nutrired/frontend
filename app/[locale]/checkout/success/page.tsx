'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

export default function CheckoutSuccessPage() {
  const t = useTranslations('public.checkout.success');
  const locale = useLocale();

  return (
    <div style={{ background: 'var(--nc-cream)', minHeight: '100vh' }}>
      <nav className="nc-nav">
        <Link href={`/${locale}`} className="nc-nav-logo">Nutri<span>Connect</span></Link>
      </nav>

      <div style={{
        maxWidth: 480,
        margin: '80px auto',
        padding: '0 24px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#4a7c59',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: 28,
        }}>
          ✓
        </div>

        <h1 style={{
          fontFamily: 'var(--nc-font-serif)',
          fontSize: 28,
          color: 'var(--nc-ink)',
          marginBottom: 12,
          fontWeight: 400,
        }}>
          {t('title')}
        </h1>

        <p style={{
          color: 'var(--nc-stone)',
          fontSize: 15,
          lineHeight: 1.6,
          marginBottom: 32,
          fontWeight: 300,
        }}>
          {t('description')}
        </p>

        <Link
          href={`/${locale}/dashboard`}
          className="nc-btn-contact"
          style={{ display: 'inline-block', textDecoration: 'none' }}
        >
          {t('go_to_dashboard')}
        </Link>
      </div>
    </div>
  );
}
