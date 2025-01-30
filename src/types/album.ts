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
    spotify?: {
      albumId: string;
      uri: string;
    };
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
    spotify?: {
      trackId: string;
      uri: string;
    };
    youtube?: {
      videoId: string;
      url: string;
    };
  };
}

export interface LyricsMetadata {
  title: string;
  album: string;
  track: number;
  year: number;
  description?: string;
  contributors?: string[];
  tags?: string[];
  syncedLyrics?: string;
  media?: TrackMetadata['media'];
}
