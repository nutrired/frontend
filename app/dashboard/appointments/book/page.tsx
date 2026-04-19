'use client';
// frontend/app/dashboard/appointments/book/page.tsx

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppointmentTypes, useAvailableSlots, createAppointment } from '@/lib/calendar';
import { format, addDays } from 'date-fns';

export default function BookAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const relationshipID = searchParams.get('relationship_id');
  const nutritionistID = searchParams.get('nutritionist_id');

  const [selectedTypeID, setSelectedTypeID] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { types, isLoading: typesLoading } = useAppointmentTypes(nutritionistID || undefined);
  const selectedType = types.find(t => t.id === selectedTypeID);

  const { slots, isLoading: slotsLoading } = useAvailableSlots(
    nutritionistID || '',
    selectedDate,
    selectedType?.duration_minutes || 0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relationshipID || !selectedTypeID || !selectedSlot) {
      setError('Please complete all fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createAppointment({
        relationship_id: relationshipID,
        appointment_type_id: selectedTypeID,
        start_time: selectedSlot,
        notes: notes.trim(),
      });
      router.push('/dashboard/calendar');
    } catch (err: any) {
      setError(err.message || 'Error booking appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (!relationshipID || !nutritionistID) {
    return <div className="dash-content">Missing required parameters</div>;
  }

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">Agendar Cita</div>
      </div>

      <div className="dash-content">
        <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
          {error && (
            <div style={{
              background: 'rgba(196,98,45,0.08)',
              color: 'var(--nc-terra)',
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 24,
            }}>
              {error}
            </div>
          )}

          <div className="dash-field">
            <label className="dash-label">Tipo de cita</label>
            <select
              className="dash-input"
              value={selectedTypeID}
              onChange={(e) => setSelectedTypeID(e.target.value)}
              required
            >
              <option value="">Seleccionar...</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.duration_minutes} min)
                </option>
              ))}
            </select>
          </div>

          <div className="dash-field">
            <label className="dash-label">Fecha</label>
            <input
              type="date"
              className="dash-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              required
            />
          </div>

          {selectedTypeID && (
            <div className="dash-field">
              <label className="dash-label">Hora disponible</label>
              {slotsLoading ? (
                <div style={{ fontSize: 13, color: 'var(--nc-stone)' }}>Cargando...</div>
              ) : slots.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--nc-stone)' }}>No hay horarios disponibles este día</div>
              ) : (
                <select
                  className="dash-input"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {slots.map((slot) => (
                    <option key={slot} value={slot}>
                      {format(new Date(slot), 'HH:mm')}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="dash-field">
            <label className="dash-label">Notas (opcional)</label>
            <textarea
              className="dash-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Información adicional..."
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="dash-btn-publish"
              style={{ flex: 1 }}
            >
              {submitting ? 'Agendando...' : 'Confirmar Cita'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="dash-btn-plain"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
