import type { Metadata } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { NewsPopupHost } from '@/components/NewsPopupHost';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const display = Bebas_Neue({ 
  subsets: ['latin'], 
  weight: '400', 
  variable: '--font-display' 
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pretoriamma94.fr'),
  title: 'Pretoria MMA La Queue-en-Brie',
  description:
    'Pretoria MMA La Queue-en-Brie : club de MMA à La Queue-en-Brie (94) pour enfants et adultes, du débutant au compétiteur.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Pretoria MMA La Queue-en-Brie',
    title: 'Pretoria MMA La Queue-en-Brie',
    description:
      'Club de MMA à La Queue-en-Brie (94) pour enfants et adultes, du débutant au compétiteur.',
    images: [{ url: '/images/logo.png', width: 1024, height: 1024, alt: 'Pretoria MMA' }],
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${display.variable}`}>
      <body suppressHydrationWarning>
        <Navbar />
        <main>
          {children}
        </main>
        <Footer />
        <NewsPopupHost />
        <CookieConsent />
      </body>
    </html>
  );
}
