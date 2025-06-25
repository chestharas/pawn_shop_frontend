'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import { Menu } from 'lucide-react';

import '@/app/globals.css'

export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Main content with proper spacing for fixed sidebar */}
        <div className={`content-transition ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        } ml-0 min-h-screen`}
        style={{ 
          position: 'relative',
          zIndex: 1,
          height: '100vh',
          overflowY: 'auto'
        }}>
          {/* Top bar for mobile menu button */}
          <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                ប្រព័ន្ធគ្រប់គ្រង
              </h1>
              <div className="w-10"></div> {/* Spacer for center alignment */}
            </div>
          </div>

          {/* Page content */}
          <main className="page-content">
            <div className="p-4 sm:p-6 lg:p-8 w-full max-w-none">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}