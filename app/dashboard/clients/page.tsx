// frontend/app/dashboard/clients/page.tsx
'use client';

import Link from 'next/link';
import { useNutritionistRelationships } from '@/lib/hiring';

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') {
    return (
      <span style={{
        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
        background: 'rgba(74,124,89,0.1)', color: '#4a7c59',
      }}>
        Activo
      </span>
    );
  }
  if (status === 'pending_intro') {
    return (
      <span style={{
        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
        background: 'rgba(184,134,11,0.1)', color: '#b8860b',
      }}>
        Pendiente
      </span>
    );
  }
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
      background: 'rgba(139,115,85,0.1)', color: 'var(--nc-stone)',
    }}>
      {status}
    </span>
  );
}

export default function MyClientsPage() {
  const { relationships, isLoading } = useNutritionistRelationships();

  const active = relationships.filter(
    (r) => r.status === 'active' || r.status === 'pending_intro',
  );

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">Mis clientes</div>
      </div>
      <div className="dash-content">
        {isLoading ? (
          <div style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>Cargando…</div>
        ) : active.length === 0 ? (
          <div style={{
            background: 'white', border: '1px solid rgba(139,115,85,0.12)',
            borderRadius: 8, padding: 24, textAlign: 'center',
            color: 'var(--nc-stone)', fontWeight: 300,
          }}>
            No tienes clientes aún. Comparte tu perfil público para empezar.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {active.map((rel) => (
              <div key={rel.id} style={{
                background: 'white',
                border: '1px solid rgba(139,115,85,0.12)',
                borderRadius: 8, padding: '16px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--nc-ink)', marginBottom: 2 }}>
                    {rel.client_display_name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300 }}>
                    {rel.client_email}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <StatusBadge status={rel.status} />
                  <Link
                    href={`/dashboard/clients/${rel.client_id}`}
                    style={{
                      fontSize: 13, color: 'var(--nc-terra)', textDecoration: 'none',
                      fontWeight: 500, whiteSpace: 'nowrap',
                    }}
                  >
                    Ver cliente →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
