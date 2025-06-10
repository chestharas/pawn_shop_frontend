// components/ui/Button.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { colors } from '@/lib/colors';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary[500],
          color: colors.white,
          hoverBg: colors.primary[600],
          focusRing: colors.primary[500]
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary[100],
          color: colors.secondary[700],
          hoverBg: colors.secondary[200],
          focusRing: colors.secondary[300],
          border: `1px solid ${colors.secondary[300]}`
        };
      case 'danger':
        return {
          backgroundColor: colors.error[500],
          color: colors.white,
          hoverBg: colors.error[600],
          focusRing: colors.error[500]
        };
      default:
        return {
          backgroundColor: colors.primary[500],
          color: colors.white,
          hoverBg: colors.primary[600],
          focusRing: colors.primary[500]
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const styles = getVariantStyles();
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${getSizeStyles()} ${className}`}
      style={{
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        border: styles.border || 'none',
        focusRingColor: styles.focusRing
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = styles.hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = styles.backgroundColor;
        }
      }}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
