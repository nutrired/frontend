'use client';
// frontend/app/dashboard/calendar/page.tsx

import { useAuth } from '@/lib/auth';
import { useCalendar, cancelAppointment, completeAppointment, markNoShow } from '@/lib/calendar';
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { useState } from 'react';
import React from 'react';
import Link from 'next/link';
import type { Appointment } from '@/lib/types';

export default function CalendarPage() {
  const { user } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });

  const { appointments, isLoading } = useCalendar(
    weekStart.toISOString(),
    weekEnd.toISOString()
  );

  if (!user) return null;

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">Calendario</div>
        <div className="dash-topbar-right">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="dash-btn-plain"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="dash-btn-plain"
            >
              Hoy
            </button>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="dash-btn-plain"
            >
              Siguiente →
            </button>
            {user.role === 'client' && (
              <Link href="/dashboard/my-nutritionist" className="dash-btn-publish">
                Agendar Cita
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="dash-content">
        {isLoading ? (
          <div style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>Cargando calendario...</div>
        ) : user.role === 'nutritionist' ? (
          <NutritionistWeekView appointments={appointments} weekStart={weekStart} />
        ) : (
          <ClientListView appointments={appointments} />
        )}
      </div>
    </>
  );
}

interface WeekViewProps {
  appointments: Appointment[];
  weekStart: Date;
}

function NutritionistWeekView({ appointments, weekStart }: WeekViewProps) {
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
            {format(day, 'EEE dd')}
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
                <AppointmentCard appointment={appt} isNutritionist={true} />
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
}

function ClientListView({ appointments }: ListViewProps) {
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
          No tienes citas programadas
        </div>
        <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>
          Contacta con tu nutricionista para agendar una cita.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {appointments.map((appt: Appointment) => (
        <div key={appt.id} style={{
          background: 'white',
          border: '1px solid var(--nc-border)',
          borderRadius: 10,
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--nc-ink)', marginBottom: 4 }}>
              {appt.appointment_type.name}
            </div>
            <div style={{ fontSize: 14, color: 'var(--nc-stone)', marginBottom: 8 }}>
              {format(new Date(appt.start_time), 'PPP')} • {format(new Date(appt.start_time), 'HH:mm')}
            </div>
            <div style={{ fontSize: 13, color: 'var(--nc-stone)' }}>
              Con: {appt.nutritionist_name}
            </div>
            {appt.notes && (
              <div style={{ fontSize: 13, color: 'var(--nc-stone)', marginTop: 8 }}>
                {appt.notes}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <StatusBadge status={appt.status} />
            {appt.status === 'scheduled' && (
              <CancelButton appointmentId={appt.id} startTime={appt.start_time} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface AppointmentCardProps {
  appointment: Appointment;
  isNutritionist: boolean;
}

function AppointmentCard({ appointment, isNutritionist }: AppointmentCardProps) {
  const [showActions, setShowActions] = useState(false);
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);
  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

  return (
    <div
      style={{
        background: appointment.status === 'scheduled' ? 'var(--nc-forest-pale)' : '#f0f0f0',
        border: `1px solid ${appointment.status === 'scheduled' ? 'var(--nc-forest)' : '#ccc'}`,
        borderRadius: 4,
        padding: '4px 6px',
        fontSize: 11,
        cursor: 'pointer',
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div style={{ fontWeight: 500 }}>
        {isNutritionist ? appointment.client_name : appointment.nutritionist_name}
      </div>
      <div style={{ color: 'var(--nc-stone)' }}>
        {format(startTime, 'HH:mm')}-{format(endTime, 'HH:mm')} ({durationMinutes}min)
      </div>
      <div style={{ fontSize: 10, color: 'var(--nc-stone)' }}>
        {appointment.appointment_type.name}
      </div>
      {isNutritionist && showActions && appointment.status === 'scheduled' && (
        <NutritionistActions appointmentId={appointment.id} />
      )}
    </div>
  );
}

interface NutritionistActionsProps {
  appointmentId: string;
}

function NutritionistActions({ appointmentId }: NutritionistActionsProps) {
  const [processing, setProcessing] = useState(false);

  const handleComplete = async () => {
    setProcessing(true);
    try {
      await completeAppointment(appointmentId);
    } catch (err) {
      alert('Error marking as completed');
    } finally {
      setProcessing(false);
    }
  };

  const handleNoShow = async () => {
    if (!window.confirm('¿Marcar como no asistido?')) return;
    setProcessing(true);
    try {
      await markNoShow(appointmentId);
    } catch (err) {
      alert('Error marking as no-show');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt('Motivo de cancelación:');
    if (!reason) return;
    setProcessing(true);
    try {
      await cancelAppointment(appointmentId, reason);
    } catch (err: any) {
      alert(err.message || 'Error cancelando cita');
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
        Completar
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
        No asistió
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
        Cancelar
      </button>
    </div>
  );
}

interface StatusBadgeProps {
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
}

function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    scheduled: { bg: 'var(--nc-forest-pale)', color: 'var(--nc-forest)', text: 'Programada' },
    completed: { bg: '#f0f0f0', color: 'var(--nc-stone)', text: 'Completada' },
    cancelled: { bg: 'rgba(196,98,45,0.08)', color: 'var(--nc-terra)', text: 'Cancelada' },
    no_show: { bg: 'rgba(242,172,75,0.12)', color: '#d97706', text: 'No asistió' },
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
}

function CancelButton({ appointmentId, startTime }: CancelButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const hoursUntilAppointment = (new Date(startTime).getTime() - Date.now()) / (1000 * 60 * 60);

  const handleCancel = async () => {
    if (hoursUntilAppointment < 24) {
      if (!window.confirm('Cancelas con menos de 24 horas de antelación. ¿Continuar?')) {
        return;
      }
    }

    setShowModal(true);
  };

  const handleSubmitCancel = async () => {
    if (!reason.trim()) {
      alert('Por favor indica el motivo de cancelación');
      return;
    }

    setProcessing(true);
    try {
      await cancelAppointment(appointmentId, reason);
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || 'Error cancelling appointment');
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
        Cancelar cita
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
              Cancelar cita
            </h3>
            <div className="dash-field">
              <label className="dash-label">Motivo de cancelación</label>
              <textarea
                className="dash-textarea"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Indica el motivo..."
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
                {processing ? 'Cancelando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={processing}
                className="dash-btn-plain"
                style={{ flex: 1 }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
