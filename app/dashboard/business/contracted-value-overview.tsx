// frontend/app/dashboard/business/contracted-value-overview.tsx
'use client';

import type { BusinessDashboardData } from '@/lib/types';

interface Props {
  data: BusinessDashboardData;
}

function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

export function ContractedValueOverview({ data }: Props) {
  return (
    <div style={{ background: 'white', borderRadius: 8, padding: 24, marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--nc-stone)' }}>
        Contracted Value Overview
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {/* MRR */}
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--nc-forest)' }}>
            {formatCurrency(data.mrr_cents)}/month
          </div>
          <div style={{ fontSize: 13, color: 'var(--nc-stone)', marginTop: 4 }}>
            Monthly Recurring Revenue
          </div>
          <div style={{ fontSize: 12, color: 'var(--nc-stone)', marginTop: 2 }}>
            from {data.mrr_client_count} active monthly client{data.mrr_client_count !== 1 ? 's' : ''}
          </div>
        </div>

        {/* One-time revenue this month */}
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--nc-terra)' }}>
            {formatCurrency(data.one_time_revenue_this_month_cents)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--nc-stone)', marginTop: 4 }}>
            One-time Revenue (This Month)
          </div>
          <div style={{ fontSize: 12, color: 'var(--nc-stone)', marginTop: 2 }}>
            from {data.one_time_client_count} new one-time client{data.one_time_client_count !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Total active contracts */}
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--nc-stone)' }}>
            {data.total_active_contracts}
          </div>
          <div style={{ fontSize: 13, color: 'var(--nc-stone)', marginTop: 4 }}>
            Total Active Contracts
          </div>
          <div style={{ fontSize: 12, color: 'var(--nc-stone)', marginTop: 2 }}>
            average {formatCurrency(data.avg_contract_value_cents)} per client
          </div>
        </div>
      </div>
    </div>
  );
}
