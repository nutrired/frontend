// frontend/app/dashboard/clients/page.tsx
'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import QuickStatsPanel from '@/components/QuickStatsPanel';
import SearchFilterBar from '@/components/SearchFilterBar';
import ClientCard from '@/components/ClientCard';
import { useQuickStats, useEnhancedClients } from '@/lib/enhanced-clients';
import { useNutritionistOverview } from '@/lib/nutritionist';
import { useAuth } from '@/lib/auth';
import { PendingIntrosBanner } from '@/components/PendingIntrosBanner';

export default function MyClientsPage() {
  const t = useTranslations('dashboard.clients');
  const locale = useLocale();
  const { user } = useAuth();
  const { overview } = useNutritionistOverview();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');

  const { stats, isLoading: statsLoading } = useQuickStats();
  const { clients, isLoading: clientsLoading, error } = useEnhancedClients({
    search,
    status,
    sort,
  });

  const hasFilters = search !== '' || status !== '';

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">{t('title')}</div>
      </div>
      <div className="dash-content">
        {user?.role === 'nutritionist' && overview && (
          <PendingIntrosBanner count={overview.pending_intros_count} locale={locale} />
        )}

        <QuickStatsPanel stats={stats} isLoading={statsLoading} />

        <SearchFilterBar
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onSortChange={setSort}
          initialSearch={search}
          initialStatus={status}
          initialSort={sort}
        />

        {clientsLoading ? (
          <div style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>
            {t('loading')}
          </div>
        ) : error ? (
          <div style={{
            background: 'white',
            border: '1px solid rgba(205,92,92,0.2)',
            borderRadius: 8,
            padding: 24,
            color: '#cd5c5c',
          }}>
            {t('error')}
          </div>
        ) : clients.length === 0 ? (
          <div style={{
            background: 'white',
            border: '1px solid rgba(139,115,85,0.12)',
            borderRadius: 8,
            padding: 24,
            textAlign: 'center',
            color: 'var(--nc-stone)',
            fontWeight: 300,
          }}>
            {hasFilters ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  {t('no_results')}
                </div>
                <button
                  onClick={() => {
                    setSearch('');
                    setStatus('');
                    setSort('newest');
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--nc-terra)',
                    background: 'rgba(196,98,45,0.08)',
                    border: '1px solid rgba(196,98,45,0.2)',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  {t('clear_filters')}
                </button>
              </>
            ) : (
              t('no_clients')
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {clients.map((client) => (
              <ClientCard key={client.relationship_id} client={client} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
