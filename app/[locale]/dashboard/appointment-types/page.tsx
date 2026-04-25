'use client';
// frontend/app/dashboard/appointment-types/page.tsx

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';
import { useAppointmentTypes, createAppointmentType, updateAppointmentType, deleteAppointmentType } from '@/lib/calendar';
import type { AppointmentType } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AppointmentTypesPage() {
  const { user } = useAuth();
  const t = useTranslations('dashboard.appointments');
  const { types, isLoading, mutate } = useAppointmentTypes();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<AppointmentType | null>(null);

  const [name, setName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [description, setDescription] = useState('');

  // Nutritionist-only page
  if (user?.role !== 'nutritionist') {
    return null;
  }

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const openCreateDialog = () => {
    setEditingType(null);
    setName('');
    setDurationMinutes(30);
    setDescription('');
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (type: AppointmentType) => {
    setEditingType(type);
    setName(type.name);
    setDurationMinutes(type.duration_minutes);
    setDescription(type.description);
    setError('');
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('name_required'));
      return;
    }
    if (durationMinutes < 1 || durationMinutes > 240) {
      setError(t('duration_required'));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (editingType) {
        await updateAppointmentType(editingType.id, {
          name: name.trim(),
          duration_minutes: durationMinutes,
          description: description.trim(),
          video_link: '',
        });
      } else {
        await createAppointmentType({
          name: name.trim(),
          duration_minutes: durationMinutes,
          description: description.trim(),
          video_link: '',
        });
      }
      setDialogOpen(false);
      await mutate();
    } catch (err: any) {
      setError(err.message || t('error_save'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (typeId: string, typeName: string) => {
    if (!confirm(t('confirm_delete', { name: typeName }))) {
      return;
    }

    try {
      await deleteAppointmentType(typeId);
      await mutate();
    } catch (err: any) {
      alert(err?.message ?? t('error_delete'));
    }
  };

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">{t('appointment_types_title')}</div>
        <div className="dash-topbar-right">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button onClick={openCreateDialog} className="dash-btn-publish">
                {t('new_appointment_type')}
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingType ? t('edit_appointment_type') : t('create_appointment_type')}</DialogTitle>
                <DialogDescription>
                  {t('define_types')}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
                {error && (
                  <div
                    style={{
                      background: 'rgba(196,98,45,0.08)',
                      color: 'var(--nc-terra)',
                      padding: '12px 16px',
                      borderRadius: 8,
                      fontSize: 13,
                      marginBottom: 16,
                    }}
                  >
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="dash-field">
                    <label className="dash-label">
                      {t('name_label')} <span style={{ color: 'var(--nc-terra)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="dash-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={200}
                      placeholder={t('name_placeholder')}
                      required
                    />
                  </div>

                  <div className="dash-field">
                    <label className="dash-label">
                      {t('duration_label')} <span style={{ color: 'var(--nc-terra)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      className="dash-input"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                      min={1}
                      max={240}
                      required
                    />
                  </div>

                  <div className="dash-field">
                    <label className="dash-label">{t('description_label')}</label>
                    <textarea
                      className="dash-textarea"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={2000}
                      rows={3}
                      placeholder={t('description_placeholder')}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="dash-btn-publish"
                    style={{ flex: 1 }}
                  >
                    {submitting ? t('saving') : editingType ? t('save_changes') : t('create_type')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    className="dash-btn-plain"
                    style={{ flex: 1 }}
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="dash-content">
        {isLoading ? (
          <div style={{ color: 'var(--nc-stone)', fontWeight: 300 }}>{t('loading')}</div>
        ) : types.length === 0 ? (
          <div style={{
            background: 'var(--nc-forest-pale)',
            border: '1px solid rgba(26,51,41,0.12)',
            borderRadius: 10,
            padding: '32px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--nc-forest)', marginBottom: 8 }}>
              {t('no_types_title')}
            </div>
            <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300, marginBottom: 16 }}>
              {t('no_types_desc')}
            </div>
            <button onClick={openCreateDialog} className="dash-btn-publish">
              {t('create_first_type')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {types.map((type) => (
              <div
                key={type.id}
                style={{
                  background: 'white',
                  border: '1px solid var(--nc-border)',
                  borderRadius: 10,
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--nc-ink)', marginBottom: 4 }}>
                      {type.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>
                      {type.duration_minutes} {t('minutes')}
                    </div>
                  </div>
                </div>

                {type.description && (
                  <div style={{ fontSize: 13, color: 'var(--nc-stone)', lineHeight: 1.5 }}>
                    {type.description}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--nc-border)' }}>
                  <button
                    onClick={() => openEditDialog(type)}
                    className="dash-btn-plain"
                    style={{ flex: 1, fontSize: 13, padding: '8px 12px' }}
                  >
                    {t('edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(type.id, type.name)}
                    className="dash-btn-plain"
                    style={{ flex: 1, fontSize: 13, padding: '8px 12px', color: 'var(--nc-terra)' }}
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
