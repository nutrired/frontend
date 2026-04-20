'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateAppointmentNotes } from '@/lib/appointment-notes';
import { toast } from 'sonner';
import { Eye, Lock } from 'lucide-react';

interface AppointmentNotesSectionProps {
  appointmentId: string;
  initialSharedSummary?: string | null;
  initialClinicalNotes?: string | null;
  initialInternalReminders?: string | null;
  onUpdate?: () => void;
}

const MAX_CHARS = 5000;

export function AppointmentNotesSection({
  appointmentId,
  initialSharedSummary = null,
  initialClinicalNotes = null,
  initialInternalReminders = null,
  onUpdate,
}: AppointmentNotesSectionProps) {
  const [sharedSummary, setSharedSummary] = useState(initialSharedSummary || '');
  const [clinicalNotes, setClinicalNotes] = useState(initialClinicalNotes || '');
  const [internalReminders, setInternalReminders] = useState(initialInternalReminders || '');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed =
      sharedSummary !== (initialSharedSummary || '') ||
      clinicalNotes !== (initialClinicalNotes || '') ||
      internalReminders !== (initialInternalReminders || '');
    setHasChanges(changed);
  }, [sharedSummary, clinicalNotes, internalReminders, initialSharedSummary, initialClinicalNotes, initialInternalReminders]);

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      await updateAppointmentNotes(appointmentId, {
        shared_summary: sharedSummary || undefined,
        clinical_notes: clinicalNotes || undefined,
        internal_reminders: internalReminders || undefined,
      });
      toast.success('Notes saved successfully');
      setHasChanges(false);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast.error('Failed to save notes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="shared-summary" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Session Summary (Shared with client)
        </Label>
        <Textarea
          id="shared-summary"
          value={sharedSummary}
          onChange={(e) => setSharedSummary(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Add a summary of the session that will be visible to the client..."
          rows={4}
          className="resize-none"
        />
        <div className="text-sm text-muted-foreground text-right">
          {sharedSummary.length} / {MAX_CHARS}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinical-notes" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Clinical Notes (Private)
        </Label>
        <Textarea
          id="clinical-notes"
          value={clinicalNotes}
          onChange={(e) => setClinicalNotes(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Add private clinical observations..."
          rows={4}
          className="resize-none"
        />
        <div className="text-sm text-muted-foreground text-right">
          {clinicalNotes.length} / {MAX_CHARS}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="internal-reminders" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Internal Reminders (Private)
        </Label>
        <Textarea
          id="internal-reminders"
          value={internalReminders}
          onChange={(e) => setInternalReminders(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Add internal reminders for follow-up actions..."
          rows={4}
          className="resize-none"
        />
        <div className="text-sm text-muted-foreground text-right">
          {internalReminders.length} / {MAX_CHARS}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? 'Saving...' : 'Save Notes'}
        </Button>
      </div>
    </div>
  );
}
