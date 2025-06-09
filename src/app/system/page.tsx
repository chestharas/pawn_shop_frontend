'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SystemPage() {
  const router = useRouter();

  // Redirect to product page when accessing /system
  useEffect(() => {
    router.push('/system/product');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">កំពុងបញ្ជូនទៅទំព័រផលិតផល...</p>
      </div>
    </div>
  );
}