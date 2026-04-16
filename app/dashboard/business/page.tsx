// frontend/app/dashboard/business/page.tsx
'use client';

import { useBusinessDashboard } from '@/lib/hiring';
import { ContractedValueOverview } from './contracted-value-overview';
import { RevenueBreakdown } from './revenue-breakdown';
import { ContractHistoryTable } from './contract-history-table';
import { NutriConnectCostsPanel } from './nutriconnect-costs-panel';

export default function BusinessDashboardPage() {
  const { data, isLoading, error } = useBusinessDashboard();

  if (isLoading) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: 'var(--nc-stone)', fontSize: 14 }}>Loading business dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: '#cd5c5c', fontSize: 14 }}>Failed to load business dashboard</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--nc-stone)', marginBottom: 8 }}>
          Business Dashboard
        </h1>
        <p style={{ fontSize: 14, color: 'var(--nc-stone)' }}>
          Financial overview of your nutrition practice
        </p>
      </div>

      <ContractedValueOverview data={data} />
      <RevenueBreakdown data={data} />
      <ContractHistoryTable contracts={data.contracts} />
      <NutriConnectCostsPanel data={data} />
    </div>
  );
}
