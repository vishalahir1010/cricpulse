import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(undefined);
const STORAGE_KEY = 'cricpulse-theme'; // 'dark' | 'light' | 'system'

function getSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  // `mode` is what's stored/selected — 'system' means "follow the OS".
  // `theme` is the resolved dark/light value actually applied to the DOM.
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system');
  const [theme, setTheme] = useState(() => (mode === 'system' ? getSystemTheme() : mode));

  // Auto-detect: while in 'system' mode, follow OS light/dark changes live
  // (e.g. the OS switching at sunset) without needing a page reload.
  useEffect(() => {
    if (mode !== 'system') return undefined;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setTheme(e.matches ? 'dark' : 'light');
    setTheme(getSystemTheme());
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  // Manual toggle explicitly picks dark or light and stops following the OS.
  const toggleTheme = useCallback(() => {
    setMode((prevMode) => {
      const current = prevMode === 'system' ? getSystemTheme() : prevMode;
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
      return next;
    });
  }, []);

  const useSystemTheme = useCallback(() => setMode('system'), []);

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, useSystemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
