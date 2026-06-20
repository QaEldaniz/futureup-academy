'use client';

import { useEffect } from 'react';

/**
 * Keeps <html lang> in sync with the active locale. The root layout renders a
 * static `lang="az"` baseline (it sits above the [locale] segment); this
 * corrects it to ru/en on the client without forcing dynamic rendering.
 */
export function HtmlLangSync({ locale }: { locale: string }) {
  useEffect(() => {
    if (locale && document.documentElement.lang !== locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return null;
}
