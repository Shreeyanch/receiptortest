import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { PreferencesProvider } from '@/lib/PreferencesContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Samparka — Digital Receipts',
  description: 'Paperless receipts for Nepal. Tap NFC, see your receipt instantly.',
  keywords: ['digital receipt', 'Nepal', 'NFC', 'paperless', 'Samparka'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: 'oklch(0.52 0.11 162)',
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        <PreferencesProvider>
          {children}
          {modal}
        </PreferencesProvider>
      </body>
    </html>
  );
}
