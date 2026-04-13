'use client';

import { useState, useEffect } from 'react';
import { api, ApiRequestError } from '@/lib/api';

interface WaitlistButtonProps {
  slug: string;
}

export function WaitlistButton({ slug }: WaitlistButtonProps) {
  const [onWaitlist, setOnWaitlist] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.getWaitlistStatus(slug)
      .then((data) => {
        if (!cancelled) {
          setOnWaitlist(data.on_waitlist);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          // If 401, user is not authenticated — treat as not on waitlist
          if (err instanceof ApiRequestError && err.status === 401) {
            setOnWaitlist(false);
          } else {
            setOnWaitlist(false);
          }
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [slug]);

  async function handleJoin() {
    setSubmitting(true);
    setMessage('');
    try {
      await api.joinWaitlist(slug);
      setOnWaitlist(true);
      setMessage('Te hemos añadido a la lista de espera.');
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        window.location.href = `/login?from=/nutritionists/${slug}`;
        return;
      }
      setMessage('No se pudo unir a la lista. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLeave() {
    setSubmitting(true);
    setMessage('');
    try {
      await api.leaveWaitlist(slug);
      setOnWaitlist(false);
      setMessage('Has salido de la lista de espera.');
    } catch {
      setMessage('No se pudo salir de la lista. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <button
        className="nc-btn-contact"
        disabled
        style={{ width: '100%', cursor: 'wait', opacity: 0.6 }}
      >
        Cargando…
      </button>
    );
  }

  return (
    <div>
      {onWaitlist ? (
        <button
          className="nc-btn-contact"
          onClick={handleLeave}
          disabled={submitting}
          style={{
            width: '100%',
            cursor: submitting ? 'wait' : 'pointer',
            background: 'transparent',
            border: '1.5px solid var(--nc-terra)',
            color: 'var(--nc-terra)',
          }}
        >
          {submitting ? 'Procesando…' : 'Salir de la lista de espera'}
        </button>
      ) : (
        <button
          className="nc-btn-contact"
          onClick={handleJoin}
          disabled={submitting}
          style={{ width: '100%', cursor: submitting ? 'wait' : 'pointer' }}
        >
          {submitting ? 'Enviando…' : 'Notificarme cuando haya un lugar'}
        </button>
      )}
      {message && (
        <p style={{ fontSize: 12, marginTop: 8, color: 'var(--nc-stone)' }}>{message}</p>
      )}
    </div>
  );
}
