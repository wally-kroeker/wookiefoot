'use client';

import Link from 'next/link';
import { RetroCard } from '../ui/RetroCard';

const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Albums', href: '/albums' },
    { name: 'Lyrics', href: '/lyrics' },
    { name: 'About', href: '/about' },
  ],
  social: [
    {
      name: 'YouTube',
      href: '#',
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      name: 'Spotify',
      href: '#',
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      ),
    },
  ],
};

export default function Footer() {
  return (
    <RetroCard variant="primary" className="mt-12 mx-4">
      <footer className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <div className="pb-8 mb-8 border-b border-accent-blue/20">
            <nav className="flex flex-wrap justify-center gap-6">
              {navigation.main.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-retro-paper/80 hover:text-accent-blue transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social links */}
          <div className="flex justify-center space-x-6 mb-8">
            {navigation.social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-retro-paper/60 hover:text-accent-blue transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center text-retro-paper/60">
            <p className="text-sm">
              © {new Date().getFullYear()} WookieFoot Lyrics. Fan-made with love.
            </p>
            <p className="text-xs mt-2">
              All lyrics and content are property of their respective owners.
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute left-8 bottom-8 text-accent-pink/20 text-4xl animate-float-slow hidden lg:block">
            ♪
          </div>
          <div className="absolute right-8 bottom-12 text-accent-blue/20 text-3xl animate-float-medium hidden lg:block">
            ♫
          </div>
        </div>
      </footer>
    </RetroCard>
  );
}