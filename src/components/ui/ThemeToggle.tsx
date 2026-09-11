import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

import './ThemeToggle.css';

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#12100f' : '#faf6f1');
    try {
      localStorage.setItem('promptly-theme', theme);
    } catch {
      // The toggle still works when browser storage is unavailable.
    }
  }, [theme]);

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={theme === 'dark' ? 'Tukar ke mod cerah' : 'Tukar ke mod gelap'}
      title={theme === 'dark' ? 'Tukar ke mod cerah' : 'Tukar ke mod gelap'}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
      <span>{theme === 'dark' ? 'Cerah' : 'Gelap'}</span>
    </button>
  );
}
