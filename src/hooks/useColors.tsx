'use client';

import React, { createContext, useContext, useState } from 'react';
import { colors, themes } from '@/lib/colors';

type ColorScheme = typeof colors;
type Theme = typeof themes.default;

interface ColorContextType {
  colors: ColorScheme;
  setTheme: (theme: Theme) => void;
  currentTheme: string;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

interface ColorProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
}

export function ColorProvider({ children, initialTheme = themes.default }: ColorProviderProps) {
  const [currentColors, setCurrentColors] = useState<ColorScheme>(initialTheme);
  const [currentTheme, setCurrentTheme] = useState('default');

  const setTheme = (theme: Theme) => {
    setCurrentColors(theme);
    // Determine theme name
    if (theme === themes.default) setCurrentTheme('default');
    else if (theme === themes.blue) setCurrentTheme('blue');
    else if (theme === themes.green) setCurrentTheme('green');
    else if (theme === themes.purple) setCurrentTheme('purple');
  };

  return (
    <ColorContext.Provider value={{ colors: currentColors, setTheme, currentTheme }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColors() {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('useColors must be used within a ColorProvider');
  }
  return context;
} 