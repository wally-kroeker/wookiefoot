import { notFound } from 'next/navigation';
import Link from 'next/link';
import { RetroCard } from '@/components/ui/RetroCard';
import { AlbumCover } from '@/components/ui/AlbumCover';
import { 
  getAlbumById, 
  getAllAlbums,
  formatDuration, 
  getSongUrl,
} from '@/lib/utils/markdown';
import type { Track } from '@/types';

interface PageProps {
  params: {
    id: string;
  };
}

// Generate static params for all albums
export async function generateStaticParams() {
  const albums = await getAllAlbums();
  return albums.map((album) => ({
    id: album.id.toString(),
  }));
}

// Metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const albumId = decodeURIComponent(resolvedParams.id);
  const album = await getAlbumById(albumId);
  
  if (!album) {
    return {
      title: 'Album Not Found | WookieFoot Lyrics',
      description: 'The requested album could not be found.',
    };
  }

  return {
    title: `${album.title} | WookieFoot Lyrics`,
    description: album.description,
  };
}

export default async function AlbumPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const albumId = decodeURIComponent(resolvedParams.id);
  const album = await getAlbumById(albumId);

  if (!album) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Album Header */}
      <RetroCard variant="primary" className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-72 transform hover:scale-105 transition-transform duration-500">
            <AlbumCover
              albumArt={album.coverArt}
              title={album.title}
              priority={true}
              size="lg"
            />
          </div>
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              <h1 className="text-4xl font-bold text-retro-paper">
                {album.title}
              </h1>
              <p className="text-xl text-gradient mt-2">
                Released: {album.year}
              </p>
            </div>
            <p className="text-retro-paper/80 text-lg">
              {album.description}
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <a
                href="#tracks"
                className="btn-retro"
              >
                View Tracks
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-retro"
              >
                Listen on Spotify
              </a>
            </div>
          </div>
        </div>
      </RetroCard>

      {/* Track List */}
      <div id="tracks">
        <RetroCard variant="secondary" className="p-6">
          <h2 className="text-2xl font-bold text-gradient mb-6">
            Tracks
          </h2>
          <div className="space-y-4">
            {album.tracks?.map((track: Track, index: number) => (
              <Link 
                key={track.id}
                href={getSongUrl(track)}
                className="block group"
                prefetch={true}
              >
                <RetroCard variant="default" className="p-4 hover-lift">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-lg text-retro-paper/60 w-8 font-mono">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="text-lg font-medium text-retro-paper group-hover:text-gradient">
                          {track.title}
                        </h3>
                        {track.description && (
                          <p className="text-sm text-retro-paper/60">
                            {track.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <span className="text-sm font-mono text-retro-paper/60">
                        {formatDuration(track.duration)}
                      </span>
                      <div className="flex space-x-3">
                        {track.youtubeUrl && (
                          <a
                            href={track.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-pink hover:text-accent-pink/80 transition-colors"
                          >
                            <span className="sr-only">YouTube</span>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                            </svg>
                          </a>
                        )}
                        {track.spotifyUrl && (
                          <a
                            href={track.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-green hover:text-accent-green/80 transition-colors"
                          >
                            <span className="sr-only">Spotify</span>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </RetroCard>
              </Link>
            ))}
          </div>
        </RetroCard>
      </div>

      {/* Navigation */}
      <RetroCard variant="secondary" className="p-6">
        <div className="flex justify-between items-center">
          <Link 
            href="/albums" 
            className="btn-retro"
            prefetch={true}
          >
            ← Back to Albums
          </Link>
          <Link 
            href="/search" 
            className="btn-retro"
            prefetch={true}
          >
            Search Lyrics
          </Link>
        </div>
      </RetroCard>
    </div>
  );
}
