'use client';

import { useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'neksti-theme-mode';

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') {
      setMode(saved);
    }
  }, []);

  const toggle = () => {
    setMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return { mode, toggle, isDark: mode === 'dark' };
}
