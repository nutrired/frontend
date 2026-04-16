// frontend/app/dashboard/business/contract-history-table.tsx
'use client';

import { useState } from 'react';
import type { ContractItem } from '@/lib/types';

interface Props {
  contracts: ContractItem[];
}

function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ContractHistoryTable({ contracts }: Props) {
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sorted = [...contracts].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'date') {
      cmp = new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
    } else if (sortBy === 'name') {
      cmp = a.client_name.localeCompare(b.client_name);
    } else if (sortBy === 'price') {
      cmp = a.price_cents - b.price_cents;
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (col: 'date' | 'name' | 'price') => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: 8, padding: 24, marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--nc-stone)' }}>
        Contract History
      </h2>

      {contracts.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontStyle: 'italic' }}>
          No active contracts
        </div>
      ) : (
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--nc-cream)' }}>
              <th
                onClick={() => toggleSort('name')}
                style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--nc-stone)', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
              >
                Client {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--nc-stone)', fontWeight: 600 }}>
                Package
              </th>
              <th
                onClick={() => toggleSort('price')}
                style={{ textAlign: 'right', padding: '12px 8px', color: 'var(--nc-stone)', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
              >
                Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ textAlign: 'center', padding: '12px 8px', color: 'var(--nc-stone)', fontWeight: 600 }}>
                Type
              </th>
              <th
                onClick={() => toggleSort('date')}
                style={{ textAlign: 'right', padding: '12px 8px', color: 'var(--nc-stone)', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
              >
                Start Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ textAlign: 'center', padding: '12px 8px', color: 'var(--nc-stone)', fontWeight: 600 }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((contract, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--nc-cream)' }}>
                <td style={{ padding: '12px 8px' }}>{contract.client_name}</td>
                <td style={{ padding: '12px 8px' }}>{contract.package_name}</td>
                <td style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 600 }}>
                  {formatCurrency(contract.price_cents)}
                  {contract.billing_cycle === 'monthly' && '/mo'}
                </td>
                <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {contract.billing_cycle === 'monthly' ? 'Monthly' : 'One-time'}
                </td>
                <td style={{ textAlign: 'right', padding: '12px 8px', fontSize: 12 }}>
                  {formatDate(contract.starts_at)}
                </td>
                <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: 100,
                    background: contract.status === 'active' ? 'rgba(74,124,89,0.12)' : 'rgba(139,115,85,0.12)',
                    color: contract.status === 'active' ? 'var(--nc-forest)' : 'var(--nc-stone)',
                  }}>
                    {contract.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
