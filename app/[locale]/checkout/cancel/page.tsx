'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

export default function CheckoutCancelPage() {
  const router = useRouter();
  const t = useTranslations('public.checkout.cancel');
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
          background: 'rgba(185,74,58,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: 28,
          color: '#b94a3a',
        }}>
          ✕
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

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.back()}
            className="nc-btn-contact"
            style={{ background: 'transparent', border: '1px solid var(--nc-terra)', color: 'var(--nc-terra)' }}
          >
            {t('go_back')}
          </button>
          <Link
            href={`/${locale}/nutritionists`}
            className="nc-btn-contact"
            style={{ display: 'inline-block', textDecoration: 'none' }}
          >
            {t('browse_nutritionists')}
          </Link>
        </div>
      </div>
    </div>
  );
}
