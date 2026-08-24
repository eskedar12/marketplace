import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext.jsx';

// Kept separate from ThemeContext.jsx on purpose, same as useAuth and
// useLanguage: components import the hook, never the context object
// directly.
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
