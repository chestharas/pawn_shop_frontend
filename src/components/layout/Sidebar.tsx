'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Package, 
  ShoppingCart, 
  Search, 
  Coins,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import { colors, colorCombinations } from '@/lib/colors';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [localCollapsed, setLocalCollapsed] = useState(false);

  // Use prop-controlled state if provided, otherwise use local state
  const collapsed = isCollapsed ?? localCollapsed;
  const toggleCollapse = onToggleCollapse ?? (() => setLocalCollapsed(!localCollapsed));

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

      {/* Sidebar - Fixed position with proper z-index and overflow handling */}
      <div 
        className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out border-r shadow-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${collapsed ? 'w-16' : 'w-64'}`}
        style={{ 
          backgroundColor: colors.white,
          borderRightColor: colors.secondary[200]
        }}
      >
        {/* Main Container with Flexbox */}
        <div className="h-full flex flex-col">
          
          {/* Header with Logo - Fixed at top */}
          <div 
            className={`flex items-center justify-between border-b flex-shrink-0 ${
              collapsed ? 'justify-center px-2' : 'px-4'
            }`}
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
              borderBottomColor: colors.secondary[200],
              height: '4rem',
              minHeight: '4rem'
            }}
          >
            {!collapsed && (
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
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation - Scrollable middle section */}
          <nav 
            className="flex-1 px-3 py-6 overflow-y-auto overflow-x-visible"
            style={{ 
              minHeight: 0,
              maxHeight: 'calc(100vh - 8rem)'
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
                      collapsed ? 'justify-center' : ''
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
                    title={collapsed ? item.name : ''}
                  >
                    <item.icon
                      className={`h-5 w-5 transition-colors duration-200 flex-shrink-0 ${
                        collapsed ? '' : 'mr-3'
                      }`}
                      style={{
                        color: isActive 
                          ? colorCombinations.navigation.active.icon 
                          : colorCombinations.navigation.inactive.icon
                      }}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section - Profile with proper positioning for upward dropdown */}
          <div 
            className="border-t flex-shrink-0 relative"
            style={{ 
              backgroundColor: colors.white,
              borderTopColor: colors.secondary[200],
              height: '4rem',
              minHeight: '4rem',
              zIndex: 60 // Higher z-index for dropdown
            }}
          >
            {/* Profile Dropdown Container - positioned to allow upward expansion */}
            <div className="relative h-full">
              <ProfileDropdown onClose={onClose} isCollapsed={collapsed} />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Ensure dropdowns can extend beyond parent containers */
        .profile-dropdown {
          position: fixed !important;
          bottom: 4rem !important;
          left: ${collapsed ? '4rem' : '16rem'} !important;
          z-index: 9999 !important;
          transform: translateY(0) !important;
        }
        
        /* For collapsed sidebar */
        .profile-dropdown.collapsed {
          left: 4rem !important;
        }
        
        /* For expanded sidebar */
        .profile-dropdown.expanded {
          left: 16rem !important;
        }
        
        /* Override any transform that might push dropdown down */
        .profile-dropdown * {
          transform: none !important;
        }
        
        /* Ensure proper stacking context */
        body {
          overflow-x: hidden;
        }
        
        /* Fix for mobile */
        @media (max-width: 1024px) {
          .profile-dropdown {
            left: 16rem !important;
          }
        }
      `}</style>
    </>
  );
}