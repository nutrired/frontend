// frontend/app/dashboard/components/UpcomingAppointments.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUpcomingAppointments } from '@/lib/calendar';
import { cancelAppointment } from '@/lib/calendar';

export function UpcomingAppointments() {
  const t = useTranslations('dashboard.home');
  const { appointments, isLoading } = useUpcomingAppointments(5);
  const [canceling, setCanceling] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!confirm(t('confirm_cancel'))) return;

    setCanceling(id);
    try {
      await cancelAppointment(id, t('cancel_reason'));
      // SWR will auto-revalidate
    } catch (err: any) {
      alert(err.message || t('error_cancel'));
    } finally {
      setCanceling(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid var(--nc-border)',
        borderRadius: 10,
        padding: '20px 24px',
      }}>
        <div style={{ fontSize: 13, color: 'var(--nc-stone)' }}>{t('loading_appointments')}</div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid var(--nc-border)',
        borderRadius: 10,
        padding: '20px 24px',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nc-ink)', marginBottom: 12 }}>
          {t('upcoming_appointments_title')}
        </div>
        <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>
          {t('no_appointments_scheduled')}{' '}
          <Link href="/dashboard/calendar" style={{ color: 'var(--nc-terra)', textDecoration: 'none' }}>
            {t('book_appointment_link')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--nc-border)',
      borderRadius: 10,
      padding: '20px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nc-ink)' }}>
          {t('upcoming_appointments_title')}
        </div>
        <Link href="/dashboard/calendar" style={{ fontSize: 12, color: 'var(--nc-terra)', textDecoration: 'none', fontWeight: 500 }}>
          {t('view_all_appointments')}
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {appointments.map((appt) => {
          const startDate = new Date(appt.start_time);
          const countdown = formatDistanceToNow(startDate, { locale: es, addSuffix: true });
          const isWithin24h = appt.hours_until < 24;

          return (
            <div
              key={appt.id}
              style={{
                border: '1px solid rgba(139,115,85,0.15)',
                borderRadius: 8,
                padding: '14px 16px',
                background: isWithin24h ? 'rgba(217,120,72,0.04)' : 'rgba(26,51,41,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--nc-ink)', marginBottom: 4 }}>
                    {appt.appointment_type}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300, marginBottom: 4 }}>
                    {t('with')} {appt.nutritionist_name}
                  </div>
                </div>
                {isWithin24h && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--nc-terra)',
                    background: 'rgba(217,120,72,0.12)',
                    padding: '3px 8px',
                    borderRadius: 20,
                  }}>
                    {t('next_soon')}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300 }}>
                  📅 {format(startDate, "EEEE, d 'de' MMMM", { locale: es })}
                </div>
                <div style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300 }}>
                  🕒 {format(startDate, 'HH:mm')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(139,115,85,0.1)' }}>
                <div style={{ fontSize: 11, color: 'var(--nc-terra)', fontWeight: 500 }}>
                  {countdown}
                </div>
                {appt.can_cancel ? (
                  <button
                    onClick={() => handleCancel(appt.id)}
                    disabled={canceling === appt.id}
                    style={{
                      fontSize: 11,
                      color: 'var(--nc-stone)',
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontWeight: 500,
                    }}
                  >
                    {canceling === appt.id ? t('canceling') : t('cancel_appointment')}
                  </button>
                ) : (
                  <div style={{ fontSize: 10, color: 'var(--nc-stone)', fontWeight: 300, fontStyle: 'italic' }}>
                    {t('cannot_cancel_within_24h')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
