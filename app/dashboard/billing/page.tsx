// frontend/app/dashboard/billing/page.tsx
'use client';

import { useNutritionistRelationships, useNutritionistWaitlist, subscribeToTier, openBillingPortal } from '@/lib/hiring';
import { useMyProfile } from '@/lib/profile';
import { timeSince } from '@/lib/utils';
import { useState } from 'react';

function statusLabel(status: string): { text: string; color: string } {
  switch (status) {
    case 'active': return { text: 'Active', color: '#4a7c59' };
    case 'pending_intro': return { text: 'Awaiting intro', color: '#b8860b' };
    case 'cancelled': return { text: 'Cancelled', color: '#b94a3a' };
    default: return { text: status, color: 'var(--nc-stone)' };
  }
}

const tierMax: Record<string, number | string> = { free: 5, pro: 25, premium: '∞' };

export default function BillingPage() {
  const { relationships, isLoading } = useNutritionistRelationships();
  const { waitlist } = useNutritionistWaitlist();
  const { profile } = useMyProfile();
  const [subscribing, setSubscribing] = useState(false);
  const [portaling, setPortaling] = useState(false);

  async function handleSubscribe(tier: 'pro' | 'premium') {
    setSubscribing(true);
    try {
      const url = await subscribeToTier(tier);
      window.location.href = url;
    } catch {
      setSubscribing(false);
      alert('Failed to start subscription checkout. Please try again.');
    }
  }

  async function handleBillingPortal() {
    setPortaling(true);
    try {
      const url = await openBillingPortal();
      window.location.href = url;
    } catch {
      setPortaling(false);
      alert('Failed to open billing portal. Please try again.');
    }
  }

  const currentTier = profile?.tier ?? 'free';
  const activeCount = relationships.filter(r => r.status === 'active').length;

  return (
    <div style={{ maxWidth: 720, padding: '32px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--nc-ink)', marginBottom: 8, fontWeight: 400 }}>
        Billing & Plan
      </h1>
      <p style={{ color: 'var(--nc-stone)', fontSize: 14, marginBottom: 32, fontWeight: 300 }}>
        Manage your subscription tier and view client relationships.
      </p>

      {/* Current plan */}
      <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.15)', borderRadius: 8, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nc-ink)', marginBottom: 8 }}>Current plan</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--nc-terra)', marginBottom: 12, textTransform: 'capitalize' }}>
          {currentTier}
        </div>
        {currentTier === 'free' ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleSubscribe('pro')}
              className="nc-btn-contact"
              style={{ fontSize: 13 }}
              disabled={subscribing}
            >
              {subscribing ? 'Redirecting…' : 'Upgrade to Pro (€29/mo)'}
            </button>
            <button
              onClick={() => handleSubscribe('premium')}
              className="nc-btn-contact"
              style={{ fontSize: 13 }}
              disabled={subscribing}
            >
              {subscribing ? 'Redirecting…' : 'Upgrade to Premium (€59/mo)'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleBillingPortal}
            className="nc-btn-contact"
            style={{ fontSize: 13 }}
            disabled={portaling}
          >
            {portaling ? 'Redirecting…' : 'Manage subscription'}
          </button>
        )}

        {/* 2a: Compact upgrade card for free tier */}
        {currentTier === 'free' && (
          <div style={{ background: 'rgba(196,98,45,0.06)', border: '1px solid rgba(196,98,45,0.2)', borderRadius: 8, padding: '16px 20px', marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--nc-ink)' }}>Unlock more clients</div>
              <div style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300 }}>Pro: 25 clients · €29/mo  |  Premium: unlimited · €59/mo</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleSubscribe('pro')} disabled={subscribing} style={{ fontSize: 12, padding: '6px 14px', border: '1px solid var(--nc-terra)', borderRadius: 6, background: 'transparent', color: 'var(--nc-terra)', cursor: 'pointer' }}>
                Pro
              </button>
              <button onClick={() => handleSubscribe('premium')} disabled={subscribing} style={{ fontSize: 12, padding: '6px 14px', border: '1px solid var(--nc-terra)', borderRadius: 6, background: 'var(--nc-terra)', color: 'white', cursor: 'pointer' }}>
                Premium
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2b: Client list with richer info */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--nc-ink)', fontWeight: 400, margin: 0 }}>
          All clients
        </h2>
        <span style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300 }}>
          {activeCount} / {tierMax[currentTier]} activos
        </span>
      </div>

      {isLoading ? (
        <div style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>Loading…</div>
      ) : relationships.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 8, padding: 24, color: 'var(--nc-stone)', fontWeight: 300, textAlign: 'center' }}>
          No clients yet. Share your profile to get started.
        </div>
      ) : (
        relationships.map((rel) => {
          const { text, color } = statusLabel(rel.status);
          return (
            <div key={rel.id} style={{
              background: 'white',
              border: '1px solid rgba(139,115,85,0.12)',
              borderRadius: 8,
              padding: '16px 20px',
              marginBottom: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nc-ink)', marginBottom: 2 }}>
                  {rel.client_display_name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300 }}>
                  {rel.client_email} · Connected {timeSince(rel.created_at)} ago
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color, padding: '2px 8px', borderRadius: 4, background: `${color}18`, whiteSpace: 'nowrap' }}>
                {text}
              </span>
            </div>
          );
        })
      )}

      {/* 2c: Waitlist section */}
      {waitlist.length > 0 && (
        <div style={{ marginTop: 24, padding: '16px 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--nc-ink)', marginBottom: 12 }}>
            Lista de espera ({waitlist.length})
          </div>
          {waitlist.map(entry => (
            <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: 13, color: 'var(--nc-ink)' }}>{entry.client_display_name}</span>
              <span style={{ fontSize: 12, color: 'var(--nc-stone)' }}>esperando {timeSince(entry.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
