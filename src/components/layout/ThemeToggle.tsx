'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      setIsDark(true);
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  // Prevent hydration mismatch by rendering a placeholder until mounted
  if (!mounted) {
    return (
      <button
        type="button"
        className="p-2 text-accent-secondary hover:opacity-80 transition-opacity text-lg leading-none"
        aria-label="Toggle theme"
      >
        <span className="inline-block w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="p-2 text-accent-secondary hover:opacity-80 transition-opacity text-lg leading-none"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {isDark ? '\u2600' : '\u263E'}
    </button>
  );
}
