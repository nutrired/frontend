'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import SurveyBuilder from '@/components/survey/SurveyBuilder';
import { useSurveyTemplate, updateSurveyTemplate } from '@/lib/survey';
import type { TemplateQuestion } from '@/lib/types';

export default function EditSurveyTemplatePage() {
  const t = useTranslations('dashboard.surveys');
  const locale = useLocale();
  const params = useParams<{ templateId: string }>();
  const templateId = params.templateId;
  const { template, isLoading, error } = useSurveyTemplate(templateId);

  const handleSave = async (data: { title: string; description: string; questions: TemplateQuestion[] }) => {
    await updateSurveyTemplate(templateId, data);
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
          <div className="dash-topbar-title">
            {isLoading ? '...' : (template?.title ?? t('edit_survey_page_title'))}
          </div>
        </div>
      </div>
      <div className="dash-content">
        {isLoading && (
          <div style={{ color: 'var(--nc-stone)', fontWeight: 300, fontSize: 13 }}>{t('loading')}</div>
        )}

        {error && (
          <div style={{
            background: 'rgba(205,92,92,0.1)', border: '1px solid rgba(205,92,92,0.2)',
            borderRadius: 6, padding: 12, fontSize: 13, color: '#cd5c5c',
          }}>
            {t('error_survey_not_found')}
          </div>
        )}

        {!isLoading && template && (
          <SurveyBuilder
            initialTitle={template.title}
            initialDescription={template.description}
            initialQuestions={template.questions}
            onSave={handleSave}
            isEdit
          />
        )}

        {!isLoading && !template && !error && (
          <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>
            {t('survey_not_found')}
          </div>
        )}
      </div>
    </>
  );
}
