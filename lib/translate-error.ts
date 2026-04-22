/**
 * Helper function for translating API error codes and messages.
 *
 * Usage:
 *   const errorMsg = translateError(t, error);
 *
 * The function checks error.code, falls back to error.message,
 * handles network errors gracefully, and returns a user-friendly message.
 */
export function translateError(
  t: (key: string, options?: any) => string,
  error: any
): string {
  // Check if error has a code
  const code = error?.code || error?.response?.data?.code;

  if (code) {
    // Try to find translation for error code
    try {
      // Attempt to translate the error code
      // If translation doesn't exist, next-intl will return the key as fallback
      const translated = t(`errors.${code}`);

      // Check if the translation is the key itself (meaning it doesn't exist)
      if (!translated.includes('errors.')) {
        return translated;
      }
    } catch {
      // Continue to fallback if translation fails
    }
  }

  // Check for error message
  if (error?.message && typeof error.message === 'string') {
    // Return message if it's not a generic error code
    if (!error.message.includes('ECONNREFUSED') && !error.message.includes('ENOTFOUND')) {
      return error.message;
    }
  }

  // Network error detection
  if (!navigator.onLine) {
    return t('errors.NETWORK_ERROR');
  }

  if (error?.message?.includes('network') || error?.message?.includes('Connection')) {
    return t('errors.NETWORK_ERROR');
  }

  // Default fallback
  return t('errors.INTERNAL_ERROR');
}

/**
 * Alternative error translator that returns structured error info
 * Useful for logging or more granular error handling
 */
export function translateErrorDetailed(
  t: (key: string, options?: any) => string,
  error: any
) {
  const code = error?.code || error?.response?.data?.code;
  const message = error?.message || error?.response?.data?.message;
  const status = error?.status || error?.response?.status;

  return {
    code,
    message: translateError(t, error),
    status,
    originalError: error,
  };
}
