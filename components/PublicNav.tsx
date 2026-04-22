'use client';

import { useLocale } from 'next-intl';

export function PublicNav() {
  const locale = useLocale();

  return (
    <nav className="lp-nav">
      <a href={`/${locale}/`} className="nav-logo">
        nutri<span>red</span>
      </a>
      <ul className="nav-links">
        <li><a href={`/${locale}/nutritionists`}>Buscar nutricionistas</a></li>
        <li><a href={`/${locale}/how`}>Cómo funciona</a></li>
        <li><a href={`/${locale}/for-nutritionists`}>Para nutricionistas</a></li>
      </ul>
      <a href={`/${locale}/login`} className="btn-nav">Iniciar sesión</a>
    </nav>
  );
}
