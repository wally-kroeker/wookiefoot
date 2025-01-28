'use client';

import React from 'react';
import Image from 'next/image';
import { RetroCard } from './RetroCard';

interface VinylRecordProps {
  albumArt: string;
  title: string;
  className?: string;
  isPlaying?: boolean;
  priority?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function VinylRecord({
  albumArt,
  title,
  className = '',
  isPlaying = false,
  priority = false,
  size = 'md',
}: VinylRecordProps) {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  return (
    <RetroCard
      variant="secondary"
      className={`relative group ${className} ${isPlaying ? 'animate-spin-slow' : ''}`}
    >
      {/* Vinyl record background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-900 to-gray-800">
        {/* Vinyl grooves */}
        <div className="absolute inset-4 rounded-full border border-gray-700 opacity-50" />
        <div className="absolute inset-8 rounded-full border border-gray-700 opacity-50" />
        <div className="absolute inset-12 rounded-full border border-gray-700 opacity-50" />
        <div className="absolute inset-16 rounded-full border border-gray-700 opacity-50" />
        
        {/* Center hole */}
        <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-navy-900">
          <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-gray-700" />
        </div>
      </div>

      {/* Album artwork */}
      <div className={`relative aspect-square overflow-hidden rounded-full ${sizeClasses[size]}`}>
        <Image
          src={albumArt}
          alt={title}
          fill
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={
            size === 'sm'
              ? '8rem'
              : size === 'md'
              ? '12rem'
              : '16rem'
          }
        />
      </div>

      {/* Reflection overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      {/* Title overlay on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-navy-900/80 px-4 py-2 rounded-full backdrop-blur-sm">
          <p className="text-retro-paper font-medium text-sm truncate max-w-[200px]">
            {title}
          </p>
        </div>
      </div>

      {/* Play indicator */}
      {isPlaying && (
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-accent-green animate-pulse">
          <div className="absolute inset-0 rounded-full bg-accent-green animate-ping" />
        </div>
      )}
    </RetroCard>
  );
}