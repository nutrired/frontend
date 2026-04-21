'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const switchLocale = async (newLocale: string) => {
    try {
      console.log('[LanguageSwitcher] Switching from', locale, 'to', newLocale);
      console.log('[LanguageSwitcher] Current pathname:', pathname);

      // Update cookie
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      console.log('[LanguageSwitcher] Cookie set');

      // Update user preference if logged in (ignore errors)
      try {
        await api.put('/user/preferences', { preferred_locale: newLocale });
        console.log('[LanguageSwitcher] User preference updated in backend');
      } catch (e) {
        console.log('[LanguageSwitcher] Failed to update user preference (may not be logged in):', e);
      }

      // Redirect to new locale
      const segments = pathname.split('/');
      console.log('[LanguageSwitcher] Path segments:', segments);
      segments[1] = newLocale; // Replace locale segment
      const newPath = segments.join('/');
      console.log('[LanguageSwitcher] New path:', newPath);

      router.push(newPath);
      router.refresh();
    } catch (error) {
      console.error('[LanguageSwitcher] Error switching locale:', error);
    }
  };

  if (!isClient) {
    return (
      <button
        style={{
          background: 'transparent',
          border: '1px solid var(--nc-border)',
          borderRadius: 6,
          padding: '6px 12px',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--nc-ink)',
          opacity: 0.5,
        }}
        disabled
      >
        🌐 ...
      </button>
    );
  }

  return (
    <button
      onClick={() => switchLocale(locale === 'es' ? 'en' : 'es')}
      style={{
        background: 'transparent',
        border: '1px solid var(--nc-border)',
        borderRadius: 6,
        padding: '6px 12px',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: 'var(--nc-ink)',
      }}
    >
      {locale === 'es' ? '🇬🇧 English' : '🇪🇸 Español'}
    </button>
  );
}
