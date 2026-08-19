import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext.jsx';

// Kept separate from LanguageContext.jsx on purpose, same as useAuth:
// components import the hook, never the context object directly.
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
