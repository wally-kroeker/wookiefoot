'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchResult } from '@/types';
import { SearchIcon } from './icons/SearchIcon';
import { RetroCard } from './RetroCard';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // TODO: Implement actual search functionality
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [router]);

  return (
    <RetroCard variant="primary" className="w-full max-w-xl mx-auto">
      <div className="relative flex items-center">
        <input
          type="text"
          className="
            block w-full rounded-lg 
            bg-navy-900/50 
            py-3 pl-4 pr-12
            text-retro-paper placeholder:text-gray-400
            border-2 border-accent-blue/20
            focus:border-accent-blue/40 focus:ring-2 focus:ring-accent-blue/20
            transition-colors duration-200
            font-medium
          "
          placeholder="Search lyrics..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length >= 2) {
              handleSearch(e.target.value);
            }
          }}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          {isSearching ? (
            <svg
              className="animate-spin h-5 w-5 text-accent-blue"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <SearchIcon className="h-5 w-5 text-accent-blue" />
          )}
        </div>
      </div>

      {/* Search results dropdown */}
      {results.length > 0 && (
        <div className="absolute z-10 mt-2 w-full">
          <RetroCard variant="secondary">
            <ul className="max-h-60 overflow-auto py-1">
              {results.map((result) => (
                <li
                  key={`${result.type}-${result.id}`}
                  className="cursor-pointer select-none px-4 py-2 hover:bg-navy-700/50 text-retro-paper"
                  onClick={() => {
                    router.push(result.url);
                    setQuery('');
                    setResults([]);
                  }}
                >
                  <div className="flex items-center">
                    <span className="ml-3 truncate">
                      {result.title}
                      <span className="ml-1 text-sm text-gray-400">
                        ({result.type})
                      </span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </RetroCard>
        </div>
      )}
    </RetroCard>
  );
}