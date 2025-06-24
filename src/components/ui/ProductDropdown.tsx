// components/ui/ProductDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Product {
  id: number;
  name: string;
}

interface ProductDropdownProps {
  products: Product[];
  value: string;
  onProductSelect: (productId: number, productName: string) => void;
  onCustomValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showSearch?: boolean;
}

export default function ProductDropdown({
  products,
  value,
  onProductSelect,
  onCustomValueChange,
  placeholder = "បញ្ចូលឈ្មោះផលិតផល",
  disabled = false,
  className = "",
  showSearch = true
}: ProductDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter products based on input value
  useEffect(() => {
    if (!showSearch || !value.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [value, products, showSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Add proper DOM element existence checks
      if (dropdownRef.current && 
          document.contains(dropdownRef.current) && 
          event.target instanceof Node) {
        if (!dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onCustomValueChange(newValue);
    if (showSearch) {
      setIsOpen(true);
    }
  };

  const handleProductSelect = (product: Product) => {
    onProductSelect(product.id, product.name);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleClearSelection = () => {
    onProductSelect(0, '');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        inputRef.current?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && isOpen && filteredProducts.length > 0) {
      e.preventDefault();
      handleProductSelect(filteredProducts[0]);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Field with Dropdown Button */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => !disabled && setIsOpen(true)}
          className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          placeholder={placeholder}
          disabled={disabled}
        />
        
        {/* Dropdown Toggle Button */}
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors disabled:cursor-not-allowed"
          title="ជ្រើសរើសពីបញ្ជីផលិតផលដែលមាន"
        >
          <ChevronDown 
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-[100] w-full bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-48 overflow-y-auto">
          <div className="py-1">
            {/* Clear Selection Option */}
            <button
              type="button"
              onClick={handleClearSelection}
              className="w-full px-4 py-3 text-left text-sm text-gray-500 hover:bg-gray-100 border-b border-gray-100 font-medium transition-colors"
            >
              <span className="text-red-500"></span> សម្អាតការជ្រើសរើស
            </button>
            
            {/* Product Options */}
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleProductSelect(product)}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-b border-gray-50 last:border-b-0 transition-colors"
                >
                  <span className="text-blue-500"></span> {product.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center italic">
                <span className="text-gray-400">🔍</span> មិនរកឃើញផលិតផលដែលត្រូវគ្នា
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}