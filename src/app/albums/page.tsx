import { getAllAlbums } from '@/lib/utils/markdown';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { RetroCard } from '@/components/ui/RetroCard';
import type { Album } from '@/types';

const AlbumGridItem = dynamic<{ album: Album }>(() => import('@/components/albums/AlbumGridItem'));
const FeaturedAlbum = dynamic<{ album: Album }>(() => import('@/components/albums/FeaturedAlbum'));

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
          <AlbumGridItem key={album.id} album={album} />
        ))}
      </div>

      {/* Featured Album */}
      {albums.length > 0 && <FeaturedAlbum album={albums[0]} />}

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
