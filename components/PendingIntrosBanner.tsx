import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface PendingIntrosBannerProps {
  count: number;
  locale: string;
}

export function PendingIntrosBanner({ count, locale }: PendingIntrosBannerProps) {
  const t = useTranslations('dashboard');

  if (count === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: 'rgba(74, 124, 89, 0.1)',
        border: '1px solid var(--nc-forest)',
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>📬</span>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--nc-ink)' }}>
          {t('pending_banner', { count })}
        </span>
      </div>
      <Link
        href={`/${locale}/dashboard/clients?status=pending`}
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--nc-forest)',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {t('pending_banner_action')} →
      </Link>
    </div>
  );
}
