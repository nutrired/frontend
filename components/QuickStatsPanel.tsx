// frontend/components/QuickStatsPanel.tsx
import Link from 'next/link';
import type { QuickStats } from '@/lib/types';

interface QuickStatsPanelProps {
  stats: QuickStats | null;
  isLoading: boolean;
}

function formatCurrency(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`;
}

export default function QuickStatsPanel({ stats, isLoading }: QuickStatsPanelProps) {
  if (isLoading) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid rgba(139,115,85,0.12)',
        borderRadius: 8,
        padding: 24,
        marginBottom: 20,
      }}>
        <div style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>Cargando estadísticas…</div>
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
            MRR (Ingresos Mensuales)
          </div>
          <div style={{
            fontSize: 24,
            fontWeight: 600,
            color: 'var(--nc-forest)',
          }}>
            {formatCurrency(stats.mrr_cents)}/mes
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
            Clientes Activos
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
            Pendientes
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
            Ingresos Únicos (Este Mes)
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
        href="/dashboard/business"
        style={{
          fontSize: 13,
          color: 'var(--nc-terra)',
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        Ver Panel de Negocio →
      </Link>
    </div>
  );
}
