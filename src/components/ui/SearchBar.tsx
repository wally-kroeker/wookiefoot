'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon } from './icons/SearchIcon';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="relative flex items-center">
        <input
          type="text"
          className="block w-full rounded-lg bg-bg-card border border-border-subtle py-3 pl-4 pr-12 text-text-primary placeholder:text-text-muted font-body focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors duration-200"
          placeholder="Search lyrics, songs, albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-secondary hover:text-accent-primary transition-colors duration-200"
          aria-label="Search"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
