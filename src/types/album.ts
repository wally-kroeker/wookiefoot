export interface AlbumMetadata {
  title: string;
  releaseYear: number;
  description: string;
  trackCount: number;
  totalDuration?: string;
  genres?: string[];
  artwork: {
    full: string;
    thumbnail: string;
  };
  media?: {
    youtube?: {
      playlistId: string;
      url: string;
    };
  };
}

export interface TrackMetadata {
  title: string;
  trackNumber: number;
  duration: string;
  description?: string;
  lyricsStatus: 'complete' | 'incomplete';
  syncedLyrics?: string;
  media?: {
    youtube?: {
      videoId: string;
      url: string;
    };
  };
}

export interface LyricsMetadata {
  title: string;
  albumId: string;
  track: number;
  year: number;
  description?: string;
  contributors?: string[];
  tags?: string[];
  syncedLyrics?: string;
  youtubeVideoId?: string;
  media?: TrackMetadata['media'];
}
