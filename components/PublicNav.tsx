'use client';

import { useAuth } from '@/lib/auth';

export function PublicNav() {
  const { user } = useAuth();

  return (
    <nav className="lp-nav">
      <a href="/" className="nav-logo">
        nutri<span>connect</span>
      </a>
      <ul className="nav-links">
        <li><a href="/nutritionists">Buscar nutricionistas</a></li>
        <li><a href="/how">Cómo funciona</a></li>
        <li><a href="/for-nutritionists">Para nutricionistas</a></li>
      </ul>
      {user ? (
        <a href="/dashboard" className="btn-nav">
          {user.role === 'nutritionist' ? 'Mi consulta' : 'Mi dashboard'}
        </a>
      ) : (
        <a href="/register" className="btn-nav">Empezar gratis</a>
      )}
    </nav>
  );
}
