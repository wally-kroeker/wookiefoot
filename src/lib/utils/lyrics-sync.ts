import { LrcLibLyrics, Track } from '@/types/index.js';
import { lrcLibService } from '../services/lrclib.js';

export interface LyricsSyncResult {
  isMatch: boolean;
  confidence: number;
  lrcLibId?: number;
  lyrics?: string;
  syncedLyrics?: string;
}

/**
 * Compare local lyrics with LRCLIB results
 * Returns a confidence score between 0 and 1
 */
function calculateLyricsConfidence(local: string, remote: string): number {
  if (!local || !remote) return 0;

  // Normalize both lyrics for comparison
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .replace(/\[.*?\]/g, '') // Remove time tags
      .replace(/\r?\n/g, ' ') // Replace newlines with spaces
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  };

  const normalizedLocal = normalizeText(local);
  const normalizedRemote = normalizeText(remote);

  // Calculate similarity using Levenshtein distance
  const maxLength = Math.max(normalizedLocal.length, normalizedRemote.length);
  const distance = levenshteinDistance(normalizedLocal, normalizedRemote);
  
  // Convert distance to similarity score (0-1)
  return 1 - (distance / maxLength);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1, // substitution
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1      // insertion
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Compare local lyrics with LRCLIB results
 */
export async function compareLyrics(local: string, remote: LrcLibLyrics): Promise<LyricsSyncResult> {
  const confidence = calculateLyricsConfidence(local, remote.plainLyrics);
  
  return {
    isMatch: confidence > 0.8, // Consider it a match if confidence is over 80%
    confidence,
    lrcLibId: remote.id,
    lyrics: remote.plainLyrics,
    syncedLyrics: remote.syncedLyrics
  };
}

/**
 * Verify lyrics for a track against LRCLIB
 */
export async function verifyLyrics(track: Track): Promise<LyricsSyncResult> {
  // If we already have a LRCLIB ID, fetch directly
  if (track.lrcLibId) {
    const lrcLibLyrics = await lrcLibService.getLyricsById(track.lrcLibId);
    if (lrcLibLyrics) {
      return compareLyrics(track.lyrics || '', lrcLibLyrics);
    }
  }

  // Search by track info
  const searchParams = {
    track_name: track.title,
    artist_name: 'Wookiefoot', // Updated artist name
    album_name: track.albumId ? undefined : undefined, // We'll let LRCLIB match without album name for better results
    duration: track.duration ? lrcLibService.convertDurationToSeconds(track.duration) : undefined
  };

  console.log('Searching LRCLIB with params:', searchParams);
  
  const lrcLibLyrics = await lrcLibService.getLyrics(searchParams);

  if (!lrcLibLyrics) {
    console.log('No lyrics found for track:', track.title);
    return {
      isMatch: false,
      confidence: 0
    };
  }

  console.log('Found lyrics for track:', track.title, 'LRCLIB ID:', lrcLibLyrics.id);

  return compareLyrics(track.lyrics || '', lrcLibLyrics);
}

/**
 * Batch verify multiple tracks
 */
export async function batchVerifyLyrics(tracks: Track[]): Promise<Map<string, LyricsSyncResult>> {
  const results = new Map<string, LyricsSyncResult>();
  
  // Process tracks sequentially to avoid overwhelming the API
  for (const track of tracks) {
    const result = await verifyLyrics(track);
    // Convert ID to string for consistent map keys
    const trackId = track.id.toString();
    results.set(trackId, result);
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}