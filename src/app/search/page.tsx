import { getAllSongs } from '@/lib/utils/markdown';
import Link from 'next/link';
import type { Metadata } from 'next';
import { RetroCard } from '@/components/ui/RetroCard';

export const metadata: Metadata = {
  title: 'Search Results | WookieFoot Fan Site',
  description: 'Search through WookieFoot lyrics and albums',
};

interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const query = (resolvedSearchParams?.q || '').toLowerCase();
  const songs = await getAllSongs();

  const results = songs.filter((song) => {
    const searchableContent = [
      song.title,
      song.description,
      song.lyrics,
      ...(song.tags || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableContent.includes(query);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <RetroCard variant="primary" className="p-8 hover-lift">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-retro-paper cosmic-glow">
            {query ? (
              <>
                Search Results for "<span className="text-gradient">{query}</span>"
                <span className="text-gray-400 text-lg ml-2">
                  ({results.length} results)
                </span>
              </>
            ) : (
              <span className="text-gradient">Search</span>
            )}
          </h1>

          {!query && (
            <p className="text-gray-300">
              Enter a search term to find songs, lyrics, and albums.
            </p>
          )}
        </div>
      </RetroCard>

      {query && (
        <div className="space-y-6">
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((song) => (
                <RetroCard key={song.id} variant="secondary" className="p-6 hover-lift border-accent-teal/30 hover:border-accent-green/50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <Link
                        href={`/lyrics/${song.slug}`}
                        className="text-xl font-semibold text-retro-paper hover:text-gradient transition-all duration-300"
                      >
                        {song.title}
                      </Link>
                      {song.description && (
                        <p className="text-gray-300">{song.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mt-2">
                        <Link
                          href={`/albums/${song.albumId}`}
                          className="hover:text-accent-green transition-colors duration-300"
                        >
                          View Album
                        </Link>
                        {song.youtubeUrl && (
                          <a
                            href={song.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-orange hover:text-accent-orange-light transition-colors duration-300"
                          >
                            YouTube
                          </a>
                        )}
                        {song.spotifyUrl && (
                          <a
                            href={song.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-green hover:text-accent-green-light transition-colors duration-300"
                          >
                            Spotify
                          </a>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/lyrics/${song.slug}`}
                      className="ml-4 flex-shrink-0 text-accent-green hover:text-accent-orange transition-colors duration-300"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                  {song.tags && song.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {song.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-green/20 text-retro-paper/80 border border-accent-green/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </RetroCard>
              ))}
            </div>
          ) : (
            <RetroCard variant="secondary" className="text-center py-12 hover-lift">
              <p className="text-gray-300 text-lg">
                No results found for "<span className="text-gradient">{query}</span>". Try a different search term.
              </p>
            </RetroCard>
          )}
        </div>
      )}
    </div>
  );
}
