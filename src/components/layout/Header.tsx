'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from '../ui/SearchBar';
import { RetroCard } from '../ui/RetroCard';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/albums', label: 'Albums' },
    { href: '/lyrics', label: 'Lyrics' },
    { href: '/about', label: 'About' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className={`relative z-50 transition-all duration-300 ${isScrolled ? 'sticky top-0' : ''}`}>
      <RetroCard variant="primary" className={`mx-4 mt-4 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-xl border-accent-green/50' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="relative py-3 px-4">
            {/* Main header content */}
            <div className="flex flex-col items-center space-y-3">
              {/* Logo and title - Compact */}
              <div className="text-center">
                <Link href="/" className="inline-block group">
                  <h1 className="text-2xl md:text-3xl font-bold text-retro-paper transition-all duration-300 group-hover:scale-105">
                    <span className="cosmic-glow">WookieFoot</span>
                    <span className="text-gradient ml-2">Lyrics</span>
                  </h1>
                </Link>
              </div>

              {/* Navigation - Desktop inline with search */}
              <div className="w-full flex flex-col md:flex-row items-center gap-3 md:gap-4">
                <nav className="hidden md:flex space-x-4 relative z-20">
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`px-3 py-1.5 text-sm transition-all duration-300 relative group ${
                        isActive(href)
                          ? 'text-accent-green'
                          : 'text-retro-paper/80 hover:text-accent-orange'
                      }`}
                    >
                      {label}
                      {isActive(href) && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-green-orange rounded-full" />
                      )}
                    </Link>
                  ))}
                </nav>

                {/* Search Bar */}
                <div className="w-full md:flex-1 max-w-xl">
                  <SearchBar />
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden absolute right-4 top-4 text-retro-paper hover:text-accent-orange transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </RetroCard>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="relative z-50 animate-fade-in">
          <RetroCard variant="secondary" className="mx-4 mt-2 md:hidden border-accent-teal/50">
            <nav className="py-2">
              <div className="space-y-1 px-4">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`block py-2 transition-all duration-300 relative ${
                      isActive(href)
                        ? 'text-accent-green cosmic-glow'
                        : 'text-retro-paper hover:text-accent-orange'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                    {isActive(href) && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-green-orange rounded-r-full" />
                    )}
                  </Link>
                ))}
              </div>
            </nav>
          </RetroCard>
        </div>
      )}
    </header>
  );
}