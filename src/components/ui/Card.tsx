
// components/ui/
import React from 'react';
import { colors } from '@/lib/colors';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  padding = true
}) => {
  return (
    <div 
      className={`rounded-lg shadow-sm border ${className}`}
      style={{ 
        backgroundColor: colors.white,
        borderColor: colors.secondary[200]
      }}
    >
      {title && (
        <div className="p-6 border-b" style={{ borderBottomColor: colors.secondary[200] }}>
          <h2 
            className="text-xl font-semibold"
            style={{ color: colors.secondary[900] }}
          >
            {title}
          </h2>
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
    </div>
  );
};
