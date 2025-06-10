import type { Metadata } from 'next';
import './globals.css';
import ClientWrapper from '@/components/ClientWrapper';
import { SettingsProvider } from '@/contexts/SettingsContext';
import SettingsPopup from '@/components/SettingsPopup';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Business Management System',
  description: 'Professional business management dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SettingsProvider>
          <ClientWrapper>
            {children}
            {/* Move SettingsPopup inside ClientWrapper */}
            <SettingsPopup />
          </ClientWrapper>
        </SettingsProvider>
      </body>
    </html>
  );
}