'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = theme === 'system' ? systemTheme : theme;
  const isDark = activeTheme === 'dark';

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative inline-flex h-11 w-24 items-center justify-between rounded-full border border-border-subtle bg-surface px-1 text-secondary transition hover:border-secondary dark:bg-[#152538] dark:text-secondary"
      aria-label="Toggle theme"
    >
      <span className={`absolute inset-y-1 ${isDark ? 'left-1' : 'right-1'} h-9 w-9 rounded-full bg-secondary transition-all duration-300`} />
      <Sun className="relative z-10 h-5 w-5" />
      <Moon className="relative z-10 h-5 w-5" />
    </button>
  );
}
