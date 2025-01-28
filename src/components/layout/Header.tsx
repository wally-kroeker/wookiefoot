'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from '../ui/SearchBar';
import { RetroCard } from '../ui/RetroCard';
import { ControlDots } from '../ui/icons/ControlDots';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/albums', label: 'Albums' },
    { href: '/lyrics', label: 'Lyrics' },
    { href: '/about', label: 'About' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="relative z-50">
      <RetroCard variant="primary" className="mx-4 mt-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative py-4 px-6">
            {/* Control dots */}
            <div className="absolute top-4 left-4">
              <ControlDots className="h-5" />
            </div>

            {/* Main header content */}
            <div className="flex flex-col items-center space-y-4">
              {/* Logo and title */}
              <div className="text-center">
                <Link href="/" className="inline-block">
                  <h1 className="text-4xl font-bold text-retro-paper">
                    WookieFoot
                    <span className="text-accent-pink">Lyrics</span>
                  </h1>
                </Link>
              </div>

              {/* Navigation - Desktop */}
              <nav className="hidden md:flex space-x-6 relative z-20">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`px-4 py-2 transition-colors duration-200 relative ${
                      isActive(href)
                        ? 'text-accent-blue'
                        : 'text-retro-paper hover:text-accent-blue'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Search Bar */}
              <div className="w-full max-w-2xl">
                <SearchBar />
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden absolute right-4 top-4 text-retro-paper hover:text-accent-blue"
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
        <div className="relative z-50">
          <RetroCard variant="secondary" className="mx-4 mt-2 md:hidden">
            <nav className="py-2">
              <div className="space-y-1 px-4">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`block py-2 transition-colors duration-200 relative ${
                      isActive(href)
                        ? 'text-accent-blue'
                        : 'text-retro-paper hover:text-accent-blue'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
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