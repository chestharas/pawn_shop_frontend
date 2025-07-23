'use client';

import { useState } from 'react';
import { useColors } from '@/hooks/useColors';
import { themes } from '@/lib/colors';
import Sidebar from './Sidebar';

interface AppWithThemeProps {
  children: React.ReactNode;
}

export default function AppWithTheme({ children }: AppWithThemeProps) {
  const { colors, setTheme } = useColors();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: colors.secondary[50] }}
    >
      {/* Optional: Theme Switcher in Header */}
      <header 
        className="h-16 flex items-center justify-between px-4 border-b"
        style={{ 
          backgroundColor: colors.white,
          borderBottomColor: colors.secondary[200]
        }}
      >
        <div className="flex items-center space-x-4">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            style={{ color: colors.secondary[600] }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 style={{ color: colors.secondary[900] }}>
            Business Management System
          </h1>
        </div>

        {/* Theme Switcher */}
        <div className="flex space-x-2">
          <button
            onClick={() => setTheme(themes.default)}
            className="px-3 py-1 rounded text-sm"
            style={{ 
              backgroundColor: themes.default.primary[500], 
              color: themes.default.white 
            }}
          >
            Orange
          </button>
          <button
            onClick={() => setTheme(themes.blue)}
            className="px-3 py-1 rounded text-sm"
            style={{ 
              backgroundColor: themes.blue.primary[500], 
              color: themes.blue.white 
            }}
          >
            Blue
          </button>
          <button
            onClick={() => setTheme(themes.purple)}
            className="px-3 py-1 rounded text-sm"
            style={{ 
              backgroundColor: themes.purple.primary[500], 
              color: themes.purple.white 
            }}
          >
            Purple
          </button>
          <button
            onClick={() => setTheme(themes.green)}
            className="px-3 py-1 rounded text-sm"
            style={{ 
              backgroundColor: themes.green.primary[500], 
              color: themes.green.white 
            }}
          >
            Green
          </button>
        </div>
      </header>

      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}