// components/ClientWrapper.tsx - Keep it simple
'use client';

import { AuthProvider } from '@/lib/auth';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}