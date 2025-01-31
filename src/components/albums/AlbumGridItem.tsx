'use client';

import Link from 'next/link';
import { RetroCard } from '@/components/ui/RetroCard';
import { AlbumCover } from '@/components/ui/AlbumCover';
import { Album } from '@/types';

interface AlbumGridItemProps {
  album: Album;
}

export default function AlbumGridItem({ album }: AlbumGridItemProps) {
  return (
    <Link href={`/albums/${album.id}`}>
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
          <div className="text-center relative z-10">
            <h2 className="text-xl font-bold text-retro-paper mt-4">
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
  );
}