'use client';

import Image from 'next/image';
import { RetroCard } from './RetroCard';

// Placeholder image as a base64-encoded data URL (gray background with music note icon)
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjYjBiMGIwIi8+PHBhdGggZD0iTTE1MCAyNTBhNzUgNzUgMCAwIDAgNzUtNzV2LTc1aC03NWE3NSA3NSAwIDAgMCAwIDE1MHoiIGZpbGw9IiM2NjYiLz48cGF0aCBkPSJNMjI1IDc1aC0xNXYtMzBhNzUgNzUgMCAwIDAtMTUwIDB2MzBoLTc1djE1MGg3NXYtNzVoNzV2NzVoNzV2LTc1eiIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==';

interface AlbumCoverProps {
  albumArt: string;
  title: string;
  className?: string;
  priority?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AlbumCover({
  albumArt,
  title,
  className = '',
  priority = false,
  size = 'md',
}: AlbumCoverProps) {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  return (
    <RetroCard variant="secondary" className={`relative ${className}`}>
      {/* Album artwork with error handling */}
      <div className={`relative aspect-square overflow-hidden ${sizeClasses[size]} z-0`}>
        {albumArt ? (
          <Image
            src={albumArt}
            alt={title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500"
            sizes={size === 'sm' ? '8rem' : size === 'md' ? '12rem' : '16rem'}
            onError={(e) => {
              // Replace broken image with the placeholder
              e.currentTarget.src = PLACEHOLDER_IMAGE;
            }}
          />
        ) : (
          <div className="bg-gray-400 flex items-center justify-center w-full h-full">
            {/* Placeholder content if needed */}
          </div>
        )}
      </div>
    </RetroCard>
  );
}
