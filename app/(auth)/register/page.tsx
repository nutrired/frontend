// frontend/app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiRequestError } from '@/lib/api';

type Role = 'client' | 'nutritionist';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password, role });
      router.push('/verify-email');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.code === 'EMAIL_TAKEN') {
          setError('Este email ya está registrado. ¿Quieres iniciar sesión?');
        } else {
          setError(err.message);
        }
      } else {
        setError('Algo salió mal. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <a href="/" className="auth-logo">nutri<span>connect</span></a>

      <h1 className="auth-heading">Crea tu <em>cuenta</em></h1>
      <p className="auth-sub">Únete a la comunidad de nutrición más grande.</p>

      {error && <div className="auth-alert auth-alert-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Soy…</label>
          <div className="role-grid">
            <label className={`role-option${role === 'client' ? ' selected' : ''}`}>
              <input type="radio" name="role" value="client" checked={role === 'client'} onChange={() => setRole('client')} />
              <div className="role-icon">🥗</div>
              <div className="role-label">Cliente</div>
              <div className="role-desc">Busco un nutricionista</div>
            </label>
            <label className={`role-option${role === 'nutritionist' ? ' selected' : ''}`}>
              <input type="radio" name="role" value="nutritionist" checked={role === 'nutritionist'} onChange={() => setRole('nutritionist')} />
              <div className="role-icon">👩‍⚕️</div>
              <div className="role-label">Nutricionista</div>
              <div className="role-desc">Ofrezco mis servicios</div>
            </label>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn-auth" disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <hr className="auth-divider" />

      <p className="auth-footer">
        ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
      </p>
    </div>
  );
}
