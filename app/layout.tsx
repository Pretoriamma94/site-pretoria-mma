import type { Metadata } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const display = Bebas_Neue({ 
  subsets: ['latin'], 
  weight: '400', 
  variable: '--font-display' 
});

export const metadata: Metadata = {
  title: 'Pretoria MMA La Queue-en-Brie',
  description:
    'Pretoria MMA La Queue-en-Brie : club de MMA à La Queue-en-Brie (94) pour enfants et adultes, du débutant au compétiteur.',
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
        <CookieConsent />
      </body>
    </html>
  );
}
