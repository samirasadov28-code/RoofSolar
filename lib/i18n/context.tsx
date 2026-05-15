'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Translations } from './types';
import { LANGUAGES, detectBrowserLang } from './languages';

import en from './en';
import uk from './uk';
import fr from './fr';
import es from './es';
import de from './de';
import pt from './pt';
import it from './it';
import nl from './nl';
import tr from './tr';
import zh from './zh';
import ar from './ar';
import hi from './hi';
import ru from './ru';
import bn from './bn';
import ja from './ja';
import id from './id';

const TRANSLATIONS: Record<string, Translations> = {
  en, uk, fr, es, de, pt, it, nl, tr, zh, ar, hi, ru, bn, ja, id,
};

const STORAGE_KEY = 'roofsolar_lang';

interface LanguageContextValue {
  lang: string;
  t: Translations;
  setLang: (code: string) => void;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  t: en,
  setLang: () => {},
  isRtl: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<string>('en');

  useEffect(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const initial = stored && TRANSLATIONS[stored] ? stored : detectBrowserLang();
    setLangState(initial);
  }, []);

  const setLang = (code: string) => {
    if (!TRANSLATIONS[code]) return;
    setLangState(code);
    localStorage.setItem(STORAGE_KEY, code);
  };

  const langMeta = LANGUAGES.find((l) => l.code === lang);
  const isRtl = langMeta?.rtl ?? false;
  const t = TRANSLATIONS[lang] ?? en;

  return (
    <LanguageContext.Provider value={{ lang, t, setLang, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT(): Translations {
  return useContext(LanguageContext).t;
}

export function useLang(): { lang: string; setLang: (code: string) => void; isRtl: boolean } {
  const { lang, setLang, isRtl } = useContext(LanguageContext);
  return { lang, setLang, isRtl };
}
