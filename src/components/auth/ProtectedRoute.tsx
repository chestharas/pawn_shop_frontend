'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      if (!loading) {
        // Not authenticated at all
        if (!isAuthenticated) {
          router.push(redirectTo);
          return;
        }

        // Require admin but user is not admin
        if (requireAdmin && user?.role !== 'admin') {
          router.push('/unauthorized');
          return;
        }

        // All checks passed
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [user, loading, isAuthenticated, requireAdmin, router, redirectTo]);

  // Show loading spinner while checking auth or redirecting
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">កំពុងផ្ទៀងផ្ទាត់...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or authorized
  if (!isAuthenticated || (requireAdmin && user?.role !== 'admin')) {
    return null;
  }

  return <>{children}</>;
}