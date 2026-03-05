export interface EdgeLanguage {
  code: string;
  name: string;
  nativeName: string;
  hreflang: string;
  rtl?: boolean;
}

export const EDGE_LANGUAGE_CODES = [
  'es',
  'pt',
  'fr',
  'de',
  'ar',
  'nl',
  'ja',
  'ko',
  'no',
  'it',
  'hr',
  'sw',
  'pl',
  'tr',
] as const;

export type EdgeLanguageCode = (typeof EDGE_LANGUAGE_CODES)[number];

export const EDGE_LANGUAGES: EdgeLanguage[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Espanol', hreflang: 'es' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Portugues', hreflang: 'pt' },
  { code: 'fr', name: 'French', nativeName: 'Francais', hreflang: 'fr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', hreflang: 'de' },
  { code: 'ar', name: 'Arabic', nativeName: 'Arabic', hreflang: 'ar', rtl: true },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', hreflang: 'nl' },
  { code: 'ja', name: 'Japanese', nativeName: 'Japanese', hreflang: 'ja' },
  { code: 'ko', name: 'Korean', nativeName: 'Korean', hreflang: 'ko' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', hreflang: 'no' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', hreflang: 'it' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', hreflang: 'hr' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', hreflang: 'sw' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', hreflang: 'pl' },
  { code: 'tr', name: 'Turkish', nativeName: 'Turkce', hreflang: 'tr' },
];

export const LANGUAGE_LABELS: Record<string, string> = {
  en: 'EN',
  es: 'ES',
  pt: 'PT',
  fr: 'FR',
  de: 'DE',
  ar: 'AR',
  nl: 'NL',
  ja: 'JA',
  ko: 'KO',
  no: 'NO',
  it: 'IT',
  hr: 'HR',
  sw: 'SW',
  pl: 'PL',
  tr: 'TR',
};

export function isSupportedEdgeLanguage(language: string): language is EdgeLanguageCode {
  return EDGE_LANGUAGE_CODES.includes(language as EdgeLanguageCode);
}

export function isRtlLanguage(language: string): boolean {
  return EDGE_LANGUAGES.some((lang) => lang.code === language && lang.rtl);
}
