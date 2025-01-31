import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Background from '@/components/layout/Background';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'WookieFoot Lyrics',
    template: '%s | WookieFoot Lyrics',
  },
  description: 'Explore lyrics, albums, and music from WookieFoot. A fan-made lyrics archive and community.',
  keywords: ['WookieFoot', 'lyrics', 'music', 'albums', 'songs', 'fan site'],
  authors: [{ name: 'WookieFoot Fans' }],
  openGraph: {
    title: 'WookieFoot Lyrics',
    description: 'Explore lyrics, albums, and music from WookieFoot',
    url: 'https://wookiefoot-lyrics.com',
    siteName: 'WookieFoot Lyrics',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WookieFoot Lyrics',
    description: 'Explore lyrics, albums, and music from WookieFoot',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-black flex flex-col`}>
        {/* Background with noise texture */}
        <Background />

        {/* Main content wrapper */}
        <div className="relative flex flex-col min-h-screen">
          {/* Header */}
          <Header />

          {/* Main content */}
          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="relative z-10">
              {children}
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>

        {/* Overlay gradient for depth */}
        <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-navy-900/80 to-transparent" />
      </body>
    </html>
  );
}
