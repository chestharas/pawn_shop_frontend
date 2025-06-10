'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import SettingsPopup from '@/components/SettingsPopup';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <SettingsProvider>
        {children}
        <SettingsPopup />
      </SettingsProvider>
    </AuthProvider>
  );
}