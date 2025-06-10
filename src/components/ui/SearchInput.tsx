
// components/ui/
import React from 'react';
import { Search } from 'lucide-react';
import { colors } from '@/lib/colors';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'ស្វែងរក...',
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
        style={{ color: colors.secondary[400] }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
        style={{ 
          borderColor: colors.secondary[300],
          focusRingColor: colors.primary[500]
        }}
        placeholder={placeholder}
      />
    </div>
  );
};
