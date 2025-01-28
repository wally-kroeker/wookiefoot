import { getSongBySlug, getAllSongs, getAdjacentSongs, getSongUrl } from '@/lib/utils/markdown';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const songs = await getAllSongs();
  return songs.map((song) => ({
    slug: song.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = decodeURIComponent(resolvedParams.slug);
  const song = await getSongBySlug(slug);

  if (!song) {
    return {
      title: 'Song Not Found',
    };
  }

  return {
    title: `${song.title} | WookieFoot Lyrics`,
    description: song.description,
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = decodeURIComponent(resolvedParams.slug);
  const song = await getSongBySlug(slug);

  if (!song) {
    notFound();
  }

  const { previous, next } = await getAdjacentSongs(song);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Link
            href={`/albums/${song.albumId}`}
            className="text-gray-600 hover:text-gray-900 inline-flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Album
          </Link>
          <div className="flex gap-4">
            {previous && (
              <Link
                href={getSongUrl(previous)}
                className="text-gray-600 hover:text-gray-900 inline-flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </Link>
            )}
            {next && (
              <Link
                href={getSongUrl(next)}
                className="text-gray-600 hover:text-gray-900 inline-flex items-center"
              >
                Next
                <svg
                  className="w-5 h-5 ml-2"
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
            )}
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-gray-900">{song.title}</h1>
          {song.description && (
            <p className="text-xl text-gray-600 mt-2">{song.description}</p>
          )}
        </div>

        <div className="flex space-x-4">
          {song.youtubeUrl && (
            <a
              href={song.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-red-600 hover:text-red-700"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Watch on YouTube
            </a>
          )}
          {song.spotifyUrl && (
            <a
              href={song.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-green-600 hover:text-green-700"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Listen on Spotify
            </a>
          )}
        </div>
      </div>

      <div className="prose prose-lg max-w-none">
        <div
          dangerouslySetInnerHTML={{ __html: song.lyrics || '' }}
          className="whitespace-pre-wrap"
        />
      </div>

      {song.tags && song.tags.length > 0 && (
        <div className="pt-6">
          <div className="flex flex-wrap gap-2">
            {song.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {song.contributors && song.contributors.length > 0 && (
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Contributors</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {song.contributors.map((contributor) => (
              <span
                key={contributor}
                className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
              >
                {contributor}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Discussion</h2>
        <p className="text-gray-600">
          Discussion feature coming soon! Share your thoughts and interpretations
          about this song.
        </p>
      </div>
    </div>
  );
}
