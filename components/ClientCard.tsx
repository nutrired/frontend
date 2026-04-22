// frontend/components/ClientCard.tsx
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Avatar } from './Avatar';
import type { EnhancedClient } from '@/lib/types';

interface ClientCardProps {
  client: EnhancedClient;
}

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const styles: Record<string, { bg: string; color: string; labelKey: string }> = {
    pending_intro: { bg: 'rgba(184,134,11,0.1)', color: '#b8860b', labelKey: 'status_pending' },
    active: { bg: 'rgba(74,124,89,0.1)', color: '#4a7c59', labelKey: 'status_active' },
    completed: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', labelKey: 'status_completed' },
    cancelled: { bg: 'rgba(139,115,85,0.1)', color: 'var(--nc-stone)', labelKey: 'status_cancelled' },
  };

  const s = styles[status] || styles.pending_intro;

  return (
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      padding: '4px 10px',
      borderRadius: 4,
      background: s.bg,
      color: s.color,
    }}>
      {t(s.labelKey)}
    </span>
  );
}

function formatPrice(cents: number, cycle: string, t: (key: string) => string): string {
  const amount = `€${(cents / 100).toFixed(0)}`;
  return cycle === 'monthly' ? `${amount}${t('price_per_month')}` : amount;
}

export default function ClientCard({ client }: ClientCardProps) {
  const t = useTranslations('dashboard.clients');
  const locale = useLocale();
  const totalPlans = client.active_nutrition_plans_count + client.active_exercise_plans_count;

  let plansText = t('plans_none');
  if (totalPlans === 1) {
    if (client.active_nutrition_plans_count === 1) {
      plansText = t('plans_nutrition_one');
    } else {
      plansText = t('plans_exercise_one');
    }
  } else if (totalPlans > 1) {
    plansText = t('plans_multiple', { count: totalPlans });
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
        <Avatar
          avatarUrl={client.client_avatar_url}
          displayName={client.client_display_name}
          size="small"
        />

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
              🎯 {client.client_goal || t('goal_none')}
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
          <StatusBadge status={client.status} t={t} />
          <div style={{
            fontSize: 12,
            color: 'var(--nc-stone)',
            marginTop: 6,
          }}>
            {client.package_name} · {formatPrice(client.package_price_cents, client.package_billing_type, t)}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href={`/${locale}/dashboard/clients/${client.client_id}`}
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
            {t('action_view_client')}
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
                alert(t('alert_create_plan_menu'));
              }}
            >
              {t('action_create_plan')}
            </button>
          </div>

          <button
            disabled
            title={t('action_message_disabled')}
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
            {t('action_message')}
          </button>
        </div>
      </div>
    </div>
  );
}
