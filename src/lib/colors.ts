// src/lib/colors.ts
export const colors = {
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