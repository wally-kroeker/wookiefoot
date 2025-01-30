import { ProcessedSong, Song, Track, Album } from '@/types/index.js';
import { AlbumMetadata, LyricsMetadata, TrackMetadata } from '@/types/album';
import { getAlbumImageUrl } from './image-processing';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { visit } from 'unist-util-visit';

type LyricsStatus = 'Yes' | 'Failed' | 'Skipped';

interface SongIndexEntry {
  Album: string;
  Year: string;
  'Song Title': string;
  'Track Number': string;
  'Has Lyrics': LyricsStatus;
}


// Function to get base URL for API calls
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return '';
  }
  // Server should use full URL
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
}

// Function to fetch song index from API
async function getSongIndex(): Promise<SongIndexEntry[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/lyrics`);
  const data = await response.json();
  return data.songs;
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

// Custom remark plugins for lyrics formatting
function remarkLyricsPlugin() {
  return function(tree: any) {
    // Handle special characters and formatting
    visit(tree, 'text', (node: any) => {
      // Preserve line breaks
      node.value = node.value.replace(/\\n/g, '\n');
      // Handle em dashes
      node.value = node.value.replace(/---/g, '—');
      // Handle ellipsis
      node.value = node.value.replace(/\.\.\./g, '…');
      // Handle quotes
      node.value = node.value.replace(/"([^"]*)"/g, '"$1"');
    });
  };
}

export async function processSongMarkdown(
  slug: string,
  content: string
): Promise<ProcessedSong> {
  const { data, content: markdownContent } = matter(content);
  const metadata = data as LyricsMetadata;

  const processedContent = await remark()
    .use(remarkLyricsPlugin)
    .use(html, { sanitize: true })
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

  // Apply lyrics-specific formatting
  processedLyrics = processedLyrics
    .split('\n')
    .map(line => line.trim())
    .join('\n');

  const song: ProcessedSong = {
    id: slug,
    title: metadata.title,
    albumId: metadata.album,
    description: metadata.description || '',
    duration: '--:--',
    tags: metadata.tags || [],
    contributors: metadata.contributors || [],
    content: contentHtml,
    lyrics: processedLyrics,
    syncedLyrics: processedSyncedLyrics,
    media: metadata.media,
    slug
  };

  return song;
}

export function convertSyncedLyricsToPlain(syncedLyrics: string): string {
  return syncedLyrics
    .split('\n')
    .map(line => line.replace(/\[\d{2}:\d{2}\.\d{2}\]\s*/, ''))
    .join('\n');
}

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

export async function getAllAlbums(): Promise<Album[]> {
  const songIndex = await getSongIndex();
  
  // Group songs by album
  const albumMap = new Map<string, SongIndexEntry[]>();
  songIndex.forEach(entry => {
    if (!albumMap.has(entry.Album)) {
      albumMap.set(entry.Album, []);
    }
    albumMap.get(entry.Album)?.push(entry);
  });

  // Convert to Album objects
  const albums: Album[] = Array.from(albumMap.entries()).map(([albumTitle, songs], index) => {
    const tracks: Track[] = songs
      .sort((a, b) => parseInt(a['Track Number']) - parseInt(b['Track Number']))
      .map(song => ({
        id: `${albumToDirectoryName(song.Album)}-${song['Track Number']}`,
        title: song['Song Title'],
        slug: titleToSlug(song['Song Title']),
        duration: '--:--',
        description: '',
        tags: []
      }));

    return {
      id: index + 1,
      title: albumTitle,
      year: songs[0].Year,
      coverArt: getAlbumImageUrl(albumTitle),
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

export async function getAllSongs(): Promise<Song[]> {
  const albums = await getAllAlbums();
  return albums.flatMap(album => 
    (album.tracks || []).map(track => ({
      ...track,
      id: track.id.toString(),
      albumId: album.id.toString()
    }))
  );
}

export async function getSongBySlug(slug: string): Promise<ProcessedSong | undefined> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/lyrics?slug=${slug}`);
    if (!response.ok) {
      return undefined;
    }
    
    const { content, songIndex } = await response.json();
    const entry = songIndex.find((s: SongIndexEntry) => 
      titleToSlug(s['Song Title']) === slug
    );
    
    if (!entry) {
      return undefined;
    }

    // Get all albums to find the numeric ID
    const albums = await getAllAlbums();
    const album = albums.find(a => a.title === entry.Album);
    const numericAlbumId = album ? album.id.toString() : '1';

    const processed = await processSongMarkdown(slug, content);

    return {
      ...processed,
      albumId: numericAlbumId
    };
  } catch (error) {
    console.error(`Error fetching song ${slug}:`, error);
    return undefined;
  }
}

export async function getRelatedSongs(currentSong: Song, limit: number = 3): Promise<Song[]> {
  const allSongs = await getAllSongs();
  return allSongs
    .filter(song => 
      song.albumId === currentSong.albumId && 
      song.id !== currentSong.id
    )
    .slice(0, limit);
}

export function getSafeHtml(content: string | undefined): string {
  return content || '';
}

export async function getNavigationData(currentSong: Song): Promise<{
  previous?: Song;
  next?: Song;
  albumSongs: Song[];
  currentIndex: number;
}> {
  const songIndex = await getSongIndex();
  // Get all albums to find the current album
  const albums = await getAllAlbums();
  const currentAlbum = albums.find(a => a.id.toString() === currentSong.albumId);
  
  if (!currentAlbum) return { albumSongs: [], currentIndex: -1 };

  const currentEntry = songIndex.find(s => 
    titleToSlug(s['Song Title']) === currentSong.slug && 
    s.Album === currentAlbum.title
  );

  if (!currentEntry) return { albumSongs: [], currentIndex: -1 };

  const numericAlbumId = currentAlbum.id.toString();

  const albumSongs = songIndex
    .filter(s => s.Album === currentEntry.Album)
    .sort((a, b) => parseInt(a['Track Number']) - parseInt(b['Track Number']))
    .map(entry => ({
      id: `${albumToDirectoryName(entry.Album)}-${entry['Track Number']}`,
      title: entry['Song Title'],
      slug: titleToSlug(entry['Song Title']),
      albumId: numericAlbumId,
      duration: '--:--',
      description: '',
      hasLyrics: entry['Has Lyrics']
    }));

  const currentIdx = albumSongs.findIndex(s => s.slug === currentSong.slug);
  
  let previous: Song | undefined;
  let next: Song | undefined;

  // Find previous song with lyrics
  for (let i = currentIdx - 1; i >= 0; i--) {
    if (albumSongs[i].hasLyrics === 'Yes') {
      previous = albumSongs[i];
      break;
    }
  }

  // Find next song with lyrics
  for (let i = currentIdx + 1; i < albumSongs.length; i++) {
    if (albumSongs[i].hasLyrics === 'Yes') {
      next = albumSongs[i];
      break;
    }
  }

  return {
    previous,
    next,
    albumSongs: albumSongs.filter(song => song.hasLyrics === 'Yes'),
    currentIndex: currentIdx
  };
}
