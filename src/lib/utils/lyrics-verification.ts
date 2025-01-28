import { Track } from '@/types/index.js';
import { verifyLyrics, batchVerifyLyrics } from './lyrics-sync.js';
import { getAllSongs } from './markdown.js';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

/**
 * Update a markdown file with verified lyrics
 */
async function updateLyricsFile(slug: string, lrcLibId: number, isVerified: boolean, syncedLyrics?: string) {
  const lyricsPath = path.join(process.cwd(), 'src/content/lyrics');
  
  // Search for the lyrics file recursively
  async function findLyricsFile(dir: string): Promise<string | null> {
    const files = await fs.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        const found = await findLyricsFile(fullPath);
        if (found) return found;
      } else if (file.name === `${slug}.md`) {
        return fullPath;
      }
    }
    
    return null;
  }

  const filePath = await findLyricsFile(lyricsPath);
  if (!filePath) {
    throw new Error(`Lyrics file not found for slug: ${slug}`);
  }

  // Read and parse the markdown file
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: markdownContent } = matter(content);

  // Update the frontmatter
  const updatedData = {
    ...data,
    lrcLibId,
    isVerified,
    ...(syncedLyrics && { syncedLyrics })
  };

  // Create the updated markdown content
  const updatedContent = matter.stringify(markdownContent, updatedData);

  // Write back to file
  await fs.writeFile(filePath, updatedContent);
}

/**
 * Verify lyrics for a single track
 */
export async function verifyTrackLyrics(track: Track): Promise<boolean> {
  try {
    const result = await verifyLyrics(track);
    
    if (result.isMatch && result.lrcLibId) {
      await updateLyricsFile(
        track.slug!,
        result.lrcLibId,
        true,
        result.syncedLyrics
      );
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error verifying lyrics for track ${track.title}:`, error);
    return false;
  }
}

/**
 * Verify lyrics for all tracks
 */
export async function verifyAllLyrics(): Promise<{
  verified: number;
  total: number;
  failed: string[];
}> {
  const songs = await getAllSongs();
  const results = {
    verified: 0,
    total: songs.length,
    failed: [] as string[]
  };

  for (const song of songs) {
    try {
      const success = await verifyTrackLyrics(song);
      if (success) {
        results.verified++;
      } else {
        results.failed.push(song.title);
      }
      // Add a delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to verify ${song.title}:`, error);
      results.failed.push(song.title);
    }
  }

  return results;
}

/**
 * Generate a verification report
 */
export async function generateVerificationReport(): Promise<string> {
  const results = await verifyAllLyrics();
  
  return `
Lyrics Verification Report
-------------------------
Total Tracks: ${results.total}
Verified: ${results.verified}
Success Rate: ${((results.verified / results.total) * 100).toFixed(1)}%

Failed Tracks:
${results.failed.length > 0 ? results.failed.map(title => `- ${title}`).join('\n') : 'None'}
  `.trim();
}