'use client';
// frontend/app/dashboard/appointments/book/page.tsx

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAppointmentTypes, useAvailableSlots, createAppointment } from '@/lib/calendar';
import { format, addDays } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export default function BookAppointmentPage() {
  const router = useRouter();
  const t = useTranslations('dashboard.appointments');
  const locale = useLocale();
  const dateFnsLocale = locale === 'es' ? es : enUS;
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

  const { slots, isLoading: slotsLoading, error: slotsError } = useAvailableSlots(
    nutritionistID || '',
    selectedDate,
    selectedType?.duration_minutes || 0
  );

  // Check if nutritionist has no appointment types configured
  const hasNoAppointmentTypes = !typesLoading && types.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation with helpful messages
    if (!relationshipID) {
      setError(t('missing_params'));
      return;
    }
    if (!selectedTypeID) {
      setError(t('error_no_type'));
      return;
    }
    if (!selectedSlot) {
      setError(t('error_no_slot'));
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
      router.push(`/${locale}/dashboard/calendar`);
    } catch (err: any) {
      setError(err.message || t('error_booking'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!relationshipID || !nutritionistID) {
    return <div className="dash-content">{t('missing_params')}</div>;
  }

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">{t('book_appointment_title')}</div>
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

          {hasNoAppointmentTypes && !error && (
            <div style={{
              background: 'rgba(196,98,45,0.08)',
              color: 'var(--nc-terra)',
              padding: '16px',
              borderRadius: 8,
              fontSize: 14,
              marginBottom: 24,
              lineHeight: 1.6,
            }}>
              <strong>{t('no_types_error')}</strong>
              <br />
              {t('no_types_error_desc')}
            </div>
          )}

          <div className="dash-field">
            <label className="dash-label">{t('appointment_type_label')}</label>
            {typesLoading ? (
              <div style={{ fontSize: 13, color: 'var(--nc-stone)', padding: '12px 16px' }}>
                {t('loading_types')}
              </div>
            ) : (
              <select
                className="dash-input"
                value={selectedTypeID}
                onChange={(e) => setSelectedTypeID(e.target.value)}
                required
                disabled={hasNoAppointmentTypes}
              >
                <option value="">{t('select_type')}</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.duration_minutes} {t('duration_minutes')})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="dash-field">
            <label className="dash-label">{t('date_label')}</label>
            <input
              type="date"
              className="dash-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              required
            />
            <div style={{
              fontSize: 12,
              color: 'var(--nc-stone)',
              marginTop: 8,
              fontStyle: 'italic'
            }}>
              ℹ️ {t('same_day_info')}
            </div>
          </div>

          {selectedTypeID && (
            <div className="dash-field">
              <label className="dash-label">{t('available_time_label')}</label>
              {slotsLoading ? (
                <div style={{ fontSize: 13, color: 'var(--nc-stone)' }}>{t('loading_slots')}</div>
              ) : slots.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--nc-stone)' }}>{t('no_slots')}</div>
              ) : (
                <select
                  className="dash-input"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  required
                >
                  <option value="">{t('select_type')}</option>
                  {slots.map((slot) => (
                    <option key={slot} value={slot}>
                      {format(new Date(slot), 'HH:mm', { locale: dateFnsLocale })}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="dash-field">
            <label className="dash-label">{t('notes_label')}</label>
            <textarea
              className="dash-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={t('notes_placeholder')}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              type="submit"
              disabled={submitting || !selectedSlot || hasNoAppointmentTypes}
              className="dash-btn-publish"
              style={{ flex: 1 }}
            >
              {submitting ? t('booking') : t('book_button')}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="dash-btn-plain"
              style={{ flex: 1 }}
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
