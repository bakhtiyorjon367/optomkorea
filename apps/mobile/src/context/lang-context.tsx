import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import i18n from '../i18n/i18n';

type Locale = 'uz' | 'ru';

type LangContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const STORAGE_KEY = 'koruz_lang';
const DEFAULT_LOCALE: Locale = 'uz';

export const LangContext = createContext<LangContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
});

type LangProviderProps = {
  children: ReactNode;
};

/**
 * Provides active locale to the component tree and persists the choice
 * in localStorage. Syncs language changes to i18next.
 */
export function LangProvider({ children }: LangProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'uz' || stored === 'ru') {
      return stored;
    }
    return DEFAULT_LOCALE;
  });

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({ locale, setLocale }),
    [locale, setLocale],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
