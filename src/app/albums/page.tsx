import type { Metadata } from 'next';
import Link from 'next/link';
import WFCard from '@/components/ui/WFCard';
import { AlbumCover } from '@/components/ui/AlbumCover';
import { getAllAlbums } from '@/lib/utils/markdown';

export const metadata: Metadata = {
  title: 'Albums',
  description: 'Browse all WookieFoot albums — 8 albums spanning 21 years of music.',
};

export const dynamic = 'force-dynamic';

export default async function AlbumsPage() {
  const albums = await getAllAlbums();

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="font-display text-4xl text-text-primary">Albums</h1>
        <p className="text-text-secondary mt-2">
          8 albums spanning over 20 years of music
        </p>
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {albums.map((album) => (
          <Link key={album.id} href={`/albums/${album.id}`}>
            <WFCard className="h-full hover:shadow-card-hover transition-shadow duration-200">
              <div className="space-y-3">
                <AlbumCover
                  src={album.coverArt}
                  albumTitle={album.title}
                  size="md"
                />
                <div>
                  <h2 className="font-display text-lg text-text-primary">
                    {album.title}
                  </h2>
                  <p className="text-accent-secondary text-sm">{album.year}</p>
                  <p className="text-text-muted text-sm">
                    {album.tracks?.length || 0} tracks
                  </p>
                </div>
              </div>
            </WFCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
