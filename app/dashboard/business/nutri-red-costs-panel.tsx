// frontend/app/dashboard/business/nutri-red-costs-panel.tsx
'use client';

import type { BusinessDashboardData } from '@/lib/types';

interface Props {
  data: BusinessDashboardData;
}

function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

export function NutriRedCostsPanel({ data }: Props) {
  const effectiveCostPerClient = data.active_clients_count > 0
    ? data.tier_cost_cents / data.active_clients_count
    : 0;

  const netProfitCents = data.mrr_cents - data.tier_cost_cents;
  const isProfitable = netProfitCents > 0;

  const capacityPercent = data.tier_capacity > 0
    ? (data.active_clients_count / data.tier_capacity) * 100
    : 0;

  return (
    <div style={{ background: 'white', borderRadius: 8, padding: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--nc-stone)' }}>
        Your Nutri Red Costs
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Subscription info */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--nc-stone)' }}>
            Current Tier
          </h3>
          <div style={{ fontSize: 24, fontWeight: 700, textTransform: 'capitalize', color: 'var(--nc-forest)' }}>
            {data.nutritionist_tier}
          </div>
          <div style={{ fontSize: 13, color: 'var(--nc-stone)', marginTop: 4 }}>
            {formatCurrency(data.tier_cost_cents)}/month
          </div>
          <div style={{ fontSize: 12, color: 'var(--nc-stone)', marginTop: 8 }}>
            Active clients: <strong>{data.active_clients_count}</strong> / {data.tier_capacity > 0 ? data.tier_capacity : '∞'}
          </div>
          {data.tier_capacity > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--nc-cream)', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(capacityPercent, 100)}%`,
                  height: '100%',
                  background: capacityPercent >= 90 ? 'var(--nc-terra)' : 'var(--nc-forest)',
                  transition: 'width 0.3s ease',
                }}></div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--nc-stone)', marginTop: 4 }}>
                {capacityPercent.toFixed(0)}% capacity used
              </div>
            </div>
          )}
        </div>

        {/* Cost analysis */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--nc-stone)' }}>
            Cost Analysis
          </h3>
          <div style={{ fontSize: 13, color: 'var(--nc-stone)', marginBottom: 8 }}>
            Effective cost per client:
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--nc-stone)' }}>
            {formatCurrency(effectiveCostPerClient)}/client
          </div>
          {data.tier_cost_cents > 0 && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 4, background: isProfitable ? 'rgba(74,124,89,0.08)' : 'rgba(205,92,92,0.08)' }}>
              <div style={{ fontSize: 12, color: isProfitable ? 'var(--nc-forest)' : '#cd5c5c', fontWeight: 600 }}>
                {isProfitable ? 'Profitable' : 'MRR below subscription cost'}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4, color: isProfitable ? 'var(--nc-forest)' : '#cd5c5c' }}>
                {isProfitable ? '+' : ''}{formatCurrency(netProfitCents)}/month
              </div>
              {!isProfitable && data.mrr_cents > 0 && (
                <div style={{ fontSize: 11, color: '#cd5c5c', marginTop: 4 }}>
                  Add {Math.ceil((data.tier_cost_cents - data.mrr_cents) / (data.mrr_cents / data.mrr_client_count))} more monthly client{Math.ceil((data.tier_cost_cents - data.mrr_cents) / (data.mrr_cents / data.mrr_client_count)) !== 1 ? 's' : ''} to break even
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
