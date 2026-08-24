import React, { createContext, useEffect, useState, useCallback } from 'react';

export const ThemeContext = createContext(null);

const STORAGE_KEY = 'regebeya_theme';

// First-visit default: honor the OS/browser preference if the person
// has never toggled it here themselves. Falls back to light if
// localStorage or matchMedia are unavailable (e.g. private browsing,
// very old browsers) — same defensive pattern LanguageContext uses.
function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (err) {
    // localStorage unavailable — fall back silently
  }
  try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch (err) {
    // matchMedia unavailable — fall back silently
  }
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (err) {
      // ignore — persistence is a nice-to-have, not required to work
    }
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (next === 'light' || next === 'dark') setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
