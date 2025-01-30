import Link from 'next/link';
import { RetroCard } from '@/components/ui/RetroCard';
import { AlbumCover } from '@/components/ui/AlbumCover';
import { getAllAlbums } from '@/lib/utils/markdown';

export default async function AlbumsPage() {
  const albums = await getAllAlbums();

  return (
    <div className="space-y-12">
      {/* Header */}
      <RetroCard variant="primary" className="p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-retro-paper">WookieFoot</span>
            <span className="text-gradient block mt-2">Albums</span>
          </h1>
          <p className="text-lg text-retro-paper/80 max-w-2xl mx-auto">
            Explore the complete discography of WookieFoot. Click on an album to view
            its lyrics and details.
          </p>
        </div>
      </RetroCard>

      {/* Albums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {albums.map((album) => (
          <Link key={album.id} href={`/albums/${album.id}`}>
            <RetroCard
              variant="secondary"
              className="p-6 hover-lift group transition-all duration-300 hover:bg-navy-800/50"
            >
              <div className="space-y-6">
                {/* Album artwork as vinyl */}
                <div className="relative w-48 h-48 mx-auto transform group-hover:scale-105 transition-transform duration-500">
                  <AlbumCover
                    albumArt={album.coverArt}
                    title={album.title}
                    size="md"
                  />
                </div>

                {/* Album info */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-retro-paper group-hover:text-gradient">
                    {album.title}
                  </h2>
                  <p className="text-sm text-retro-paper/60 mt-1">
                    {album.year}
                  </p>
                  <p className="text-sm text-retro-paper/80 mt-2 line-clamp-2">
                    {album.description}
                  </p>
                </div>

                {/* Track count */}
                <div className="flex justify-between items-center text-sm text-retro-paper/60 border-t border-accent-blue/20 pt-4">
                  <span>{album.tracks?.length || 0} tracks</span>
                  <span className="text-accent-blue group-hover:text-accent-pink transition-colors duration-300">
                    View Details →
                  </span>
                </div>
              </div>
            </RetroCard>
          </Link>
        ))}
      </div>

      {/* Featured Album */}
      {albums.length > 0 && (
        <RetroCard variant="primary" className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-64 transform hover:scale-105 transition-transform duration-300">
              <AlbumCover
                albumArt={albums[0].coverArt}
                title={albums[0].title}
                size="lg"
              />
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold text-gradient">
                Featured: {albums[0].title}
              </h2>
              <p className="text-retro-paper/80">
                {albums[0].description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/albums/${albums[0].id}`}
                  className="btn-retro"
                >
                  View Album
                </Link>
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
      )}

      {/* Call to Action */}
      <RetroCard variant="secondary" className="p-6 text-center">
        <p className="text-retro-paper/80">
          Can't find what you're looking for?{' '}
          <Link
            href="/search"
            className="text-accent-blue hover:text-accent-pink transition-colors duration-300"
          >
            Try searching our complete lyrics archive
          </Link>
        </p>
      </RetroCard>
    </div>
  );
}
