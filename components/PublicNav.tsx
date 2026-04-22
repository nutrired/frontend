'use client';

import { useLocale, useTranslations } from 'next-intl';

export function PublicNav() {
  const locale = useLocale();
  const t = useTranslations('public.nav');

  return (
    <nav className="lp-nav">
      <a href={`/${locale}/`} className="nav-logo">
        nutri<span>red</span>
      </a>
      <ul className="nav-links">
        <li><a href={`/${locale}/nutritionists`}>{t('search_nutritionists')}</a></li>
        <li><a href={`/${locale}/how`}>{t('how_it_works')}</a></li>
        <li><a href={`/${locale}/for-nutritionists`}>{t('for_nutritionists')}</a></li>
      </ul>
      <a href={`/${locale}/login`} className="btn-nav">{t('login')}</a>
    </nav>
  );
}
