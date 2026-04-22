import { PublicNav } from '@/components/PublicNav';
import { useTranslations } from 'next-intl';

export default function HowItWorks() {
  const t = useTranslations('public.static.how');

  return (
    <div className="content-page">
      <PublicNav />

      <main className="content-main">
        <article className="content-article">

          <h1>{t('title')}</h1>
          <p>{t('intro')}</p>

          <h2>{t('how_works_title')}</h2>

          <div className="content-steps">

            <div className="content-step-card">
              <div className="content-step-number">{t('step_1_num')}</div>
              <h3 className="content-step-title">{t('step_1_title')}</h3>
              <p className="content-step-desc">{t('step_1_desc')}</p>
              <ul>
                <li>{t('step_1_specialty')}</li>
                <li>{t('step_1_city')}</li>
                <li>{t('step_1_language')}</li>
                <li>{t('step_1_price')}</li>
              </ul>
              <p className="content-step-desc">{t('step_1_profiles')}</p>
            </div>

            <div className="content-step-card">
              <div className="content-step-number">{t('step_2_num')}</div>
              <h3 className="content-step-title">{t('step_2_title')}</h3>
              <p className="content-step-desc">{t('step_2_desc')}</p>
              <p className="content-step-desc">{t('step_2_request')}</p>
            </div>

            <div className="content-step-card">
              <div className="content-step-number">{t('step_3_num')}</div>
              <h3 className="content-step-title">{t('step_3_title')}</h3>
              <p className="content-step-desc">{t('step_3_desc')}</p>
              <ul>
                <li>{t('step_3_nutrition')}</li>
                <li>{t('step_3_exercise')}</li>
                <li>{t('step_3_chat')}</li>
              </ul>
              <p className="content-step-desc">{t('step_3_integrated')}</p>
            </div>

          </div>

          <h2>{t('faq_title')}</h2>

          <div className="content-faq">

            <div className="content-faq-item">
              <div className="content-faq-question">{t('faq_1_q')}</div>
              <div className="content-faq-answer">{t('faq_1_a')}</div>
            </div>

            <div className="content-faq-item">
              <div className="content-faq-question">{t('faq_2_q')}</div>
              <div className="content-faq-answer">{t('faq_2_a')}</div>
            </div>

            <div className="content-faq-item">
              <div className="content-faq-question">{t('faq_3_q')}</div>
              <div className="content-faq-answer">{t('faq_3_a')}</div>
            </div>

            <div className="content-faq-item">
              <div className="content-faq-question">{t('faq_4_q')}</div>
              <div className="content-faq-answer">{t('faq_4_a')}</div>
            </div>

            <div className="content-faq-item">
              <div className="content-faq-question">{t('faq_5_q')}</div>
              <div className="content-faq-answer">{t('faq_5_a')}</div>
            </div>

            <div className="content-faq-item">
              <div className="content-faq-question">{t('faq_6_q')}</div>
              <div className="content-faq-answer">{t('faq_6_a')}</div>
            </div>

            <div className="content-faq-item">
              <div className="content-faq-question">{t('faq_7_q')}</div>
              <div className="content-faq-answer">
                {t('faq_7_a', {
                  privacyLink: <a key="privacy-link" href="/privacy">política de privacidad</a>
                })}
              </div>
            </div>

          </div>

          <div className="content-cta">
            <a href="/nutritionists" className="content-cta-btn">
              {t('find_nutritionist_cta')}
            </a>
          </div>

        </article>
      </main>

      <footer className="lp-footer">
        <div className="ft-logo">nutri<span>red</span></div>
        <ul className="ft-links">
          <li><a href="/about">Sobre nosotros</a></li>
          <li><a href="/for-nutritionists">Para nutricionistas</a></li>
          <li><a href="/privacy">Privacidad</a></li>
          <li><a href="/terms">Términos</a></li>
        </ul>
        <span className="ft-copy">© 2026 Nutri Red</span>
      </footer>
    </div>
  );
}
