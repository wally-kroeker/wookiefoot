import { ProcessedSong, Song, Track, Album } from '@/types/index.js';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Add status to Track and Song interfaces since we're using it
type LyricsStatus = 'Yes' | 'Failed' | 'Skipped';

interface SongMetadata {
  title: string;
  albumId: string;
  description?: string;
  duration?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  tags?: string[];
  contributors?: string[];
  lrcLibId?: number;
  isVerified?: boolean;
  syncedLyrics?: string;
}

interface SongIndexEntry {
  album: string;
  year: string;
  songTitle: string;
  trackNumber: number;
  hasLyrics: LyricsStatus;
}

// Function to read and parse song_index.csv
async function getSongIndex(): Promise<SongIndexEntry[]> {
  const csvPath = path.join(process.cwd(), 'song_index.csv');
  const csvContent = await fs.readFile(csvPath, 'utf-8');
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });

  return records.map((record: any) => ({
    album: record.Album,
    year: record.Year,
    songTitle: record['Song Title'],
    trackNumber: parseInt(record['Track Number'], 10),
    hasLyrics: record['Has Lyrics'] as LyricsStatus
  }));
}

// Function to convert song title to slug
function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    // Special case for "St." -> "st."
    .replace(/\bst\./g, 'st.')
    // Replace all other non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9.]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/(^-|-$)/g, '');
}

// Function to convert album title to directory name
function albumToDirectoryName(album: string): string {
  return album
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Function to get the content directory path
function getContentPath(): string {
  return path.join(process.cwd(), 'src', 'content', 'lyrics');
}

export async function processSongMarkdown(
  slug: string,
  content: string
): Promise<ProcessedSong> {
  const { data, content: markdownContent } = matter(content);
  const metadata = data as SongMetadata;

  const processedContent = await remark()
    .use(html)
    .process(markdownContent);
  const contentHtml = processedContent.toString();

  // Process synced lyrics if available
  let processedLyrics = markdownContent;
  let processedSyncedLyrics = metadata.syncedLyrics;
  
  if (metadata.syncedLyrics) {
    // Convert synced lyrics to HTML with timing data
    processedLyrics = convertSyncedLyricsToPlain(metadata.syncedLyrics);
    processedSyncedLyrics = formatSyncedLyrics(metadata.syncedLyrics);
  }

  const song: ProcessedSong = {
    id: slug,
    title: metadata.title,
    albumId: metadata.albumId,
    description: metadata.description || '',
    duration: metadata.duration || '--:--',
    youtubeUrl: metadata.youtubeUrl,
    spotifyUrl: metadata.spotifyUrl,
    tags: metadata.tags || [],
    contributors: metadata.contributors || [],
    content: contentHtml,
    lyrics: processedLyrics,
    syncedLyrics: processedSyncedLyrics,
    lrcLibId: metadata.lrcLibId,
    isVerified: metadata.isVerified || false,
    slug
  };

  return song;
}

/**
 * Convert synced lyrics to plain text by removing timing tags
 */
export function convertSyncedLyricsToPlain(syncedLyrics: string): string {
  return syncedLyrics
    .split('\n')
    .map(line => line.replace(/\[\d{2}:\d{2}\.\d{2}\]\s*/, ''))
    .join('\n');
}

/**
 * Format synced lyrics to ensure consistent timing format
 */
export function formatSyncedLyrics(syncedLyrics: string): string {
  return syncedLyrics
    .split('\n')
    .map(line => {
      // Match [MM:SS.xx] format
      const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
      if (!match) return line;

      const [, minutes, seconds, hundredths, text] = match;
      // Ensure consistent format with leading zeros
      return `[${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}.${hundredths.padStart(2, '0')}]${text}`;
    })
    .join('\n');
}

export function formatDuration(duration: string): string {
  if (!duration) return '--:--';
  
  if (/^\d{1,2}:\d{2}$/.test(duration)) {
    return duration;
  }

  const seconds = parseInt(duration, 10);
  if (isNaN(seconds)) return '--:--';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function getSongUrl(song: Song | Track): string {
  if (!song.slug) return '#';
  return `/lyrics/${song.slug}`;
}

export function getAlbumUrl(albumId: string | number): string {
  return `/albums/${albumId}`;
}

export function formatTags(tags: string[] = []): string {
  return tags.map(tag => `#${tag}`).join(' ');
}

export function getYouTubeEmbedUrl(url: string = ''): string {
  const videoId = url.split('v=')[1];
  if (!videoId) return '';
  return `https://www.youtube.com/embed/${videoId}`;
}

export function getSpotifyEmbedUrl(url: string = ''): string {
  const trackId = url.split('track/')[1];
  if (!trackId) return '';
  return `https://open.spotify.com/embed/track/${trackId}`;
}

// Album management functions
export async function getAllAlbums(): Promise<Album[]> {
  const songIndex = await getSongIndex();
  
  // Group songs by album
  const albumMap = new Map<string, SongIndexEntry[]>();
  songIndex.forEach(entry => {
    if (!albumMap.has(entry.album)) {
      albumMap.set(entry.album, []);
    }
    albumMap.get(entry.album)?.push(entry);
  });

  // Convert to Album objects
  const albums: Album[] = Array.from(albumMap.entries()).map(([albumTitle, songs], index) => {
    const tracks: Track[] = songs
      .sort((a, b) => a.trackNumber - b.trackNumber)
      .map(song => ({
        id: `${albumToDirectoryName(song.album)}-${song.trackNumber}`,
        title: song.songTitle,
        slug: titleToSlug(song.songTitle),
        duration: '--:--', // Default duration since it's required by Track type
        description: '',
        tags: []
      }));

    return {
      id: index + 1, // Use numeric ID as required by Album type
      title: albumTitle,
      year: songs[0].year,
      coverArt: '/assets/albums/placeholder.svg',
      description: '',
      tracks
    };
  });

  return albums.sort((a, b) => parseInt(b.year) - parseInt(a.year));
}

export async function getAlbumById(id: string | number | undefined): Promise<Album | undefined> {
  if (!id) return undefined;
  
  const albums = await getAllAlbums();
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return albums.find(album => album.id === numId);
}

// Song management functions
export async function getAllSongs(): Promise<Song[]> {
  const albums = await getAllAlbums();
  return albums.flatMap(album => 
    (album.tracks || []).map(track => ({
      ...track,
      id: track.id.toString(), // Ensure id is string as required by Song type
      albumId: album.id.toString()
    }))
  );
}

export async function getSongBySlug(slug: string): Promise<ProcessedSong | undefined> {
  const songIndex = await getSongIndex();
  const entry = songIndex.find(s => titleToSlug(s.songTitle) === slug);
  
  if (!entry || entry.hasLyrics !== 'Yes') {
    return undefined;
  }

  try {
    const albumDir = albumToDirectoryName(entry.album);
    const songPath = path.join(
      getContentPath(),
      albumDir,
      `${titleToSlug(entry.songTitle)}.md`
    );

    const content = await fs.readFile(songPath, 'utf-8');
    const processed = await processSongMarkdown(slug, content);

    return {
      ...processed,
      albumId: albumDir
    };
  } catch (error) {
    console.error(`Error reading song file for ${slug}:`, error);
    return undefined;
  }
}

// Helper function to get related songs
export async function getRelatedSongs(currentSong: Song, limit: number = 3): Promise<Song[]> {
  const allSongs = await getAllSongs();
  return allSongs
    .filter(song => 
      song.albumId === currentSong.albumId && 
      song.id !== currentSong.id
    )
    .slice(0, limit);
}

// Helper function to ensure HTML content is safe
export function getSafeHtml(content: string | undefined): string {
  return content || '';
}

// Get previous and next songs within the same album
export async function getAdjacentSongs(currentSong: Song): Promise<{ previous?: Song; next?: Song }> {
  const songIndex = await getSongIndex();
  const currentEntry = songIndex.find(s => 
    titleToSlug(s.songTitle) === currentSong.slug && 
    albumToDirectoryName(s.album) === currentSong.albumId
  );

  if (!currentEntry) return {};

  const albumSongs = songIndex
    .filter(s => s.album === currentEntry.album)
    .sort((a, b) => a.trackNumber - b.trackNumber);

  const currentIdx = albumSongs.findIndex(s => s.trackNumber === currentEntry.trackNumber);
  
  let previous: Song | undefined;
  let next: Song | undefined;

  // Find previous song with lyrics
  for (let i = currentIdx - 1; i >= 0; i--) {
    if (albumSongs[i].hasLyrics === 'Yes') {
      const entry = albumSongs[i];
      previous = {
        id: `${albumToDirectoryName(entry.album)}-${entry.trackNumber}`,
        title: entry.songTitle,
        slug: titleToSlug(entry.songTitle),
        albumId: albumToDirectoryName(entry.album),
        duration: '--:--',
        description: ''
      };
      break;
    }
  }

  // Find next song with lyrics
  for (let i = currentIdx + 1; i < albumSongs.length; i++) {
    if (albumSongs[i].hasLyrics === 'Yes') {
      const entry = albumSongs[i];
      next = {
        id: `${albumToDirectoryName(entry.album)}-${entry.trackNumber}`,
        title: entry.songTitle,
        slug: titleToSlug(entry.songTitle),
        albumId: albumToDirectoryName(entry.album),
        duration: '--:--',
        description: ''
      };
      break;
    }
  }

  return { previous, next };
}
