export interface SearchResult {
  id: string | number;
  type: 'album' | 'song' | 'lyric';
  title: string;
  url: string;
}

export interface Album {
  id: number;
  title: string;
  coverArt: string;
  coverImage?: string; // For backward compatibility
  year: string;
  description: string;
  tracks?: Track[];
  songs?: Song[]; // For backward compatibility
}

export interface LrcLibLyrics {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string;
  syncedLyrics: string;
}

export interface LrcLibTrack {
  track_name: string;
  artist_name: string;
  album_name?: string;
  duration?: number;
}

export interface Track {
  id: string | number;
  title: string;
  duration: string;
  lyrics?: string;
  albumId?: string;
  slug?: string;
  description?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  tags?: string[];
  contributors?: string[];
  lrcLibId?: number;
  isVerified?: boolean;
  syncedLyrics?: string;
}

export interface Song {
  id: string;
  title: string;
  duration: string;
  lyrics?: string;
  albumId?: string;
  slug?: string;
  description?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  tags?: string[];
  contributors?: string[];
  lrcLibId?: number;
  isVerified?: boolean;
  syncedLyrics?: string;
}

export interface LyricPage {
  title: string;
  album: string;
  content: string;
  metadata: {
    year: string;
    writers?: string[];
    tags?: string[];
    contributors?: string[];
  };
}

export interface Tag {
  id: string;
  name: string;
  count: number;
}

// Helper type for markdown processing
export interface ProcessedSong extends Song {
  content?: string;
}