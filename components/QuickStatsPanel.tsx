// frontend/components/QuickStatsPanel.tsx
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { QuickStats } from '@/lib/types';

interface QuickStatsPanelProps {
  stats: QuickStats | null;
  isLoading: boolean;
}

function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`;
}

export default function QuickStatsPanel({ stats, isLoading }: QuickStatsPanelProps) {
  const locale = useLocale();
  const t = useTranslations('dashboard.clients');

  if (isLoading) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid rgba(139,115,85,0.12)',
        borderRadius: 8,
        padding: 24,
        marginBottom: 20,
      }}>
        <div style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>{t('stats_loading')}</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div style={{
      background: 'white',
      border: '1px solid rgba(139,115,85,0.12)',
      borderRadius: 8,
      padding: 24,
      marginBottom: 20,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
        marginBottom: 16,
      }}>
        {/* MRR */}
        <div>
          <div style={{
            fontSize: 12,
            color: 'var(--nc-stone)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 6,
          }}>
            {t('stats_mrr')}
          </div>
          <div style={{
            fontSize: 24,
            fontWeight: 600,
            color: 'var(--nc-forest)',
          }}>
            {formatCurrency(stats.mrr_cents)}{t('stats_per_month')}
          </div>
        </div>

        {/* Active Clients */}
        <div>
          <div style={{
            fontSize: 12,
            color: 'var(--nc-stone)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 6,
          }}>
            {t('stats_active_clients')}
          </div>
          <div style={{
            fontSize: 24,
            fontWeight: 600,
            color: 'var(--nc-ink)',
          }}>
            {stats.active_clients_count}
          </div>
        </div>

        {/* Pending Intros */}
        <div>
          <div style={{
            fontSize: 12,
            color: 'var(--nc-stone)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 6,
          }}>
            {t('stats_pending')}
          </div>
          <div style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#b8860b',
          }}>
            {stats.pending_intros_count}
          </div>
        </div>

        {/* One-time revenue this month */}
        <div>
          <div style={{
            fontSize: 12,
            color: 'var(--nc-stone)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 6,
          }}>
            {t('stats_one_time')}
          </div>
          <div style={{
            fontSize: 24,
            fontWeight: 600,
            color: 'var(--nc-terra)',
          }}>
            {formatCurrency(stats.one_time_revenue_this_month_cents)}
          </div>
        </div>
      </div>

      {/* Link to business dashboard (will be built in Plan B) */}
      <Link
        href={`/${locale}/dashboard/business`}
        style={{
          fontSize: 13,
          color: 'var(--nc-terra)',
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        {t('stats_view_business')}
      </Link>
    </div>
  );
}
