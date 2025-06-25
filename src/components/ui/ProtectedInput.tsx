// components/ui/ProtectedInput.tsx
'use client';

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';
import { colors } from '@/lib/colors';

interface ProtectedInputProps {
  type?: 'text' | 'tel' | 'email' | 'password' | 'number' | 'textarea';
  value: string | number;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  icon?: LucideIcon;
  label?: string;
  rows?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  // Navigation props
  tabIndex?: number;
  onEnterKey?: () => void;
  onArrowDown?: () => void;
  onArrowUp?: () => void;
  onEscapeKey?: () => void;
  // Validation props
  pattern?: string;
  maxLength?: number;
  minLength?: number;
  // Formatting props
  formatValue?: (value: string) => string;
  // Protection props
  isProtected?: boolean;
  protectionDelay?: number; // ms before showing actual value
}

export interface ProtectedInputRef {
  focus: () => void;
  blur: () => void;
  select: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
}

const ProtectedInput = forwardRef<ProtectedInputRef, ProtectedInputProps>(({
  type = 'text',
  value,
  onChange,
  onKeyDown,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  style,
  icon: Icon,
  label,
  rows = 3,
  min,
  max,
  step,
  tabIndex,
  onEnterKey,
  onArrowDown,
  onArrowUp,
  onEscapeKey,
  pattern,
  maxLength,
  minLength,
  formatValue,
  isProtected = false,
  protectionDelay = 1000
}, ref) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(!isProtected);
  const [displayValue, setDisplayValue] = useState(String(value));
  const protectionTimeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  // Track component mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    select: () => inputRef.current?.select(),
    getValue: () => String(value),
    setValue: (newValue: string) => onChange(newValue)
  }));

  // Handle protection display logic
  useEffect(() => {
    if (isProtected && value) {
      setDisplayValue('●'.repeat(String(value).length));
      setIsVisible(false);
      
      // Clear existing timeout
      if (protectionTimeoutRef.current) {
        clearTimeout(protectionTimeoutRef.current);
      }
      
      // Show actual value after delay
      protectionTimeoutRef.current = setTimeout(() => {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setDisplayValue(String(value));
          setIsVisible(true);
        }
      }, protectionDelay);
    } else {
      setDisplayValue(String(value));
      setIsVisible(true);
    }

    return () => {
      if (protectionTimeoutRef.current) {
        clearTimeout(protectionTimeoutRef.current);
      }
    };
  }, [value, isProtected, protectionDelay]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle navigation keys
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        onEnterKey?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowUp':
        e.preventDefault();
        onArrowUp?.();
        break;
      case 'Escape':
        e.preventDefault();
        onEscapeKey?.();
        break;
      default:
        break;
    }
    
    // Call custom onKeyDown if provided
    onKeyDown?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value;
    
    // Apply formatting if provided
    if (formatValue) {
      newValue = formatValue(newValue);
    }
    
    onChange(newValue);
  };

  const handleFocus = () => {
    if (isProtected) {
      setDisplayValue(String(value));
      setIsVisible(true);
      if (protectionTimeoutRef.current) {
        clearTimeout(protectionTimeoutRef.current);
      }
    }
  };

  const handleBlur = () => {
    if (isProtected && value) {
      setDisplayValue('●'.repeat(String(value).length));
      setIsVisible(false);
    }
  };

  const inputProps = {
    ref: inputRef as React.RefObject<HTMLInputElement & HTMLTextAreaElement>,
    value: isVisible ? String(value) : displayValue,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    onBlur: handleBlur,
    placeholder,
    required,
    disabled,
    tabIndex,
    pattern,
    maxLength,
    minLength,
    min,
    max,
    step,
    className: `w-full ${Icon ? 'pl-10' : 'pl-3'} ${
      type === 'password' ? 'pr-10' : 'pr-3'
    } py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${className}`,
    style: {
      borderColor: colors.secondary[300],
      backgroundColor: disabled ? colors.secondary[100] : 'white',
      ...style
    }
  };

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          {...inputProps}
          rows={rows}
          className={`${inputProps.className} resize-none`}
        />
      );
    }

    return (
      <input
        {...inputProps}
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
      />
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <label 
          className="block text-sm font-medium"
          style={{ color: colors.secondary[700] }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <Icon 
            className={`absolute left-3 ${type === 'textarea' ? 'top-3' : 'top-1/2 transform -translate-y-1/2'} h-4 w-4`}
            style={{ color: colors.secondary[400] }}
          />
        )}

        {/* Input Field */}
        {renderInput()}

        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Protection Indicator */}
        {isProtected && !isVisible && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
});

ProtectedInput.displayName = 'ProtectedInput';

export default ProtectedInput;