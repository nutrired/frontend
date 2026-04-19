'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { api } from '@/lib/api';
import { createAppointment } from '@/lib/calendar';
import type { AppointmentType, CreateRecurringAppointmentRequest, CreateRecurringAppointmentResponse } from '@/lib/types';

interface RecurringAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  relationshipId: string;
  appointmentTypes: AppointmentType[];
  onSuccess: () => void;
}

export function RecurringAppointmentModal({
  open,
  onClose,
  relationshipId,
  appointmentTypes,
  onSuccess,
}: RecurringAppointmentModalProps) {
  const [appointmentTypeId, setAppointmentTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [interval, setInterval] = useState(1);
  const [endType, setEndType] = useState<'after_count' | 'on_date'>('after_count');
  const [endAfterCount, setEndAfterCount] = useState(8);
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const startTimeISO = `${startDate}T${startTime}:00Z`;

      if (isRecurring) {
        await api.createRecurringAppointment<CreateRecurringAppointmentRequest>({
          relationship_id: relationshipId,
          appointment_type_id: appointmentTypeId,
          start_time: startTimeISO,
          notes,
          recurrence: {
            frequency,
            interval,
            end_type: endType,
            end_after_count: endType === 'after_count' ? endAfterCount : undefined,
            end_date: endType === 'on_date' ? endDate : undefined,
          },
        });
      } else {
        // Create single appointment (existing flow)
        await createAppointment({
          relationship_id: relationshipId,
          appointment_type_id: appointmentTypeId,
          start_time: startTimeISO,
          notes,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = appointmentTypes.find((t) => t.id === appointmentTypeId);
  const previewText = isRecurring
    ? `Will create ${endType === 'after_count' ? endAfterCount : '~'} appointments`
    : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Appointment Type</Label>
            <Select value={appointmentTypeId} onValueChange={setAppointmentTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name} ({type.duration_minutes} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="recurring" checked={isRecurring} onCheckedChange={(v) => setIsRecurring(!!v)} />
            <Label htmlFor="recurring">Make this recurring</Label>
          </div>

          {isRecurring && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Every</Label>
                  <Input
                    type="number"
                    min="1"
                    value={interval}
                    onChange={(e) => setInterval(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label>Ends</Label>
                <RadioGroup value={endType} onValueChange={(v: any) => setEndType(v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="after_count" id="after_count" />
                    <Label htmlFor="after_count" className="flex items-center gap-2">
                      After
                      <Input
                        type="number"
                        min="1"
                        value={endAfterCount}
                        onChange={(e) => setEndAfterCount(parseInt(e.target.value))}
                        className="w-20"
                        disabled={endType !== 'after_count'}
                      />
                      occurrences
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="on_date" id="on_date" />
                    <Label htmlFor="on_date" className="flex items-center gap-2">
                      On
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-40"
                        disabled={endType !== 'on_date'}
                      />
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {previewText && <p className="text-sm text-muted-foreground">{previewText}</p>}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !appointmentTypeId || !startDate || !startTime}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
