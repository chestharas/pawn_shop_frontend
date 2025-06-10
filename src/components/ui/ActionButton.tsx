
// components/ui/
import React from 'react';
import { colors } from '@/lib/colors';

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  variant?: 'edit' | 'delete' | 'view';
  title?: string;
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  variant = 'edit',
  title,
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'edit':
        return {
          color: colors.primary[500],
          hoverBg: colors.primary[50]
        };
      case 'delete':
        return {
          color: colors.error[500],
          hoverBg: colors.error[50]
        };
      case 'view':
        return {
          color: colors.secondary[500],
          hoverBg: colors.secondary[50]
        };
      default:
        return {
          color: colors.primary[500],
          hoverBg: colors.primary[50]
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <button
      onClick={onClick}
      className={`p-1 rounded transition-colors ${className}`}
      style={{ color: styles.color }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = styles.hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      title={title}
    >
      {icon}
    </button>
  );
};