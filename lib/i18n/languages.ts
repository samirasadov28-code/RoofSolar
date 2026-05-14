export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English',    nativeName: 'English',    flag: '🇬🇧' },
  { code: 'uk', name: 'Ukrainian',  nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'fr', name: 'French',     nativeName: 'Français',   flag: '🇫🇷' },
  { code: 'es', name: 'Spanish',    nativeName: 'Español',    flag: '🇪🇸' },
  { code: 'de', name: 'German',     nativeName: 'Deutsch',    flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português',  flag: '🇵🇹' },
  { code: 'it', name: 'Italian',    nativeName: 'Italiano',   flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch',      nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'tr', name: 'Turkish',    nativeName: 'Türkçe',     flag: '🇹🇷' },
  { code: 'zh', name: 'Chinese',    nativeName: '中文',        flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic',     nativeName: 'العربية',    flag: '🇸🇦', rtl: true },
  { code: 'hi', name: 'Hindi',      nativeName: 'हिन्दी',      flag: '🇮🇳' },
  { code: 'ru', name: 'Russian',    nativeName: 'Русский',    flag: '🏳️' },
];

export const LANGUAGE_MAP = new Map(LANGUAGES.map((l) => [l.code, l]));

export function detectBrowserLang(): string {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language?.split('-')[0] ?? 'en';
  return LANGUAGE_MAP.has(lang) ? lang : 'en';
}
