// frontend/app/dashboard/billing/page.tsx
'use client';

import { useState } from 'react';
import { useEarnings, useNutritionistRelationships, startStripeConnect } from '@/lib/hiring';
import { useMyProfile } from '@/lib/profile';

function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

function statusLabel(status: string): { text: string; color: string } {
  switch (status) {
    case 'active': return { text: 'Active', color: '#4a7c59' };
    case 'pending_intro': return { text: 'Awaiting intro', color: '#b8860b' };
    case 'cancelled': return { text: 'Cancelled', color: '#b94a3a' };
    default: return { text: status, color: 'var(--nc-stone)' };
  }
}

export default function BillingPage() {
  const { earnings, isLoading: earningsLoading } = useEarnings();
  const { relationships } = useNutritionistRelationships();
  const { profile } = useMyProfile();
  const [connectingStripe, setConnectingStripe] = useState(false);

  async function handleStripeConnect() {
    setConnectingStripe(true);
    try {
      const url = await startStripeConnect();
      window.location.href = url;
    } catch {
      setConnectingStripe(false);
      alert('Failed to start Stripe onboarding. Please try again.');
    }
  }

  const isConnected = Boolean(profile?.stripe_connect_account_id);

  return (
    <div style={{ maxWidth: 720, padding: '32px 24px' }}>
      <h1 style={{ fontFamily: 'var(--nc-font-serif)', fontSize: 24, color: 'var(--nc-ink)', marginBottom: 8, fontWeight: 400 }}>
        Billing & Earnings
      </h1>
      <p style={{ color: 'var(--nc-stone)', fontSize: 14, marginBottom: 32, fontWeight: 300 }}>
        Overview of your earnings, active clients, and payout setup.
      </p>

      {/* Stripe Connect status */}
      <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.15)', borderRadius: 8, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nc-ink)', marginBottom: 8 }}>Stripe payouts</div>
        {isConnected ? (
          <div style={{ fontSize: 13, color: '#4a7c59', fontWeight: 500 }}>
            ✓ Account connected — payouts are active
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 13, color: 'var(--nc-stone)', marginBottom: 12, fontWeight: 300 }}>
              Connect a Stripe account to receive client payments directly.
            </p>
            <button
              onClick={handleStripeConnect}
              className="nc-btn-contact"
              style={{ fontSize: 13 }}
              disabled={connectingStripe}
            >
              {connectingStripe ? 'Redirecting to Stripe…' : 'Connect with Stripe'}
            </button>
          </div>
        )}
      </div>

      {/* Earnings stats */}
      {earningsLoading ? (
        <div style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>Loading…</div>
      ) : earnings ? (
        <>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Total earned (net)', value: formatPrice(earnings.total_earned_cents) },
              { label: 'Platform commission', value: formatPrice(earnings.total_commission_cents) },
              { label: 'Active clients', value: String(earnings.active_client_count) },
            ].map(({ label, value }) => (
              <div key={label} style={{
                flex: 1, minWidth: 160,
                background: 'white',
                border: '1px solid rgba(139,115,85,0.15)',
                borderRadius: 8,
                padding: '16px 20px',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--nc-stone)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  {label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--nc-terra)' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Client list */}
          <h2 style={{ fontFamily: 'var(--nc-font-serif)', fontSize: 16, color: 'var(--nc-ink)', marginBottom: 16, fontWeight: 400 }}>
            All clients
          </h2>

          {relationships.length === 0 ? (
            <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.12)', borderRadius: 8, padding: 24, color: 'var(--nc-stone)', fontWeight: 300, textAlign: 'center' }}>
              No clients yet. Share your profile to start earning.
            </div>
          ) : (
            relationships.map((rel) => {
              const { text, color } = statusLabel(rel.status);
              const net = rel.amount_cents - rel.commission_cents;
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
                    <div style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300, marginBottom: 2 }}>
                      {rel.billing_type === 'monthly' ? 'Monthly' : 'One-time'} · started {new Date(rel.created_at).toLocaleDateString('es-ES')}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--nc-ink)', fontWeight: 500 }}>
                      {formatPrice(net)} net (of {formatPrice(rel.amount_cents)})
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color, padding: '2px 8px', borderRadius: 4, background: `${color}18` }}>
                    {text}
                  </span>
                </div>
              );
            })
          )}
        </>
      ) : null}
    </div>
  );
}
