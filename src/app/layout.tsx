import type { Metadata } from 'next';
import { Righteous, Poppins, Lora } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const righteous = Righteous({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const lora = Lora({
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-lyrics',
  display: 'swap',
});

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
    url: 'https://wookiefoot.com',
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
    <html lang="en" className={`${righteous.variable} ${poppins.variable} ${lora.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-body min-h-screen flex flex-col bg-bg-primary text-text-primary">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#2D5016] focus:text-white focus:rounded">
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
