'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { 
  User, 
  ChevronDown, 
  ChevronUp, 
  Home, 
  UserCircle, 
  Settings, 
  LogOut 
} from 'lucide-react';

interface ProfileDropdownProps {
  onClose?: () => void;
  isCollapsed?: boolean;
}

export default function ProfileDropdown({ onClose, isCollapsed = false }: ProfileDropdownProps) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleDashboardClick = () => {
    setShowDropdown(false);
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const handleSettingsClick = () => {
    // Add settings functionality here
    setShowDropdown(false);
    console.log('Opening settings...');
  };

  const handleProfileClick = () => {
    // Add profile functionality here
    setShowDropdown(false);
    console.log('Opening profile...');
  };

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={handleDropdownToggle}
        className={`w-full flex items-center text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50 ${
          isCollapsed ? 'justify-center p-2' : 'justify-between p-4'
        }`}
        title={isCollapsed ? user?.phone_number : ''}
      >
        <div className={`flex items-center ${isCollapsed ? '' : 'flex-1'}`}>
          <div className="flex-shrink-0">
            <div className={`rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center ${
              isCollapsed ? 'h-8 w-8' : 'h-10 w-10'
            }`}>
              <User className={`text-white ${isCollapsed ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.phone_number}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role} • អនឡាញ
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="flex-shrink-0">
            {showDropdown ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className={`absolute bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 ${
          isCollapsed 
            ? 'bottom-0 left-full ml-2 w-48' 
            : 'bottom-full left-0 right-0 mb-1'
        }`}>
          <div className="py-1">
            {/* Dashboard Link */}
            <Link
              href="/system"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              onClick={handleDashboardClick}
            >
              <Home className="mr-3 h-4 w-4 text-gray-400" />
              ទៅទំព័រដើម
            </Link>

            {/* Profile */}
            <button 
              onClick={handleProfileClick}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <UserCircle className="mr-3 h-4 w-4 text-gray-400" />
              ព័ត៌មានផ្ទាល់ខ្លួន
            </button>

            {/* Settings */}
            <button 
              onClick={handleSettingsClick}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <Settings className="mr-3 h-4 w-4 text-gray-400" />
              ការកំណត់
            </button>

            {/* Divider */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="mr-3 h-4 w-4" />
              ចាកចេញ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}