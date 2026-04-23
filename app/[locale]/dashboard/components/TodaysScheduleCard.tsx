// frontend/app/[locale]/dashboard/components/TodaysScheduleCard.tsx
'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import type { AppointmentSummary } from '@/lib/types';

interface TodaysScheduleCardProps {
  appointments: AppointmentSummary[];
  isLoading: boolean;
}

export function TodaysScheduleCard({ appointments, isLoading }: TodaysScheduleCardProps) {
  const t = useTranslations('dashboard.home');
  const locale = useLocale();

  if (isLoading) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid var(--nc-border)',
        borderRadius: 10,
        padding: '20px 24px',
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--nc-ink)', marginBottom: 16 }}>
          {t('todays_schedule')}
        </div>
        <div style={{ color: 'var(--nc-stone)', fontSize: 13, fontWeight: 300 }}>
          {t('loading')}
        </div>
      </div>
    );
  }

  // Handle undefined/null appointments
  const safeAppointments = appointments || [];

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--nc-border)',
      borderRadius: 10,
      padding: '20px 24px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--nc-ink)' }}>
          {t('todays_schedule')}
        </div>
        <Link
          href={`/${locale}/dashboard/calendar`}
          style={{
            fontSize: 12,
            color: 'var(--nc-terra)',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          {t('view_calendar')}
        </Link>
      </div>

      {/* Appointments list or empty state */}
      {safeAppointments.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--nc-stone)',
          fontSize: 13,
          fontWeight: 300,
        }}>
          📅 {t('no_appointments_today')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {safeAppointments.map((appt) => {
            const startTime = new Date(appt.start_time);
            const timeStr = startTime.toLocaleTimeString(locale, {
              hour: '2-digit',
              minute: '2-digit',
            });

            // Calculate relative date
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const apptDate = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
            const diffDays = Math.round((apptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            let dateLabel;
            if (diffDays === 0) {
              dateLabel = t('today');
            } else if (diffDays === 1) {
              dateLabel = t('tomorrow');
            } else {
              dateLabel = startTime.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
            }

            return (
              <div
                key={appt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '12px 16px',
                  border: '1px solid var(--nc-border)',
                  borderRadius: 8,
                  background: 'var(--nc-cream)',
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 80,
                }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--nc-stone)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}>
                    {dateLabel}
                  </div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--nc-forest)',
                    marginTop: 2,
                  }}>
                    {timeStr}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <Link
                    href={`/${locale}/dashboard/clients/${appt.client_id}`}
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--nc-ink)',
                      textDecoration: 'none',
                    }}
                  >
                    {appt.client_name}
                  </Link>
                  <div style={{
                    fontSize: 12,
                    color: 'var(--nc-stone)',
                    marginTop: 2,
                  }}>
                    {appt.appointment_type_name} · {appt.duration_minutes} min
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 4,
                    background: appt.status === 'confirmed'
                      ? 'rgba(74,124,89,0.1)'
                      : 'rgba(184,134,11,0.1)',
                    color: appt.status === 'confirmed'
                      ? '#4a7c59'
                      : '#b8860b',
                  }}
                >
                  {appt.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
