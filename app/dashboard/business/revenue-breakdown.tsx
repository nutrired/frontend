// frontend/app/dashboard/business/revenue-breakdown.tsx
'use client';

import type { BusinessDashboardData } from '@/lib/types';

interface Props {
  data: BusinessDashboardData;
}

function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

export function RevenueBreakdown({ data }: Props) {
  return (
    <div style={{ background: 'white', borderRadius: 8, padding: 24, marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--nc-stone)' }}>
        Revenue Breakdown
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Monthly subscriptions */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--nc-forest)' }}>
            Monthly Subscriptions
          </h3>
          <div style={{ fontSize: 13, color: 'var(--nc-stone)', marginBottom: 8 }}>
            Total MRR: <strong>{formatCurrency(data.revenue_monthly.total_cents)}/month</strong>
            <br />
            Clients: {data.revenue_monthly.client_count}
          </div>
          {data.revenue_monthly.packages.length > 0 ? (
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--nc-cream)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--nc-stone)', fontWeight: 600 }}>Package</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--nc-stone)', fontWeight: 600 }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--nc-stone)', fontWeight: 600 }}>Clients</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--nc-stone)', fontWeight: 600 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.revenue_monthly.packages.map((pkg, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--nc-cream)' }}>
                    <td style={{ padding: '8px 0' }}>{pkg.package_name}</td>
                    <td style={{ textAlign: 'right', padding: '8px 0' }}>{formatCurrency(pkg.price_cents)}/mo</td>
                    <td style={{ textAlign: 'right', padding: '8px 0' }}>{pkg.client_count}</td>
                    <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600 }}>
                      {formatCurrency(pkg.price_cents * pkg.client_count)}/mo
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--nc-stone)', fontStyle: 'italic' }}>
              No monthly packages
            </div>
          )}
        </div>

        {/* One-time services */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--nc-terra)' }}>
            One-time Services
          </h3>
          <div style={{ fontSize: 13, color: 'var(--nc-stone)', marginBottom: 8 }}>
            Total (this month): <strong>{formatCurrency(data.revenue_one_time.total_cents)}</strong>
            <br />
            Clients: {data.revenue_one_time.client_count}
          </div>
          {data.revenue_one_time.packages.length > 0 ? (
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--nc-cream)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--nc-stone)', fontWeight: 600 }}>Package</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--nc-stone)', fontWeight: 600 }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--nc-stone)', fontWeight: 600 }}>Clients</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--nc-stone)', fontWeight: 600 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.revenue_one_time.packages.map((pkg, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--nc-cream)' }}>
                    <td style={{ padding: '8px 0' }}>{pkg.package_name}</td>
                    <td style={{ textAlign: 'right', padding: '8px 0' }}>{formatCurrency(pkg.price_cents)}</td>
                    <td style={{ textAlign: 'right', padding: '8px 0' }}>{pkg.client_count}</td>
                    <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600 }}>
                      {formatCurrency(pkg.price_cents * pkg.client_count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--nc-stone)', fontStyle: 'italic' }}>
              No one-time packages this month
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
