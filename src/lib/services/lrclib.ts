import { LrcLibLyrics, LrcLibTrack } from '@/types/index.js';

class LrcLibService {
  private readonly baseUrl = 'https://lrclib.net/api';

  /**
   * Get lyrics by track information
   */
  async getLyrics(track: LrcLibTrack): Promise<LrcLibLyrics | null> {
    try {
      // First try searching for the track
      console.log('Searching for track:', track.track_name);
      const searchResults = await this.searchLyrics({
        track_name: track.track_name,
        artist_name: track.artist_name
      });

      if (searchResults.length === 0) {
        console.log('No search results found');
        return null;
      }

      console.log(`Found ${searchResults.length} potential matches`);

      // Find the best match considering duration if provided
      let bestMatch = searchResults[0];
      if (track.duration) {
        const durationDiffThreshold = 5; // Allow 5 seconds difference
        for (const result of searchResults) {
          const durationDiff = Math.abs(result.duration - track.duration);
          if (durationDiff <= durationDiffThreshold) {
            bestMatch = result;
            break;
          }
        }
      }

      console.log('Best match:', {
        id: bestMatch.id,
        trackName: bestMatch.trackName,
        artistName: bestMatch.artistName,
        duration: bestMatch.duration
      });

      return bestMatch;
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      return null;
    }
  }

  /**
   * Get lyrics by LRCLIB ID
   */
  async getLyricsById(id: number): Promise<LrcLibLyrics | null> {
    try {
      const response = await fetch(`${this.baseUrl}/get/${id}`, {
        headers: {
          'Lrclib-Client': 'WookieFoot Website v1.0.0 (https://wookiefoot.com)'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`LRCLIB API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching lyrics by ID:', error);
      return null;
    }
  }

  /**
   * Search for lyrics using track info
   */
  async searchLyrics(params: {
    track_name?: string;
    artist_name?: string;
    album_name?: string;
  }): Promise<LrcLibLyrics[]> {
    try {
      const searchParams = new URLSearchParams();
      
      // Build search query
      const searchTerms = [];
      if (params.track_name) searchTerms.push(params.track_name);
      if (params.artist_name) searchTerms.push(params.artist_name);
      if (params.album_name) searchTerms.push(params.album_name);
      
      searchParams.set('q', searchTerms.join(' '));
      
      const url = `${this.baseUrl}/search?${searchParams.toString()}`;
      console.log('LRCLIB Search Request:', url);

      const response = await fetch(url, {
        headers: {
          'Lrclib-Client': 'WookieFoot Website v1.0.0 (https://wookiefoot.com)'
        }
      });

      console.log('LRCLIB Search Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LRCLIB Search error response:', errorText);
        throw new Error(`LRCLIB API error: ${response.statusText}`);
      }

      const results = await response.json();
      console.log(`LRCLIB Search found ${results.length} results`);
      return results;
    } catch (error) {
      console.error('Error searching lyrics:', error);
      return [];
    }
  }

  /**
   * Convert duration from "MM:SS" format to seconds
   */
  convertDurationToSeconds(duration: string): number {
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
  }

  /**
   * Convert duration from seconds to "MM:SS" format
   */
  convertSecondsToMinutes(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

// Export a singleton instance
export const lrcLibService = new LrcLibService();