'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import type { FuseResultMatch } from 'fuse.js';
import WFCard from '@/components/ui/WFCard';
import SongResult from '@/components/ui/SongResult';

interface SearchSong {
  title: string;
  album: string;
  slug: string;
  albumDirectory: string;
  duration: string;
  lyrics: string;
  tags: string[];
}

interface SearchResult {
  title: string;
  album: string;
  slug: string;
  snippet?: string;
  score?: number;
}

function extractSnippet(
  matches: readonly FuseResultMatch[] | undefined,
  song: SearchSong,
  query: string
): string | undefined {
  if (!matches) return undefined;

  // Prefer lyrics matches for snippets
  const lyricsMatch = matches.find((m) => m.key === 'lyrics');
  if (lyricsMatch && lyricsMatch.indices.length > 0) {
    const text = song.lyrics;
    const [start, end] = lyricsMatch.indices[0];
    const snippetStart = Math.max(0, start - 30);
    const snippetEnd = Math.min(text.length, end + 31);
    const prefix = snippetStart > 0 ? '...' : '';
    const suffix = snippetEnd < text.length ? '...' : '';
    const before = text.slice(snippetStart, start);
    const matched = text.slice(start, end + 1);
    const after = text.slice(end + 1, snippetEnd);
    return `${prefix}${before}<mark class="bg-accent-primary/20 text-accent-primary rounded px-0.5">${matched}</mark>${after}${suffix}`;
  }

  // Fall back to title or album match
  const titleMatch = matches.find((m) => m.key === 'title');
  if (titleMatch && titleMatch.indices.length > 0) {
    const text = song.title;
    const [start, end] = titleMatch.indices[0];
    const before = text.slice(0, start);
    const matched = text.slice(start, end + 1);
    const after = text.slice(end + 1);
    return `Title: ${before}<mark class="bg-accent-primary/20 text-accent-primary rounded px-0.5">${matched}</mark>${after}`;
  }

  // Try a simple text search on lyrics as fallback
  if (query && song.lyrics) {
    const idx = song.lyrics.toLowerCase().indexOf(query.toLowerCase());
    if (idx !== -1) {
      const snippetStart = Math.max(0, idx - 30);
      const snippetEnd = Math.min(song.lyrics.length, idx + query.length + 30);
      const prefix = snippetStart > 0 ? '...' : '';
      const suffix = snippetEnd < song.lyrics.length ? '...' : '';
      const before = song.lyrics.slice(snippetStart, idx);
      const matched = song.lyrics.slice(idx, idx + query.length);
      const after = song.lyrics.slice(idx + query.length, snippetEnd);
      return `${prefix}${before}<mark class="bg-accent-primary/20 text-accent-primary rounded px-0.5">${matched}</mark>${after}${suffix}`;
    }
  }

  return undefined;
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [songs, setSongs] = useState<SearchSong[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchSong> | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(!!initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch search index on mount
  useEffect(() => {
    async function loadIndex() {
      try {
        const res = await fetch('/api/search-index');
        const data = await res.json();
        const songData: SearchSong[] = data.songs;
        setSongs(songData);

        const fuseInstance = new Fuse(songData, {
          keys: [
            { name: 'title', weight: 2 },
            { name: 'album', weight: 1.5 },
            { name: 'lyrics', weight: 1 },
            { name: 'tags', weight: 0.5 },
          ],
          includeMatches: true,
          threshold: 0.4,
          minMatchCharLength: 3,
          includeScore: true,
          ignoreLocation: true,
        });
        setFuse(fuseInstance);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    }
    loadIndex();
  }, []);

  // Run search when fuse is ready and there's an initial query
  useEffect(() => {
    if (fuse && initialQuery) {
      performSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuse]);

  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!fuse || !searchQuery.trim()) {
        setResults([]);
        setSearched(!!searchQuery.trim());
        return;
      }

      const fuseResults = fuse.search(searchQuery);
      const mapped: SearchResult[] = fuseResults.map((result) => ({
        title: result.item.title,
        album: result.item.album,
        slug: result.item.slug,
        snippet: extractSnippet(result.matches, result.item, searchQuery),
        score: result.score,
      }));

      setResults(mapped);
      setSearched(true);
    },
    [fuse]
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        // Update URL with shallow routing
        const params = new URLSearchParams();
        if (value.trim()) {
          params.set('q', value.trim());
        }
        const newUrl = value.trim() ? `/search?${params.toString()}` : '/search';
        router.replace(newUrl, { scroll: false });

        performSearch(value);
      }, 300);
    },
    [performSearch, router]
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <WFCard>
          <div className="flex items-center justify-center gap-3 py-8">
            <svg
              className="animate-spin h-5 w-5 text-accent-primary"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-text-muted font-body">
              Loading search index...
            </span>
          </div>
        </WFCard>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl text-text-primary mb-8">Search</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Search songs, lyrics, albums..."
        className="w-full bg-bg-card border border-border-subtle rounded-xl px-4 py-3 text-lg text-text-primary placeholder:text-text-muted font-body focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 focus:outline-none transition-all duration-200"
        autoFocus
      />

      {searched && query.trim() && (
        <p className="text-text-muted text-sm mt-4 font-body">
          {results.length} {results.length === 1 ? 'result' : 'results'} for &ldquo;{query.trim()}&rdquo;
        </p>
      )}

      {!query.trim() && !searched && (
        <p className="text-text-muted text-sm mt-4 font-body">
          Search across all WookieFoot lyrics — type a phrase, lyric, or song title
        </p>
      )}

      {!query.trim() && searched && (
        <p className="text-text-muted text-sm mt-4 font-body">
          Search across all WookieFoot lyrics — type a phrase, lyric, or song title
        </p>
      )}

      {searched && query.trim() && results.length > 0 && (
        <div className="space-y-2 mt-6">
          {results.map((result) => (
            <SongResult
              key={result.slug}
              title={result.title}
              album={result.album}
              slug={result.slug}
              snippet={result.snippet}
              score={result.score}
            />
          ))}
        </div>
      )}

      {searched && query.trim() && results.length === 0 && (
        <WFCard className="mt-6">
          <p className="text-text-muted text-center py-4 font-body">
            No songs found. Try different words or check spelling.
          </p>
        </WFCard>
      )}
    </div>
  );
}
