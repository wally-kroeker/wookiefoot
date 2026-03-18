import { ProcessedSong, Song, Track, Album } from '@/types/index.js';
import { AlbumMetadata, LyricsMetadata, TrackMetadata } from '@/types/album';
import { getAlbumImageUrl } from './image-processing';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeAutolink from 'rehype-autolink-headings';
import rehypeSanitize from 'rehype-sanitize';

type LyricsStatus = 'Yes' | 'TRUE' | 'Failed' | 'Skipped';

interface SongIndexEntry {
  Album: string;
  'Track Number': string;
  Title: string;
  'Song Slug': string;
  'Has Lyrics': LyricsStatus;
  'Album Directory': string;
  Duration: string;
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
    : `http://localhost:${process.env.API_PORT || '3000'}`;
}

// Function to fetch song index from API
async function getSongIndex(): Promise<SongIndexEntry[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/lyrics`);
  const data = await response.json();
  return data.songs;
}


export async function processSongMarkdown(
  slug: string,
  content: string
): Promise<ProcessedSong> {
  const { data, content: markdownContent } = matter(content);
  const metadata = data as LyricsMetadata;

  // Process markdown to HTML using unified pipeline
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeSlug)
    .use(rehypeAutolink, { behavior: 'wrap' })
    .use(rehypeStringify)
    .process(markdownContent);

  const contentHtml = String(processedContent);

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
    albumId: metadata.albumId,
    description: metadata.description || '',
    duration: '--:--',
    tags: metadata.tags || [],
    contributors: metadata.contributors || [],
    content: contentHtml,
    lyrics: processedLyrics,
    syncedLyrics: processedSyncedLyrics,
    media: metadata.media,
    youtubeVideoId: metadata.youtubeVideoId,
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


export function getBandcampAlbumUrl(albumTitle: string): string {
  const slug = albumTitle
    .toLowerCase()
    .replace(/[''\"\.!?]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `https://wookiefoot.bandcamp.com/album/${slug}`;
}

// Album release year lookup
const albumYearMap: Record<string, string> = {
  'Domesticated': '2000',
  'Make Belief': '2001',
  'Out of the Jar': '2003',
  'Activate': '2006',
  'Be Fearless and Play': '2009',
  'Ready or Not...': '2012',
  "You're It!": '2015',
  'Writing on the Wall': '2021',
};

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
        id: `${song['Album Directory']}-${song['Track Number']}`,
        title: song.Title,
        slug: song['Song Slug'],
        duration: song.Duration || '--:--',
        description: '',
        tags: []
      }));

    const albumDir = songs[0]?.['Album Directory'] || '';
    return {
      id: albumDir,
      title: albumTitle,
      year: albumYearMap[albumTitle] || 'Unknown',
      coverArt: getAlbumImageUrl(albumTitle, 'full'),
      description: '',
      tracks
    };
  });

  // Sort albums chronologically by release year
  albums.sort((a, b) => parseInt(a.year) - parseInt(b.year));

  return albums;
}

export async function getAlbumById(id: string | number | undefined): Promise<Album | undefined> {
  if (!id) return undefined;

  const albums = await getAllAlbums();
  return albums.find(album => String(album.id) === String(id));
}

export async function getAllSongs(): Promise<Song[]> {
  const albums = await getAllAlbums();
  return albums.flatMap(album =>
    (album.tracks || []).map(track => ({
      ...track,
      id: track.id.toString(),
      albumId: album.id.toString(),
      albumTitle: album.title,
      albumCoverArt: getAlbumImageUrl(album.title, 'thumbnail')
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
      s['Song Slug'] === slug
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
    s['Song Slug'] === currentSong.slug &&
    s.Album === currentAlbum.title
  );

  if (!currentEntry) return { albumSongs: [], currentIndex: -1 };

  const numericAlbumId = currentAlbum.id.toString();

  const albumSongs = songIndex
    .filter(s => s.Album === currentEntry.Album)
    .sort((a, b) => parseInt(a['Track Number']) - parseInt(b['Track Number']))
    .map(entry => ({
      id: `${entry['Album Directory']}-${entry['Track Number']}`,
      title: entry.Title,
      slug: entry['Song Slug'],
      albumId: numericAlbumId,
      duration: entry.Duration || '--:--',
      description: '',
      hasLyrics: entry['Has Lyrics']
    }));

  const currentIdx = albumSongs.findIndex(s => s.slug === currentSong.slug);
  
  let previous: Song | undefined;
  let next: Song | undefined;

  // Find previous song with lyrics
  for (let i = currentIdx - 1; i >= 0; i--) {
    if (albumSongs[i].hasLyrics === 'Yes' || albumSongs[i].hasLyrics === 'TRUE') {
      previous = albumSongs[i];
      break;
    }
  }

  // Find next song with lyrics
  for (let i = currentIdx + 1; i < albumSongs.length; i++) {
    if (albumSongs[i].hasLyrics === 'Yes' || albumSongs[i].hasLyrics === 'TRUE') {
      next = albumSongs[i];
      break;
    }
  }

  return {
    previous,
    next,
    albumSongs: albumSongs.filter(song => song.hasLyrics === 'Yes' || song.hasLyrics === 'TRUE'),
    currentIndex: currentIdx
  };
}
