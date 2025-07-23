// src/lib/colors.ts
export const colors = {
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
  },
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export const colorCombinations = {
  navigation: {
    active: {
      background: colors.primary[50],
      text: colors.primary[900],
      icon: colors.primary[500],
    },
    inactive: {
      background: colors.transparent,
      text: colors.secondary[600],
      icon: colors.secondary[400],
    },
    hover: {
      background: colors.secondary[50],
      text: colors.secondary[900],
      icon: colors.secondary[500],
    },
  },
  buttons: {
    primary: {
      background: colors.primary[500],
      hover: colors.primary[600],
      active: colors.primary[700],
      text: colors.white,
      border: colors.primary[500],
    },
    secondary: {
      background: colors.secondary[100],
      hover: colors.secondary[200],
      active: colors.secondary[300],
      text: colors.secondary[700],
      border: colors.secondary[300],
    },
  },
  status: {
    success: {
      background: colors.success[50],
      text: colors.success[800],
      border: colors.success[100],
    },
    warning: {
      background: colors.warning[50],
      text: colors.warning[800],
      border: colors.warning[100],
    },
    error: {
      background: colors.error[50],
      text: colors.error[800],
      border: colors.error[100],
    },
  },
};

// Theme variants
export const themes = {
  default: {
    ...colors,
    primary: colors.primary, // Orange theme (already updated above)
  },
  blue: {
    ...colors,
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
  },
  green: {
    ...colors,
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
  },
  purple: {
    ...colors,
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
    },
  },
};