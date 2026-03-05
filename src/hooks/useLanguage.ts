import { useCallback, useState } from 'react';
import {
  EDGE_LANGUAGE_CODES,
  type EdgeLanguageCode,
  isSupportedEdgeLanguage,
} from '../data/languages';

export type UiLanguageCode = EdgeLanguageCode | 'en';

const STORAGE_KEY = 'drip-language';

function detectBrowserLanguage(): UiLanguageCode {
  if (typeof window === 'undefined') return 'en';
  const browserLanguage = window.navigator.language.slice(0, 2).toLowerCase();
  if (isSupportedEdgeLanguage(browserLanguage)) {
    return browserLanguage;
  }
  return 'en';
}

function readStoredLanguage(): UiLanguageCode | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  const normalized = stored.toLowerCase();
  if (normalized === 'en' || EDGE_LANGUAGE_CODES.includes(normalized as EdgeLanguageCode)) {
    return normalized as UiLanguageCode;
  }
  return null;
}

export function useLanguage() {
  const [language, setLanguageState] = useState<UiLanguageCode>(() => {
    return readStoredLanguage() ?? detectBrowserLanguage();
  });

  const setLanguage = useCallback((nextLanguage: UiLanguageCode) => {
    setLanguageState(nextLanguage);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    }
  }, []);

  return {
    language,
    setLanguage,
  };
}
