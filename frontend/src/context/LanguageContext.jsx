import React, { createContext, useEffect, useState } from 'react';
import { translations } from '../utils/translations.js';

export const LanguageContext = createContext(null);

const STORAGE_KEY = 'regebeya_lang';

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'am' || saved === 'en' ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  function toggleLanguage() {
    setLanguage((prev) => (prev === 'en' ? 'am' : 'en'));
  }

  // t(key) looks up `key` in the current language's dictionary and
  // falls back to English, then to the key itself, so a missing
  // Amharic string never breaks the UI — it just shows English.
  function t(key) {
    return translations[language]?.[key] ?? translations.en[key] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
