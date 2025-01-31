'use client';

import Link from 'next/link';
import { RetroCard } from '@/components/ui/RetroCard';
import { AlbumCover } from '@/components/ui/AlbumCover';
import { Album } from '@/types';

interface FeaturedAlbumProps {
  album: Album;
}

export default function FeaturedAlbum({ album }: FeaturedAlbumProps) {
  return (
    <RetroCard variant="primary" className="p-8">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-64 transform hover:scale-105 transition-transform duration-300">
          <AlbumCover
            albumArt={album.coverArt}
            title={album.title}
            size="lg"
            priority
          />
        </div>
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-bold text-gradient">
            Featured: {album.title}
          </h2>
          <p className="text-retro-paper/80">
            {album.description}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/albums/${album.id}`}
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
  );
}