'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import SurveyBuilder from '@/components/survey/SurveyBuilder';
import { createSurveyTemplate } from '@/lib/survey';
import type { TemplateQuestion } from '@/lib/types';

export default function NewSurveyTemplatePage() {
  const t = useTranslations('dashboard.surveys');
  const locale = useLocale();
  const handleSave = async (data: { title: string; description: string; questions: TemplateQuestion[] }) => {
    await createSurveyTemplate(data);
  };

  return (
    <>
      <div className="dash-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href={`/${locale}/dashboard/surveys`}
            style={{ fontSize: 13, color: 'var(--nc-stone)', textDecoration: 'none' }}
          >
            {t('surveys_link')}
          </Link>
          <div className="dash-topbar-title">{t('new_survey_page_title')}</div>
        </div>
      </div>
      <div className="dash-content">
        <SurveyBuilder onSave={handleSave} />
      </div>
    </>
  );
}
