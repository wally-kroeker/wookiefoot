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
        className="p-5 group transition-all duration-300 hover:bg-black/40"
      >
        <div className="space-y-4">
          {/* Album artwork with subtle glow */}
          <div className="relative w-48 h-48 mx-auto transform group-hover:scale-105 transition-transform duration-500">
            <div className="absolute -inset-2 bg-gradient-green-orange rounded-lg blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            <AlbumCover
              albumArt={album.coverArt}
              title={album.title}
              size="md"
            />
          </div>

          {/* Album info - better separation from shadow */}
          <div className="text-center relative bg-black/40 backdrop-blur-sm rounded-lg p-4 -mt-2">
            <h2 className="text-lg font-bold text-retro-paper group-hover:text-gradient transition-all duration-300">
              {album.title}
            </h2>
            <p className="text-xs text-accent-green/80 mt-1">
              {album.year}
            </p>
            {album.description && (
              <p className="text-xs text-retro-paper/60 mt-2 line-clamp-2">
                {album.description}
              </p>
            )}
          </div>

          {/* Track count */}
          <div className="flex justify-between items-center text-xs text-retro-paper/60 border-t border-accent-teal/20 pt-3">
            <span>{album.tracks?.length || 0} tracks</span>
            <span className="text-accent-green group-hover:text-accent-orange transition-colors duration-300 flex items-center gap-1">
              View Details
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </RetroCard>
    </Link>
  );
}