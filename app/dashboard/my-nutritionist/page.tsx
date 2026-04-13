// frontend/app/dashboard/my-nutritionist/page.tsx
'use client';

import { useState } from 'react';
import { useMyRelationships, cancelRelationship } from '@/lib/hiring';
import { timeSince } from '../../../lib/utils';

export default function MyNutritionistPage() {
  const { relationships, isLoading } = useMyRelationships();
  const [cancelling, setCancelling] = useState<string | null>(null);

  const active = relationships.filter(
    (r) => r.status === 'active' || r.status === 'pending_intro',
  );
  const past = relationships.filter(
    (r) => r.status === 'cancelled',
  );

  async function handleCancel(id: string) {
    if (!confirm('Cancel your programme? This cannot be undone.')) return;
    setCancelling(id);
    try {
      await cancelRelationship(id);
    } catch {
      alert('Could not cancel programme. Please try again.');
    } finally {
      setCancelling(null);
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: '32px 24px', color: 'var(--nc-stone)', fontWeight: 300 }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, padding: '32px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--nc-ink)', marginBottom: 8, fontWeight: 400 }}>
        My Nutritionist
      </h1>
      <p style={{ color: 'var(--nc-stone)', fontSize: 14, marginBottom: 32, fontWeight: 300 }}>
        Manage your active programme.
      </p>

      {active.length === 0 && past.length === 0 && (
        <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.15)', borderRadius: 8, padding: '24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>You have no active programmes.</p>
          <a href="/nutritionists" className="nc-btn-contact" style={{ display: 'inline-block', marginTop: 16, textDecoration: 'none', fontSize: 13 }}>
            Browse nutritionists
          </a>
        </div>
      )}

      {active.map((rel) => (
        <div key={rel.id} style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 20, marginBottom: 16, background: 'var(--nc-cream)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--nc-ink)' }}>
              {rel.nutritionist_display_name}
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '3px 8px', borderRadius: 100,
              background: rel.nutritionist_tier === 'free' ? 'rgba(139,115,85,0.12)' : 'rgba(74,124,89,0.12)',
              color: rel.nutritionist_tier === 'free' ? 'var(--nc-stone)' : 'var(--nc-forest)' }}>
              {rel.nutritionist_tier}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--nc-stone)', marginBottom: 8 }}>
            {rel.nutritionist_city} · Conectado hace {timeSince(rel.created_at)}
          </div>
          {rel.nutritionist_bio && (
            <p style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300, lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden', marginBottom: 10 }}>
              {rel.nutritionist_bio}
            </p>
          )}
          <div style={{ marginBottom: 10 }}>
            {rel.nutritionist_specialties?.slice(0, 3).map(s => (
              <span key={s} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4,
                background: 'rgba(74,124,89,0.1)', color: 'var(--nc-forest)', marginRight: 4 }}>{s}</span>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--nc-stone)', marginBottom: 12 }}>
            Estado: <strong>{rel.status === 'active' ? 'Activo' : rel.status === 'pending_intro' ? 'Pendiente' : 'Cancelado'}</strong>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href={`/nutritionists/${rel.nutritionist_slug}`} target="_blank"
               style={{ fontSize: 12, color: 'var(--nc-terra)', textDecoration: 'none' }}>
              Ver perfil ↗
            </a>
            {rel.status !== 'cancelled' && (
              <button onClick={() => handleCancel(rel.id)}
                disabled={cancelling === rel.id}
                style={{ fontSize: 12, color: 'var(--nc-stone)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                {cancelling === rel.id ? 'Cancelando…' : 'Cancelar'}
              </button>
            )}
          </div>
        </div>
      ))}

      {past.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--nc-ink)', marginTop: 32, marginBottom: 16, fontWeight: 400 }}>
            Past programmes
          </h2>
          {past.map((rel) => (
            <div key={rel.id} style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 20, marginBottom: 16, background: 'var(--nc-cream)', opacity: 0.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--nc-ink)' }}>
                  {rel.nutritionist_display_name}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '3px 8px', borderRadius: 100,
                  background: 'rgba(185,74,58,0.1)', color: '#b94a3a' }}>
                  Cancelado
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--nc-stone)' }}>
                {rel.nutritionist_city} · Finalizado {new Date(rel.updated_at).toLocaleDateString('es-ES')}
              </div>
              <div style={{ marginTop: 8 }}>
                <a href={`/nutritionists/${rel.nutritionist_slug}`} target="_blank"
                   style={{ fontSize: 12, color: 'var(--nc-terra)', textDecoration: 'none' }}>
                  Ver perfil ↗
                </a>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
