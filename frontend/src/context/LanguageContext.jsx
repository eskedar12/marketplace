import React, { createContext, useEffect, useState, useCallback } from 'react';
import { translations } from '../utils/translations.js';

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ' },
  { code: 'ti', label: 'Tigrigna', nativeLabel: 'ትግርኛ' },
  { code: 'om', label: 'Oromo', nativeLabel: 'Oromoo' },
];

export const LanguageContext = createContext(null);

const STORAGE_KEY = 'regebeya_lang';
const DEFAULT_LANGUAGE = 'en';

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) return saved;
  } catch (err) {
    // localStorage unavailable (e.g. private browsing) — fall back silently
  }
  return DEFAULT_LANGUAGE;
}

// Resolves a dotted key like "navbar.cart" against a language's nested
// translation object. Falls back to English, then to the raw key
// itself, so a missing translation never crashes the page — it just
// shows English (or the key) instead of a blank string.
function resolveKey(dict, key) {
  return key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), dict);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (err) {
      // ignore — persistence is a nice-to-have, not required for the app to work
    }
  }, [language]);

  const setLanguage = useCallback((code) => {
    if (translations[code]) setLanguageState(code);
  }, []);

  // Cycles en -> am -> ti -> om -> en. Kept for any old call sites that
  // still expect a simple toggle; the navbar itself now uses a
  // dropdown via setLanguage so the person can jump straight to the
  // language they want.
  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const idx = LANGUAGES.findIndex((l) => l.code === prev);
      return LANGUAGES[(idx + 1) % LANGUAGES.length].code;
    });
  }, []);

  // t(key, vars?) — vars lets a string carry a placeholder like "{count}"
  // that gets swapped in after translation, so word order can differ
  // per language without breaking the interpolation.
  const t = useCallback(
    (key, vars) => {
      let str = resolveKey(translations[language], key);
      if (str === undefined) str = resolveKey(translations[DEFAULT_LANGUAGE], key);
      if (str === undefined) return key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
        });
      }
      return str;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}
