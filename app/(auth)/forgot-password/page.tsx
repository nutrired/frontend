// frontend/app/(auth)/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await api.post('/auth/forgot-password', { email }).catch(() => {}); // always succeeds
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <a href="/" className="auth-logo" style={{ textAlign: 'left' }}>nutri<span>connect</span></a>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
        <h1 className="auth-heading">Revisa tu <em>correo</em></h1>
        <p className="auth-sub">
          Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña en breve.
        </p>
        <hr className="auth-divider" />
        <p className="auth-footer"><a href="/login">Volver al inicio de sesión</a></p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <a href="/" className="auth-logo">nutri<span>connect</span></a>
      <h1 className="auth-heading">Restablecer <em>contraseña</em></h1>
      <p className="auth-sub">Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
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
        <button type="submit" className="btn-auth" disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>

      <hr className="auth-divider" />
      <p className="auth-footer"><a href="/login">Volver al inicio de sesión</a></p>
    </div>
  );
}
