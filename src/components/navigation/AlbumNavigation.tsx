'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Song } from '@/types/index';
import { getSongUrl } from '@/lib/utils/markdown';

interface AlbumNavigationProps {
  songs: Song[];
  currentIndex: number;
}

export default function AlbumNavigation({ songs, currentIndex }: AlbumNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-500">
                Song {currentIndex + 1} of {songs.length}
              </span>
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setIsOpen(!isOpen)}
              >
                Quick Navigation
                <svg
                  className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>
          
          <div
            className={`${
              isOpen ? 'block' : 'hidden'
            } absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-t-lg shadow-lg max-h-96 overflow-y-auto`}
          >
            <div className="p-4">
              {songs.map((song, index) => (
                <Link
                  key={song.id}
                  href={getSongUrl(song)}
                  className={`block px-4 py-3 text-sm rounded-md transition-colors duration-150 ${
                    index === currentIndex 
                      ? 'bg-indigo-50 text-indigo-700 font-medium' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {index + 1}. {song.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
