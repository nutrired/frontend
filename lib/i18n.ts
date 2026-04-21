import { getRequestConfig } from 'next-intl/server';

export const locales = ['es', 'en'] as const;
export const defaultLocale = 'es';
export type Locale = typeof locales[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Wait for the locale from the request
  let locale = await requestLocale;

  // Validate and use default if invalid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  console.log('[i18n config] Using locale:', locale);

  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
