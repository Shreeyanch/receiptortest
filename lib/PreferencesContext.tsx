'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CurrencyCode } from '@/lib/formatCurrency';
import type { LanguageCode } from '@/lib/translations';
import { translations } from '@/lib/translations';

interface PreferencesContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  language: LanguageCode;
  setLanguage: (l: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('NPR');
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('samparka_preferences');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        // Validate currency: must be one of the known codes, not old format like 'NPR (Rs)'
        if (p.currency && ['NPR', 'USD', 'EUR', 'INR'].includes(p.currency)) {
          setCurrencyState(p.currency as CurrencyCode);
        }
        // Validate language
        if (p.language && ['en', 'ne'].includes(p.language)) {
          setLanguageState(p.language as LanguageCode);
        }
      } catch {}
    }
    setLoaded(true);
  }, []);

  // Save to localStorage whenever preferences change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('samparka_preferences', JSON.stringify({ currency, language }));
    }
  }, [currency, language, loaded]);

  const setCurrency = useCallback((c: CurrencyCode) => setCurrencyState(c), []);
  const setLanguage = useCallback((l: LanguageCode) => setLanguageState(l), []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let str = translations[language]?.[key] ?? translations.en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [language]
  );

  return (
    <PreferencesContext.Provider value={{ currency, setCurrency, language, setLanguage, t }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}

export function useTranslation() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('useTranslation must be used within PreferencesProvider');
  return { t: ctx.t, language: ctx.language };
}
