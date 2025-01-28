import { getAllSongs } from '@/lib/utils/markdown';
import Link from 'next/link';
import type { Metadata } from 'next';

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
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {query ? (
            <>
              Search Results for "{query}"
              <span className="text-gray-500 text-lg ml-2">
                ({results.length} results)
              </span>
            </>
          ) : (
            'Search'
          )}
        </h1>

        {!query && (
          <p className="text-gray-600">
            Enter a search term to find songs, lyrics, and albums.
          </p>
        )}
      </div>

      {query && (
        <div className="space-y-6">
          {results.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {results.map((song) => (
                <div key={song.id} className="py-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <Link
                        href={`/lyrics/${song.slug}`}
                        className="text-xl font-semibold text-gray-900 hover:text-gray-700"
                      >
                        {song.title}
                      </Link>
                      {song.description && (
                        <p className="text-gray-600">{song.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <Link
                          href={`/albums/${song.albumId}`}
                          className="hover:text-gray-700"
                        >
                          View Album
                        </Link>
                        {song.youtubeUrl && (
                          <a
                            href={song.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-700"
                          >
                            YouTube
                          </a>
                        )}
                        {song.spotifyUrl && (
                          <a
                            href={song.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700"
                          >
                            Spotify
                          </a>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/lyrics/${song.slug}`}
                      className="ml-4 flex-shrink-0"
                    >
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                    <div className="mt-2 flex flex-wrap gap-2">
                      {song.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No results found for "{query}". Try a different search term.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
