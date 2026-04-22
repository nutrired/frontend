'use client';
// frontend/app/dashboard/availability/page.tsx

import { useTranslations } from 'next-intl';
import { AvailabilityEditor } from '@/components/calendar/AvailabilityEditor';

export default function AvailabilityPage() {
  const t = useTranslations('dashboard.appointments');

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">{t('availability_title')}</div>
      </div>

      <div className="dash-content">
        <div className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-title">{t('availability_title')}</div>
            <div className="dash-section-sub">{t('availability_desc')}</div>
          </div>
          <div className="dash-section-body">
            <AvailabilityEditor />
          </div>
        </div>
      </div>
    </>
  );
}
