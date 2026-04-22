import { PublicNav } from '@/components/PublicNav';
import { useTranslations } from 'next-intl';

export default function About() {
  const t = useTranslations('public.static.about');

  return (
    <div className="content-page">
      <PublicNav />

      <main className="content-main">
        <article className="content-article">

          <h1>{t('title')}</h1>

          <h2>{t('problem_title')}</h2>
          <p>{t('problem_p1')}</p>
          <p>{t('problem_p2')}</p>
          <p>{t('problem_p3')}</p>

          <h2>{t('solution_title')}</h2>
          <p>{t('solution_p1')}</p>
          <p>
            <strong>Para clientes:</strong> {t('solution_p2_for_clients')}
          </p>
          <p>
            <strong>Para nutricionistas:</strong> {t('solution_p3_for_nutritionists')}
          </p>

          <h2>{t('difference_title')}</h2>

          <div className="content-value-grid">

            <div className="content-value-card">
              <h3 className="content-value-title">{t('difference_verified')}</h3>
              <p className="content-value-desc">{t('difference_verified_desc')}</p>
            </div>

            <div className="content-value-card">
              <h3 className="content-value-title">{t('difference_transparent')}</h3>
              <p className="content-value-desc">{t('difference_transparent_desc')}</p>
            </div>

            <div className="content-value-card">
              <h3 className="content-value-title">{t('difference_complete')}</h3>
              <p className="content-value-desc">{t('difference_complete_desc')}</p>
            </div>

            <div className="content-value-card">
              <h3 className="content-value-title">{t('difference_free')}</h3>
              <p className="content-value-desc">{t('difference_free_desc')}</p>
            </div>

            <div className="content-value-card">
              <h3 className="content-value-title">{t('difference_commitment')}</h3>
              <p className="content-value-desc">{t('difference_commitment_desc')}</p>
            </div>

            <div className="content-value-card">
              <h3 className="content-value-title">{t('difference_fair')}</h3>
              <p className="content-value-desc">{t('difference_fair_desc')}</p>
            </div>

          </div>

          <h2>{t('mission_title')}</h2>
          <p>{t('mission_p1')}</p>
          <p>{t('mission_p2')}</p>

          <h2>{t('team_title')}</h2>
          <p>{t('team_p1')}</p>
          <p>
            {t('team_p2')} <a href="mailto:hola@nutri.red">hola@nutri.red</a>.
          </p>

          <div className="content-cta">
            <a href="/register" className="content-cta-btn">
              {t('join_cta')}
            </a>
          </div>

        </article>
      </main>

      <footer className="lp-footer">
        <div className="ft-logo">nutri<span>connect</span></div>
        <ul className="ft-links">
          <li><a href="/about">Sobre nosotros</a></li>
          <li><a href="/for-nutritionists">Para nutricionistas</a></li>
          <li><a href="/privacy">Privacidad</a></li>
          <li><a href="/terms">Términos</a></li>
        </ul>
        <span className="ft-copy">© 2026 Nutriconnect</span>
      </footer>
    </div>
  );
}
