'use client';

import type { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

interface ThemeProviderProps {
  children: ReactNode;
  attribute: 'class';
  defaultTheme: 'system' | 'light' | 'dark';
  enableSystem: boolean;
}

export function ThemeProvider({
  children,
  attribute,
  defaultTheme,
  enableSystem
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
