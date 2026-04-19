'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cancelAppointment } from '@/lib/calendar';
import type { RecurringSeriesDetails, Appointment } from '@/lib/types';

interface SeriesDetailModalProps {
  open: boolean;
  onClose: () => void;
  seriesId: string;
  onSuccess: () => void;
}

export function SeriesDetailModal({ open, onClose, seriesId, onSuccess }: SeriesDetailModalProps) {
  const [series, setSeries] = useState<RecurringSeriesDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (open && seriesId) {
      loadSeries();
    }
  }, [open, seriesId]);

  const loadSeries = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getRecurringSeries(seriesId);
      setSeries(data as RecurringSeriesDetails);
    } catch (err: any) {
      setError(err.message || 'Failed to load series');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSeries = async () => {
    if (!confirm('Cancel all future appointments in this series?')) return;

    setCancelling(true);
    try {
      await api.cancelRecurringSeries(seriesId, 'Cancelled by user');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel series');
    } finally {
      setCancelling(false);
    }
  };

  const frequencyLabel = series
    ? `${series.pattern.frequency} (every ${series.pattern.interval} ${series.pattern.frequency === 'monthly' ? 'month(s)' : 'week(s)'})`
    : '';

  const futureAppointments = series?.appointments.filter(
    (a) => a.status === 'scheduled' && new Date(a.start_time) > new Date()
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Recurring Series Details</DialogTitle>
        </DialogHeader>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {series && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Pattern</p>
              <p className="text-sm text-muted-foreground">{frequencyLabel}</p>
              <p className="text-sm text-muted-foreground">
                {series.pattern.end_type === 'after_count'
                  ? `${series.pattern.end_after_count} occurrences`
                  : `Until ${series.pattern.end_date}`}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Appointments ({series.appointments.length})</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {series.appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between border p-2 rounded text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(appt.start_time).toLocaleDateString()} at{' '}
                        {new Date(appt.start_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-muted-foreground">{appt.status}</p>
                    </div>
                    {appt.status === 'scheduled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (confirm('Cancel this appointment?')) {
                            await cancelAppointment(appt.id, 'Cancelled');
                            loadSeries();
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {futureAppointments.length > 0 && (
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button variant="destructive" onClick={handleCancelSeries} disabled={cancelling}>
                  {cancelling ? 'Cancelling...' : 'Cancel All Future'}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
