import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import WFCard from '@/components/ui/WFCard';
import { AlbumCover } from '@/components/ui/AlbumCover';
import BandcampLink from '@/components/ui/BandcampLink';
import { getAlbumById, formatDuration, getSongUrl } from '@/lib/utils/markdown';
import type { Track } from '@/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

// generateStaticParams disabled — getAllAlbums() fetches from the API at
// localhost which is unavailable during build. Will use dynamic rendering.
// export async function generateStaticParams() {
//   const albums = await getAllAlbums();
//   return albums.map((album) => ({ id: String(album.id) }));
// }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  const albumId = decodeURIComponent(id);
  const album = await getAlbumById(albumId);

  if (!album) {
    return {
      title: 'Album Not Found | WookieFoot Lyrics',
      description: 'The requested album could not be found.',
    };
  }

  return {
    title: album.title,
    description: album.description || `Browse all tracks from ${album.title} by WookieFoot.`,
  };
}

export default async function AlbumPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  const albumId = decodeURIComponent(id);
  const album = await getAlbumById(albumId);

  if (!album) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MusicAlbum',
            name: album.title,
            byArtist: { '@type': 'MusicGroup', name: 'WookieFoot' },
            numTracks: album.tracks?.length || 0,
            datePublished: album.year,
          }),
        }}
      />
      {/* Back Navigation */}
      <Link
        href="/albums"
        className="inline-flex items-center gap-1 text-text-secondary hover:text-accent-primary transition-colors duration-200 font-body text-sm"
      >
        &larr; Back to Albums
      </Link>

      {/* Album Header */}
      <WFCard variant="elevated">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <AlbumCover
            src={album.coverArt}
            albumTitle={album.title}
            size="lg"
          />
          <div className="flex-1 space-y-3 text-center md:text-left">
            <h1 className="font-display text-3xl text-text-primary">
              {album.title}
            </h1>
            <p className="text-accent-secondary text-lg">{album.year}</p>
            <p className="text-text-muted">
              {album.tracks?.length || 0} tracks
            </p>
            {album.description && (
              <p className="text-text-secondary">{album.description}</p>
            )}
            <div className="pt-2">
              <BandcampLink albumTitle={album.title} />
            </div>
          </div>
        </div>
      </WFCard>

      {/* Track List */}
      <WFCard>
        <h2 className="font-display text-2xl text-text-primary mb-4">
          Tracks
        </h2>
        <ol className="divide-y divide-border-subtle">
          {album.tracks?.map((track: Track, index: number) => {
            const hasSlug = Boolean(track.slug);
            const trackContent = (
              <li
                key={track.id}
                className="flex items-center py-3 first:pt-0 last:pb-0"
              >
                <span className="text-accent-secondary font-mono w-8 flex-shrink-0">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <span
                  className={`flex-1 text-text-primary ${
                    hasSlug ? 'hover:text-[#2D5016] hover:underline cursor-pointer transition-colors' : ''
                  }`}
                >
                  {track.title}
                </span>
                <span className="text-text-muted text-sm ml-auto pl-4">
                  {formatDuration(track.duration)}
                </span>
              </li>
            );

            if (hasSlug) {
              return (
                <Link
                  key={track.id}
                  href={getSongUrl(track)}
                  className="block"
                >
                  {trackContent}
                </Link>
              );
            }

            return trackContent;
          })}
        </ol>
      </WFCard>
    </div>
  );
}
