import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { locales, type Locale } from '@/lib/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  console.log('[LocaleLayout] Received locale:', locale);

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    console.error('[LocaleLayout] Invalid locale:', locale);
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);
  console.log('[LocaleLayout] setRequestLocale called with:', locale);

  // Load messages for the current locale
  const messages = await getMessages();
  console.log('[LocaleLayout] Messages loaded for locale:', locale);

  return (
    <>
      <Script
        id="set-locale"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang = '${locale}';`,
        }}
      />
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </>
  );
}
