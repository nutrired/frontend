'use client';
// frontend/app/dashboard/calendar/page.tsx

import { useAuth } from '@/lib/auth';
import { useCalendar, cancelAppointment, completeAppointment, markNoShow } from '@/lib/calendar';
import { format, startOfWeek, endOfWeek, addWeeks, isSameDay, parseISO, isSameWeek } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useState } from 'react';
import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { Appointment } from '@/lib/types';
import { SeriesDetailModal } from './components/SeriesDetailModal';
import { toastError, toastWarning } from '@/lib/toast';

export default function CalendarPage() {
  const { user } = useAuth();
  const t = useTranslations('dashboard.calendar');
  const locale = useLocale();
  const dateFnsLocale = locale === 'es' ? es : enUS;

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);
  const [selectedSeriesId, setSelectedSeriesId] = useState('');

  const today = new Date();
  const currentWeekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
  const weekStart = currentWeekStart;
  const weekEnd = endOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
  const isCurrentWeek = isSameWeek(currentWeekStart, today, { weekStartsOn: 1 });

  const { appointments, isLoading, mutate } = useCalendar(
    weekStart.toISOString(),
    weekEnd.toISOString()
  );

  // Format week range display
  const weekRangeText = `${format(weekStart, 'd MMM', { locale: dateFnsLocale })} - ${format(weekEnd, 'd MMM yyyy', { locale: dateFnsLocale })}`;

  const handleViewSeries = (seriesId: string) => {
    setSelectedSeriesId(seriesId);
    setSeriesModalOpen(true);
  };

  if (!user) return null;

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">{t('title')}</div>
        <div className="dash-topbar-right">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* Week navigation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'white',
              border: '1px solid var(--nc-border)',
              borderRadius: 8,
              padding: '4px 6px',
            }}>
              <button
                onClick={() => setWeekOffset(weekOffset - 1)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  fontSize: 16,
                  color: 'var(--nc-stone)',
                  borderRadius: 4,
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--nc-forest-pale)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                ←
              </button>
              <div style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--nc-ink)',
                minWidth: 140,
                textAlign: 'center',
                padding: '0 8px',
              }}>
                {weekRangeText}
              </div>
              <button
                onClick={() => setWeekOffset(weekOffset + 1)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  fontSize: 16,
                  color: 'var(--nc-stone)',
                  borderRadius: 4,
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--nc-forest-pale)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                →
              </button>
            </div>

            {/* Today button - more prominent when away from current week */}
            {!isCurrentWeek && (
              <button
                onClick={() => setWeekOffset(0)}
                style={{
                  background: 'var(--nc-forest)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#1A3329';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'var(--nc-forest)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {t('today_button')}
              </button>
            )}

            {/* Action button */}
            {user.role === 'client' && (
              <Link href={`/${locale}/dashboard/my-nutritionist`} className="dash-btn-publish">
                {t('book_appointment')}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="dash-content">
        {isLoading ? (
          <div style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>{t('loading')}</div>
        ) : user.role === 'nutritionist' ? (
          <NutritionistWeekView appointments={appointments} weekStart={weekStart} onAppointmentClick={setSelectedAppointment} onViewSeries={handleViewSeries} dateFnsLocale={dateFnsLocale} t={t} />
        ) : (
          <ClientListView appointments={appointments} onAppointmentClick={setSelectedAppointment} dateFnsLocale={dateFnsLocale} t={t} />
        )}
      </div>

      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          isNutritionist={user.role === 'nutritionist'}
          onClose={() => setSelectedAppointment(null)}
          locale={locale}
          dateFnsLocale={dateFnsLocale}
          t={t}
        />
      )}

      <SeriesDetailModal
        open={seriesModalOpen}
        onClose={() => setSeriesModalOpen(false)}
        seriesId={selectedSeriesId}
        onSuccess={() => {
          mutate();
        }}
      />
    </>
  );
}

interface WeekViewProps {
  appointments: Appointment[];
  weekStart: Date;
  onAppointmentClick: (appointment: Appointment) => void;
  onViewSeries?: (seriesId: string) => void;
  dateFnsLocale: any;
  t: any;
}

function NutritionistWeekView({ appointments, weekStart, onAppointmentClick, onViewSeries, dateFnsLocale, t }: WeekViewProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8am - 8pm
  const HOUR_HEIGHT = 80; // pixels per hour

  return (
    <div style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60px repeat(7, 1fr)',
        gap: 1,
        background: 'var(--nc-border)',
        border: '1px solid var(--nc-border)',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        overflow: 'hidden',
      }}>
        <div style={{ background: 'white', padding: '12px 8px' }} />
        {days.map((day, i) => (
          <div key={i} style={{
            background: 'var(--nc-forest-pale)',
            padding: '12px 8px',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 500,
          }}>
            {format(day, 'EEE dd', { locale: dateFnsLocale })}
          </div>
        ))}
      </div>

      {/* Grid with time slots */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60px repeat(7, 1fr)',
        border: '1px solid var(--nc-border)',
        borderTop: 'none',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Hour rows */}
        {hours.map((hour, hourIndex) => (
          <React.Fragment key={`hour-${hour}`}>
            {/* Time label */}
            <div style={{
              background: 'white',
              padding: '8px',
              fontSize: 12,
              color: 'var(--nc-stone)',
              textAlign: 'right',
              height: HOUR_HEIGHT,
              borderTop: hourIndex > 0 ? '1px solid var(--nc-border)' : 'none',
            }}>
              {hour}:00
            </div>
            {/* Day columns */}
            {days.map((day, dayIndex) => (
              <div key={`cell-${hour}-${dayIndex}`} style={{
                background: 'white',
                height: HOUR_HEIGHT,
                borderLeft: '1px solid var(--nc-border)',
                borderTop: hourIndex > 0 ? '1px solid var(--nc-border)' : 'none',
                position: 'relative',
              }} />
            ))}
          </React.Fragment>
        ))}

        {/* Appointments positioned absolutely */}
        {days.map((day, dayIndex) => {
          const dayAppointments = appointments.filter((a: Appointment) => {
            const apptDate = new Date(a.start_time);
            return apptDate.toDateString() === day.toDateString();
          });

          return dayAppointments.map((appt: Appointment) => {
            const start = new Date(appt.start_time);
            const end = new Date(appt.end_time);
            const startHour = start.getHours();
            const startMinute = start.getMinutes();
            const durationMs = end.getTime() - start.getTime();
            const durationHours = durationMs / (1000 * 60 * 60);

            // Calculate position from 8am
            const topOffset = ((startHour - 8) * HOUR_HEIGHT) + ((startMinute / 60) * HOUR_HEIGHT);
            const height = durationHours * HOUR_HEIGHT;

            // Calculate left position (60px for time column + dayIndex * column width)
            const leftOffset = 61 + (dayIndex * (100 / 7)); // Approximate column positioning

            return (
              <div key={appt.id} style={{
                position: 'absolute',
                top: topOffset,
                left: `calc(60px + ${dayIndex} * (100% - 60px) / 7 + 2px)`,
                width: `calc((100% - 60px) / 7 - 4px)`,
                height: height - 4,
                padding: 4,
                zIndex: 2,
              }}>
                <AppointmentCard appointment={appt} isNutritionist={true} onClick={() => onAppointmentClick(appt)} onViewSeries={onViewSeries} t={t} />
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}

interface ListViewProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  dateFnsLocale: any;
  t: any;
}

function ClientListView({ appointments, onAppointmentClick, dateFnsLocale, t }: ListViewProps) {
  if (appointments.length === 0) {
    return (
      <div style={{
        background: 'var(--nc-forest-pale)',
        border: '1px solid rgba(26,51,41,0.12)',
        borderRadius: 10,
        padding: '32px 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--nc-forest)', marginBottom: 8 }}>
          {t('no_appointments')}
        </div>
        <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>
          {t('no_appointments_desc')}
        </div>
      </div>
    );
  }

  // Group appointments by date
  const sortedAppointments = [...appointments].sort((a, b) =>
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const groupedByDate: { [key: string]: Appointment[] } = {};
  sortedAppointments.forEach(appt => {
    const dateKey = format(parseISO(appt.start_time), 'yyyy-MM-dd');
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(appt);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {Object.entries(groupedByDate).map(([dateKey, dayAppointments]) => {
        const firstApptDate = parseISO(dayAppointments[0].start_time);
        const isToday = isSameDay(firstApptDate, new Date());

        return (
          <div key={dateKey}>
            {/* Date header */}
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: isToday ? 'var(--nc-terra)' : 'var(--nc-forest)',
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: '2px solid',
              borderColor: isToday ? 'rgba(217,120,72,0.2)' : 'rgba(26,51,41,0.1)',
            }}>
              {isToday && '🔔 '}
              {format(firstApptDate, "EEEE, d 'de' MMMM", { locale: dateFnsLocale })}
              {isToday && t('today_badge')}
            </div>

            {/* Appointments for this day */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {dayAppointments.map((appt: Appointment) => (
                <div key={appt.id} style={{
                  background: 'white',
                  border: '1px solid var(--nc-border)',
                  borderRadius: 10,
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  cursor: 'pointer',
                }}
                onClick={() => onAppointmentClick(appt)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--nc-ink)' }}>
                        {appt.appointment_type.name}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--nc-terra)', fontWeight: 500 }}>
                        • {format(parseISO(appt.start_time), 'HH:mm')}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--nc-stone)' }}>
                      {t('with')} {appt.nutritionist_name}
                    </div>
                    {appt.notes && (
                      <div style={{ fontSize: 13, color: 'var(--nc-stone)', marginTop: 8, fontStyle: 'italic' }}>
                        {appt.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <StatusBadge status={appt.status} t={t} />
                    {appt.status === 'scheduled' && (
                      <CancelButton appointmentId={appt.id} startTime={appt.start_time} t={t} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface AppointmentCardProps {
  appointment: Appointment;
  isNutritionist: boolean;
  onClick: () => void;
  onViewSeries?: (seriesId: string) => void;
  t?: any;
}

function AppointmentCard({ appointment, isNutritionist, onClick, onViewSeries, t }: AppointmentCardProps) {
  const [showActions, setShowActions] = useState(false);
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);
  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

  return (
    <div
      style={{
        background: appointment.status === 'scheduled' ? 'var(--nc-forest-pale)' : '#f0f0f0',
        border: `2px solid ${appointment.status === 'scheduled' ? 'var(--nc-forest)' : '#ccc'}`,
        borderRadius: 6,
        padding: '6px 8px',
        fontSize: 11,
        cursor: 'pointer',
        position: 'relative',
        height: '100%',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div style={{
        fontWeight: 600,
        fontSize: 12,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: 'var(--nc-forest)',
      }}>
        {isNutritionist ? appointment.client_name : appointment.nutritionist_name}
      </div>
      <div style={{
        fontWeight: 600,
        fontSize: 11,
        color: 'var(--nc-forest)',
        lineHeight: 1.2,
      }}>
        {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
      </div>
      <div style={{
        fontSize: 10,
        color: 'var(--nc-stone)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        lineHeight: 1.3,
      }}>
        {appointment.appointment_type.name} • {durationMinutes}{t?.('duration_minutes') || 'min'}
      </div>
      {appointment.series_id && (
        <span style={{ fontSize: 9, color: 'var(--nc-stone)' }}>{t?.('part_of_series') || '📅 Part of series'}</span>
      )}
      {isNutritionist && showActions && appointment.status === 'scheduled' && (
        <NutritionistActions appointmentId={appointment.id} seriesId={appointment.series_id} onViewSeries={onViewSeries} t={t} />
      )}
    </div>
  );
}

interface NutritionistActionsProps {
  appointmentId: string;
  seriesId?: string;
  onViewSeries?: (seriesId: string) => void;
  t?: any;
}

function NutritionistActions({ appointmentId, seriesId, onViewSeries, t }: NutritionistActionsProps) {
  const [processing, setProcessing] = useState(false);

  const handleComplete = async () => {
    setProcessing(true);
    try {
      await completeAppointment(appointmentId);
    } catch (err) {
      toastError(t?.('error_complete') || 'Error marking as completed');
    } finally {
      setProcessing(false);
    }
  };

  const handleNoShow = async () => {
    if (!window.confirm(t?.('confirm_no_show') || '¿Marcar como no asistido?')) return;
    setProcessing(true);
    try {
      await markNoShow(appointmentId);
    } catch (err) {
      toastError(t?.('error_no_show') || 'Error marking as no-show');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt(t?.('cancel_reason_prompt') || 'Motivo de cancelación:');
    if (!reason) return;
    setProcessing(true);
    try {
      await cancelAppointment(appointmentId, reason);
    } catch (err: any) {
      toastError(err.message || t?.('error_cancel') || 'Error cancelando cita');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: 'white',
      border: '1px solid var(--nc-border)',
      borderRadius: 4,
      marginTop: 2,
      padding: 4,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      zIndex: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      {seriesId && onViewSeries && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewSeries(seriesId);
          }}
          style={{
            padding: '4px 8px',
            fontSize: 11,
            background: '#4a7c59',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          {t?.('view_series') || 'Ver serie'}
        </button>
      )}
      <button
        onClick={handleComplete}
        disabled={processing}
        style={{
          padding: '4px 8px',
          fontSize: 11,
          background: 'var(--nc-forest)',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        {t?.('complete') || 'Completar'}
      </button>
      <button
        onClick={handleNoShow}
        disabled={processing}
        style={{
          padding: '4px 8px',
          fontSize: 11,
          background: 'var(--nc-terra)',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        {t?.('no_show') || 'No asistió'}
      </button>
      <button
        onClick={handleCancel}
        disabled={processing}
        style={{
          padding: '4px 8px',
          fontSize: 11,
          background: '#666',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        {t?.('cancel') || 'Cancelar'}
      </button>
    </div>
  );
}

interface StatusBadgeProps {
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  t?: any;
}

function StatusBadge({ status, t }: StatusBadgeProps) {
  const statusTexts = {
    scheduled: t?.('status_scheduled') || 'Programada',
    completed: t?.('status_completed') || 'Completada',
    cancelled: t?.('status_cancelled') || 'Cancelada',
    no_show: t?.('status_no_show') || 'No asistió',
  };

  const styles = {
    scheduled: { bg: 'var(--nc-forest-pale)', color: 'var(--nc-forest)', text: statusTexts.scheduled },
    completed: { bg: '#f0f0f0', color: 'var(--nc-stone)', text: statusTexts.completed },
    cancelled: { bg: 'rgba(196,98,45,0.08)', color: 'var(--nc-terra)', text: statusTexts.cancelled },
    no_show: { bg: 'rgba(242,172,75,0.12)', color: '#d97706', text: statusTexts.no_show },
  };

  const style = styles[status];

  return (
    <span style={{
      fontSize: 12,
      padding: '4px 8px',
      borderRadius: 4,
      background: style.bg,
      color: style.color,
    }}>
      {style.text}
    </span>
  );
}

interface CancelButtonProps {
  appointmentId: string;
  startTime: string;
  t?: any;
}

function CancelButton({ appointmentId, startTime, t }: CancelButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const hoursUntilAppointment = (new Date(startTime).getTime() - Date.now()) / (1000 * 60 * 60);

  const handleCancel = async () => {
    if (hoursUntilAppointment < 24) {
      if (!window.confirm(t?.('cancel_confirm') || 'Cancelas con menos de 24 horas de antelación. ¿Continuar?')) {
        return;
      }
    }

    setShowModal(true);
  };

  const handleSubmitCancel = async () => {
    if (!reason.trim()) {
      toastWarning(t?.('cancel_reason_required') || 'Por favor indica el motivo de cancelación');
      return;
    }

    setProcessing(true);
    try {
      await cancelAppointment(appointmentId, reason);
      setShowModal(false);
    } catch (err: any) {
      toastError(err.message || (t?.('error_cancel') || 'Error cancelling appointment'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCancel}
        className="dash-btn-plain"
        style={{ fontSize: 12, padding: '4px 12px' }}
      >
        {t?.('cancel_confirm_button') || 'Cancelar cita'}
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            maxWidth: 400,
            width: '90%',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              {t?.('cancel_modal_title') || 'Cancelar cita'}
            </h3>
            <div className="dash-field">
              <label className="dash-label">{t?.('cancel_reason_label') || 'Motivo de cancelación'}</label>
              <textarea
                className="dash-textarea"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder={t?.('cancel_reason_placeholder') || 'Indica el motivo...'}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={handleSubmitCancel}
                disabled={processing}
                className="dash-btn-publish"
                style={{ flex: 1 }}
              >
                {processing ? (t?.('cancel_confirm_button') + '...') || 'Cancelando...' : (t?.('cancel_confirm_button') || 'Confirmar')}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={processing}
                className="dash-btn-plain"
                style={{ flex: 1 }}
              >
                {t?.('close') || 'Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface AppointmentModalProps {
  appointment: Appointment;
  isNutritionist: boolean;
  onClose: () => void;
  locale?: string;
  dateFnsLocale?: any;
  t?: any;
}

function AppointmentModal({ appointment, isNutritionist, onClose, locale, dateFnsLocale, t }: AppointmentModalProps) {
  const [processing, setProcessing] = useState(false);
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);
  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

  const handleComplete = async () => {
    setProcessing(true);
    try {
      await completeAppointment(appointment.id);
      onClose();
    } catch (err) {
      toastError(t?.('error_complete') || 'Error marking as completed');
    } finally {
      setProcessing(false);
    }
  };

  const handleNoShow = async () => {
    if (!window.confirm(t?.('confirm_no_show') || '¿Marcar como no asistido?')) return;
    setProcessing(true);
    try {
      await markNoShow(appointment.id);
      onClose();
    } catch (err) {
      toastError(t?.('error_no_show') || 'Error marking as no-show');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt(t?.('cancel_reason_prompt') || 'Motivo de cancelación:');
    if (!reason) return;
    setProcessing(true);
    try {
      await cancelAppointment(appointment.id, reason);
      onClose();
    } catch (err: any) {
      toastError(err.message || (t?.('error_cancel') || 'Error cancelando cita'));
    } finally {
      setProcessing(false);
    }
  };

  const handleReschedule = () => {
    // TODO: Implement reschedule flow - for now just alert
    toastWarning(t?.('reschedule_message') || 'Función de reprogramación próximamente. Por ahora, cancela y crea una nueva cita.');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          maxWidth: 500,
          width: '90%',
          padding: 32,
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--nc-ink)', marginBottom: 8 }}>
            {appointment.appointment_type.name}
          </div>
          <StatusBadge status={appointment.status} t={t} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--nc-stone)', textTransform: 'uppercase', marginBottom: 4 }}>
              {isNutritionist ? t?.('client') || 'Cliente' : t?.('nutritionist') || 'Nutricionista'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 14, color: 'var(--nc-ink)' }}>
                {isNutritionist ? appointment.client_name : appointment.nutritionist_name}
              </div>
              {isNutritionist && (
                <Link
                  href={`/${locale}/dashboard/clients/${appointment.client_id}`}
                  style={{
                    fontSize: 12,
                    color: 'var(--nc-forest)',
                    textDecoration: 'none',
                    padding: '4px 10px',
                    background: 'var(--nc-forest-pale)',
                    borderRadius: 6,
                    fontWeight: 500,
                  }}
                >
                  Ver perfil →
                </Link>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--nc-stone)', textTransform: 'uppercase', marginBottom: 4 }}>
              {t?.('date_and_time') || 'Fecha y hora'}
            </div>
            <div style={{ fontSize: 14, color: 'var(--nc-ink)' }}>
              {format(startTime, 'PPP', { locale: dateFnsLocale })} • {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')} ({durationMinutes}{t?.('duration_minutes') || 'min'})
            </div>
          </div>

          {appointment.appointment_type.description && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--nc-stone)', textTransform: 'uppercase', marginBottom: 4 }}>
                {t?.('description') || 'Descripción'}
              </div>
              <div style={{ fontSize: 14, color: 'var(--nc-ink)' }}>
                {appointment.appointment_type.description}
              </div>
            </div>
          )}

          {appointment.appointment_type.video_link && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--nc-stone)', textTransform: 'uppercase', marginBottom: 4 }}>
                {t?.('video_link') || 'Enlace de videollamada'}
              </div>
              <a
                href={appointment.appointment_type.video_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 14, color: 'var(--nc-forest)', textDecoration: 'none' }}
              >
                {appointment.appointment_type.video_link}
              </a>
            </div>
          )}

          {appointment.notes && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--nc-stone)', textTransform: 'uppercase', marginBottom: 4 }}>
                {t?.('notes') || 'Notas'}
              </div>
              <div style={{ fontSize: 14, color: 'var(--nc-ink)' }}>
                {appointment.notes}
              </div>
            </div>
          )}

          {appointment.cancellation_reason && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--nc-stone)', textTransform: 'uppercase', marginBottom: 4 }}>
                {t?.('cancellation_reason') || 'Motivo de cancelación'}
              </div>
              <div style={{ fontSize: 14, color: 'var(--nc-ink)' }}>
                {appointment.cancellation_reason}
              </div>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <div style={{ marginBottom: 12 }}>
          <Link href={`/${locale}/dashboard/appointments/${appointment.id}`}>
            <button
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #4a7c59 0%, #5a9268 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(74, 124, 89, 0.25)',
                transition: 'transform 0.1s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {t?.('view_details') || '📋 Ver detalles y notas'}
            </button>
          </Link>
        </div>

        {appointment.status === 'scheduled' && (
          <div style={{ display: 'grid', gridTemplateColumns: isNutritionist ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 12 }}>
            {isNutritionist && (
              <>
                <button
                  onClick={handleComplete}
                  disabled={processing}
                  className="dash-btn-publish"
                >
                  {t?.('complete') || 'Completar'}
                </button>
                <button
                  onClick={handleNoShow}
                  disabled={processing}
                  style={{
                    padding: '10px 16px',
                    background: 'var(--nc-terra)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {t?.('no_show') || 'No asistió'}
                </button>
              </>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: appointment.status === 'scheduled' ? '1fr 1fr' : '1fr', gap: 12 }}>
          {appointment.status === 'scheduled' && (
            <>
              <button
                onClick={handleReschedule}
                disabled={processing}
                style={{
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #4a7c59 0%, #5a9268 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(74, 124, 89, 0.25)',
                  transition: 'transform 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {t?.('reschedule') || '🔄 Reprogramar'}
              </button>
              <button
                onClick={handleCancel}
                disabled={processing}
                style={{
                  padding: '10px 16px',
                  background: 'white',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {t?.('cancel_confirm_button') || 'Cancelar cita'}
              </button>
            </>
          )}
          <button
            onClick={onClose}
            style={{
              gridColumn: appointment.status === 'scheduled' ? '1 / -1' : 'auto',
              padding: '10px 16px',
              background: 'white',
              color: 'var(--nc-stone)',
              border: '1px solid var(--nc-border)',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {t?.('close') || 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
