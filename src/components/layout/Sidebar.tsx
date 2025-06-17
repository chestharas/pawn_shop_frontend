'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { 
  Package, 
  ShoppingCart, 
  Search, 
  Coins,
  X,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import { colors, colorCombinations } from '@/lib/colors';

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

const navigation: NavItem[] = [
  { 
    name: 'បន្ថែមផលិតផល', 
    href: '/system/product', 
    icon: Package 
  },
  { 
    name: 'កត់ត្រាការលក់និងទិញ', 
    href: '/system/buyandsell', 
    icon: ShoppingCart 
  },
  { 
    name: 'រុករកការកត់ត្រាលក់និងទិញ', 
    href: '/system/searchorderclient', 
    icon: Search 
  },
  { 
    name: 'កត់ត្រាការបញ្ចាំ', 
    href: '/system/pawn', 
    icon: Coins 
  },
  { 
    name: 'រុករកការបញ្ចាំ', 
    href: '/system/searchpawnclient', 
    icon: Search 
  }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isItemActive = (href: string): boolean => {
    return pathname === href;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div 
            className="fixed inset-0 bg-opacity-75"
            style={{ backgroundColor: colors.secondary[600] }}
          ></div>
        </div>
      )}

      {/* Sidebar - Fixed position with zoom-safe positioning */}
      <div 
        className={`fixed top-0 left-0 z-50 shadow-lg transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-16' : 'w-64'}`}
        style={{ 
          backgroundColor: colors.white,
          height: '100vh',
          minHeight: '100vh',
          maxHeight: '100vh',
          // Remove zoom-related transforms that interfere with dropdown positioning
          position: 'fixed',
          zIndex: 50
        }}
      >
        {/* Main Container with Flexbox */}
        <div className="h-full flex flex-col relative" style={{ height: '100vh' }}>
          
          {/* Header with Logo - Fixed at top */}
          <div 
            className={`flex items-center justify-between border-b flex-shrink-0 ${
              isCollapsed ? 'justify-center px-2' : 'px-4'
            }`}
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
              borderBottomColor: colors.secondary[200],
              height: '4rem',
              minHeight: '4rem'
            }}
          >
            {!isCollapsed && (
              <h1 
                className="text-xl font-bold truncate"
                style={{ color: colors.white }}
              >
                ប្រព័ន្ធគ្រប់គ្រង
              </h1>
            )}
            
            {/* Mobile close button */}
            <button
              className="lg:hidden transition-colors duration-200 flex-shrink-0"
              style={{ color: colors.white }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.secondary[200];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.white;
              }}
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>

            {/* Desktop collapse button */}
            <button
              className="hidden lg:block transition-colors duration-200 flex-shrink-0"
              style={{ color: colors.white }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.secondary[200];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.white;
              }}
              onClick={toggleCollapse}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation - Scrollable middle section */}
          <nav 
            className="flex-1 px-3 py-6 overflow-y-auto"
            style={{ 
              height: 'calc(100vh - 8rem)',
              minHeight: 0
            }}
          >
            <div className="space-y-3">
              {navigation.map((item) => {
                const isActive = isItemActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isCollapsed ? 'justify-center' : ''
                    }`}
                    style={{
                      backgroundColor: isActive 
                        ? colorCombinations.navigation.active.background 
                        : colorCombinations.navigation.inactive.background,
                      color: isActive 
                        ? colorCombinations.navigation.active.text 
                        : colorCombinations.navigation.inactive.text,
                      minHeight: '2.5rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = colorCombinations.navigation.hover.background;
                        e.currentTarget.style.color = colorCombinations.navigation.hover.text;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = colorCombinations.navigation.inactive.background;
                        e.currentTarget.style.color = colorCombinations.navigation.inactive.text;
                      }
                    }}
                    onClick={onClose}
                    title={isCollapsed ? item.name : ''}
                  >
                    <item.icon
                      className={`h-5 w-5 transition-colors duration-200 flex-shrink-0 ${
                        isCollapsed ? '' : 'mr-3'
                      }`}
                      style={{
                        color: isActive 
                          ? colorCombinations.navigation.active.icon 
                          : colorCombinations.navigation.inactive.icon
                      }}
                    />
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section - Profile with proper containment */}
          <div 
            className="border-t flex-shrink-0 relative"
            style={{ 
              backgroundColor: colors.white,
              borderTopColor: colors.secondary[200],
              height: '4rem',
              minHeight: '4rem',
              // Ensure this container properly contains the dropdown
              position: 'relative',
              zIndex: 1,
              overflow: 'visible' // Allow dropdown to extend outside
            }}
          >
            {/* Profile Button - Contained within sidebar bounds */}
            <div className="relative h-full">
              <ProfileDropdown onClose={onClose} isCollapsed={isCollapsed} />
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS to ensure dropdown stays within screen bounds */}
      <style jsx global>{`
        /* Ensure profile dropdown positions correctly regardless of zoom */
        .profile-dropdown {
          position: absolute !important;
          bottom: 100% !important;
          left: 0 !important;
          right: 0 !important;
          margin-bottom: 0.5rem !important;
          max-width: ${isCollapsed ? '200px' : '100%'} !important;
          z-index: 1000 !important;
        }
        
        /* For collapsed sidebar, position dropdown to the right */
        .profile-dropdown.collapsed {
          left: 100% !important;
          right: auto !important;
          bottom: 0 !important;
          margin-left: 0.5rem !important;
          margin-bottom: 0 !important;
          width: 200px !important;
        }
        
        /* Prevent dropdown from going off-screen */
        .profile-dropdown {
          transform: none !important;
        }
        
        /* Ensure dropdown content is visible */
        .profile-dropdown > div {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          border: 1px solid #e5e7eb !important;
        }
      `}</style>
    </>
  );
}