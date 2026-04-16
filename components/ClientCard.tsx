// frontend/components/ClientCard.tsx
import Link from 'next/link';
import ClientAvatar from './ClientAvatar';
import type { EnhancedClient } from '@/lib/types';

interface ClientCardProps {
  client: EnhancedClient;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') {
    return (
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: 4,
        background: 'rgba(74,124,89,0.1)',
        color: '#4a7c59',
      }}>
        Activo
      </span>
    );
  }

  return (
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      padding: '4px 10px',
      borderRadius: 4,
      background: 'rgba(184,134,11,0.1)',
      color: '#b8860b',
    }}>
      Pendiente
    </span>
  );
}

function formatPrice(cents: number, cycle: string): string {
  const amount = `€${(cents / 100).toFixed(0)}`;
  return cycle === 'monthly' ? `${amount}/mes` : amount;
}

export default function ClientCard({ client }: ClientCardProps) {
  const totalPlans = client.active_nutrition_plans_count + client.active_exercise_plans_count;

  let plansText = 'Sin planes';
  if (totalPlans === 1) {
    if (client.active_nutrition_plans_count === 1) {
      plansText = '1 plan de nutrición';
    } else {
      plansText = '1 plan de ejercicio';
    }
  } else if (totalPlans > 1) {
    plansText = `${totalPlans} planes activos`;
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid rgba(139,115,85,0.12)',
      borderRadius: 8,
      padding: 20,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 20,
    }}>
      {/* Left side */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flex: 1, minWidth: 0 }}>
        <ClientAvatar name={client.client_display_name} size={48} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--nc-ink)',
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {client.client_display_name}
          </div>

          <div style={{
            fontSize: 13,
            color: 'var(--nc-stone)',
            marginBottom: 6,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {client.client_email}
          </div>

          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--nc-stone)' }}>
            <span>
              🎯 {client.client_goal || 'Sin objetivo definido'}
            </span>
            <span>•</span>
            <span>{plansText}</span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexShrink: 0,
      }}>
        <div style={{ textAlign: 'right' }}>
          <StatusBadge status={client.status} />
          <div style={{
            fontSize: 12,
            color: 'var(--nc-stone)',
            marginTop: 6,
          }}>
            {client.package_name} · {formatPrice(client.package_price_cents, client.package_billing_type)}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href={`/dashboard/clients/${client.client_id}`}
            style={{
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--nc-terra)',
              textDecoration: 'none',
              border: '1px solid rgba(196,98,45,0.3)',
              borderRadius: 6,
              background: 'rgba(196,98,45,0.05)',
              whiteSpace: 'nowrap',
            }}
          >
            Ver cliente
          </Link>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              style={{
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--nc-forest)',
                border: '1px solid rgba(74,124,89,0.3)',
                borderRadius: 6,
                background: 'rgba(74,124,89,0.05)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              onClick={(e) => {
                // TODO: implement dropdown menu
                alert('Menú de planes: Nutrición / Ejercicio');
              }}
            >
              Crear plan
            </button>
          </div>

          <button
            disabled
            title="Próximamente (Slice 7)"
            style={{
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--nc-stone)',
              border: '1px solid rgba(139,115,85,0.2)',
              borderRadius: 6,
              background: 'rgba(139,115,85,0.05)',
              cursor: 'not-allowed',
              opacity: 0.5,
              whiteSpace: 'nowrap',
            }}
          >
            Mensaje
          </button>
        </div>
      </div>
    </div>
  );
}
