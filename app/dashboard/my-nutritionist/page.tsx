// frontend/app/dashboard/my-nutritionist/page.tsx
'use client';

import { useState } from 'react';
import { useMyRelationships, cancelRelationship, requestRefund } from '@/lib/hiring';

function formatPrice(cents: number): string {
  return `€${Math.floor(cents / 100)}`;
}

function statusLabel(status: string): { text: string; color: string } {
  switch (status) {
    case 'active': return { text: 'Active', color: '#4a7c59' };
    case 'pending_intro': return { text: 'Awaiting intro consultation', color: '#b8860b' };
    case 'pending_payment': return { text: 'Pending payment', color: '#b8860b' };
    case 'cancelled': return { text: 'Cancelled', color: '#b94a3a' };
    default: return { text: status, color: 'var(--nc-stone)' };
  }
}

export default function MyNutritionistPage() {
  const { relationships, isLoading } = useMyRelationships();
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [refunding, setRefunding] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [showRefundForm, setShowRefundForm] = useState<string | null>(null);

  const active = relationships.filter(
    (r) => r.status === 'active' || r.status === 'pending_intro',
  );
  const past = relationships.filter(
    (r) => r.status === 'cancelled' || r.status === 'pending_payment',
  );

  async function handleCancel(id: string) {
    if (!confirm('Cancel your subscription? You will keep access until the end of the billing period.')) return;
    setCancelling(id);
    try {
      await cancelRelationship(id);
    } catch {
      alert('Could not cancel subscription. Please try again.');
    } finally {
      setCancelling(null);
    }
  }

  async function handleRefund(id: string) {
    setRefunding(id);
    try {
      const res = await requestRefund(id, refundReason);
      if (res.auto_approved) {
        alert('Refund issued automatically — you should see it within 5–10 business days.');
      } else {
        alert('Refund request submitted. Your nutritionist will review it shortly.');
      }
      setShowRefundForm(null);
      setRefundReason('');
    } catch {
      alert('Could not submit refund request. Please try again.');
    } finally {
      setRefunding(null);
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
      <h1 style={{ fontFamily: 'var(--nc-font-serif)', fontSize: 24, color: 'var(--nc-ink)', marginBottom: 8, fontWeight: 400 }}>
        My Nutritionist
      </h1>
      <p style={{ color: 'var(--nc-stone)', fontSize: 14, marginBottom: 32, fontWeight: 300 }}>
        Manage your active programme and billing.
      </p>

      {active.length === 0 && past.length === 0 && (
        <div style={{ background: 'white', border: '1px solid rgba(139,115,85,0.15)', borderRadius: 8, padding: '24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>You have no active programmes.</p>
          <a href="/nutritionists" className="nc-btn-contact" style={{ display: 'inline-block', marginTop: 16, textDecoration: 'none', fontSize: 13 }}>
            Browse nutritionists
          </a>
        </div>
      )}

      {active.map((rel) => {
        const { text, color } = statusLabel(rel.status);
        const canCancel = rel.billing_type === 'monthly' && rel.status === 'active';
        const canRefund = rel.status === 'active' || rel.status === 'pending_intro';

        return (
          <div key={rel.id} style={{ background: 'white', border: '1px solid rgba(139,115,85,0.15)', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nc-ink)', marginBottom: 4 }}>
                  {rel.billing_type === 'monthly' ? 'Monthly subscription' : 'One-time programme'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300 }}>
                  {formatPrice(rel.amount_cents)}{rel.billing_type === 'monthly' ? '/month' : ' one-time'}
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color, padding: '2px 8px', borderRadius: 4, background: `${color}15` }}>
                {text}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {canCancel && (
                <button
                  onClick={() => handleCancel(rel.id)}
                  disabled={cancelling === rel.id}
                  style={{ fontSize: 12, padding: '6px 14px', border: '1px solid rgba(185,74,58,0.4)', borderRadius: 5, background: 'transparent', color: '#b94a3a', cursor: 'pointer' }}
                >
                  {cancelling === rel.id ? 'Cancelling…' : 'Cancel subscription'}
                </button>
              )}
              {canRefund && showRefundForm !== rel.id && (
                <button
                  onClick={() => { setShowRefundForm(rel.id); setRefundReason(''); }}
                  style={{ fontSize: 12, padding: '6px 14px', border: '1px solid rgba(139,115,85,0.2)', borderRadius: 5, background: 'transparent', color: 'var(--nc-stone)', cursor: 'pointer' }}
                >
                  Request refund
                </button>
              )}
            </div>

            {showRefundForm === rel.id && (
              <div style={{ marginTop: 16, padding: 16, background: 'rgba(245,240,232,0.6)', borderRadius: 6 }}>
                <textarea
                  placeholder="Reason for refund (optional)"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(139,115,85,0.2)', borderRadius: 5, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    onClick={() => handleRefund(rel.id)}
                    disabled={refunding === rel.id}
                    className="nc-btn-contact"
                    style={{ fontSize: 12 }}
                  >
                    {refunding === rel.id ? 'Submitting…' : 'Submit request'}
                  </button>
                  <button
                    onClick={() => { setShowRefundForm(null); setRefundReason(''); }}
                    style={{ fontSize: 12, padding: '6px 14px', border: '1px solid rgba(139,115,85,0.2)', borderRadius: 5, background: 'transparent', color: 'var(--nc-stone)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {past.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--nc-font-serif)', fontSize: 16, color: 'var(--nc-ink)', marginTop: 32, marginBottom: 16, fontWeight: 400 }}>
            Past programmes
          </h2>
          {past.map((rel) => {
            const { text, color } = statusLabel(rel.status);
            return (
              <div key={rel.id} style={{ background: 'white', border: '1px solid rgba(139,115,85,0.1)', borderRadius: 8, padding: '16px 24px', marginBottom: 12, opacity: 0.7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: 'var(--nc-ink)' }}>
                    {rel.billing_type === 'monthly' ? 'Monthly subscription' : 'One-time programme'} — {formatPrice(rel.amount_cents)}
                  </div>
                  <span style={{ fontSize: 11, color }}>{text}</span>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
