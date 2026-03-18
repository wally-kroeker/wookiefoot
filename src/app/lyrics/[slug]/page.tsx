import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import WFCard from '@/components/ui/WFCard';
import YouTubeEmbed from '@/components/ui/YouTubeEmbed';
import BandcampLink from '@/components/ui/BandcampLink';
import AlbumNavigation from '@/components/navigation/AlbumNavigation';
import { getSongBySlug, getAlbumById, getNavigationData, getAllSongs, getBandcampAlbumUrl } from '@/lib/utils/markdown';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// generateStaticParams disabled — getAllSongs() fetches from the API at
// localhost which is unavailable during build. Using dynamic rendering.
// export async function generateStaticParams() {
//   const songs = await getAllSongs();
//   return songs.map((song) => ({
//     slug: song.slug,
//   }));
// }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const song = await getSongBySlug(slug);

  if (!song) {
    return {
      title: 'Song Not Found',
    };
  }

  return {
    title: song.title,
    description: song.description || `Lyrics for ${song.title} by WookieFoot`,
  };
}

export default async function SongPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const song = await getSongBySlug(slug);

  if (!song) {
    return notFound();
  }

  const album = await getAlbumById(song.albumId);
  const { previous, next } = await getNavigationData(song);

  const albumTitle = album?.title || '';
  const albumYear = album?.year || '';

  const hasYouTube = song.youtubeVideoId && song.youtubeVideoId !== 'PLACEHOLDER';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MusicComposition',
            name: song.title,
            composer: { '@type': 'MusicGroup', name: 'WookieFoot' },
            lyrics: { '@type': 'CreativeWork', text: song.content?.replace(/<[^>]*>/g, '') || '' },
          }),
        }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted font-body">
        <Link href="/" className="hover:text-accent-primary transition-colors duration-200">
          Home
        </Link>
        <span>/</span>
        {album && (
          <>
            <Link
              href={`/albums/${song.albumId}`}
              className="hover:text-accent-primary transition-colors duration-200"
            >
              {albumTitle}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-text-secondary">{song.title}</span>
      </nav>

      {/* Song Header */}
      <WFCard variant="accent">
        <h1 className="font-display text-3xl text-text-primary">{song.title}</h1>
        {album && (
          <Link
            href={`/albums/${song.albumId}`}
            className="inline-block mt-2 text-accent-secondary hover:text-accent-primary transition-colors duration-200 font-body"
          >
            {albumTitle}{albumYear ? ` (${albumYear})` : ''}
          </Link>
        )}
        {song.duration && song.duration !== '--:--' && (
          <p className="mt-1 text-text-muted text-sm font-body">{song.duration}</p>
        )}
      </WFCard>

      {/* Media Section */}
      {hasYouTube ? (
        <YouTubeEmbed videoId={song.youtubeVideoId!} title={song.title} />
      ) : (
        <BandcampLink albumTitle={albumTitle} />
      )}

      {/* Lyrics Body */}
      <WFCard>
        {song.content ? (
          <div
            className="lyrics-body"
            dangerouslySetInnerHTML={{ __html: song.content }}
          />
        ) : song.lyrics ? (
          <pre className="lyrics-body">{song.lyrics}</pre>
        ) : (
          <p className="text-text-muted font-body">Lyrics not available for this song.</p>
        )}
      </WFCard>

      {/* Tags */}
      {song.tags && song.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {song.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-3 py-1 text-sm rounded-full bg-[#2D5016]/10 text-[#2D5016]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Album Navigation */}
      <AlbumNavigation
        previous={previous ? { title: previous.title, slug: previous.slug || '' } : undefined}
        next={next ? { title: next.title, slug: next.slug || '' } : undefined}
        albumId={String(song.albumId || '')}
        albumTitle={albumTitle}
      />
    </div>
  );
}
