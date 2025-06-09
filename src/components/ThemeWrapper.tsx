'use client';

import { ColorProvider } from '@/hooks/useColors';
import { themes } from '@/lib/colors';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  return (
    <ColorProvider initialTheme={themes.default}>
      {children}
    </ColorProvider>
  );
}