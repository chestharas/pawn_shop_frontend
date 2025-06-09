import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientWrapper from '@/components/ClientWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Business Management System',
  description: 'Professional business management dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('Root Layout is rendering'); // Debug log
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}