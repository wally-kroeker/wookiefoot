// Script to update song_index.csv based on mastersonglist.csv and available lyrics files
// Author: Claude

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

// Define paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MASTER_SONG_LIST_PATH = path.join(__dirname, '..', 'cline_docs', 'mastersonglist.csv');
const SONG_INDEX_PATH = path.join(__dirname, '..', 'song_index.csv');
const LYRICS_DIR = path.join(__dirname, '..', 'src', 'content', 'lyrics');

// Helper function to convert song title to slug
function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/\bst\./g, 'st.') // Special case for "St." -> "st."
    .replace(/[^a-z0-9.]+/g, '-') // Replace all other non-alphanumeric characters with hyphens
    .replace(/(^-|-$)/g, ''); // Remove leading/trailing hyphens
}

// Helper function to convert album title to directory name
function albumToDirectoryName(album) {
  return album
    .toLowerCase()
    .replace(/[''"]/g, '') // Remove apostrophes and quotes
    .replace(/[^a-z0-9]+/g, '-') // Replace any non-alphanumeric with single hyphen
    .replace(/-{2,}/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .trim();
}

// Check if lyrics file exists
function lyricsFileExists(albumDir, songSlug) {
  const filePath = path.join(LYRICS_DIR, albumDir, `${songSlug}.md`);
  return fs.existsSync(filePath);
}

// Parse CSV file
async function parseCSV(filePath) {
  const results = [];
  
  const fileStream = createReadStream(filePath);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let headers = [];
  let isFirstLine = true;
  
  for await (const line of rl) {
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Parse CSV line (handling quoted values)
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    values.push(currentValue); // Add the last value
    
    if (isFirstLine) {
      headers = values;
      isFirstLine = false;
    } else {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      results.push(row);
    }
  }
  
  return { headers, data: results };
}

// Main function
async function updateSongIndex() {
  console.log('Starting song index update...');
  
  try {
    // Create backup of current song_index.csv if it exists
    if (fs.existsSync(SONG_INDEX_PATH)) {
      const backupPath = `${SONG_INDEX_PATH}.bak.${Date.now()}`;
      console.log(`Creating backup of song_index.csv at ${backupPath}`);
      fs.copyFileSync(SONG_INDEX_PATH, backupPath);
    }
    
    // Read master song list
    console.log(`Reading master song list from ${MASTER_SONG_LIST_PATH}...`);
    const { headers: masterHeaders, data: masterSongs } = await parseCSV(MASTER_SONG_LIST_PATH);
    console.log(`Loaded ${masterSongs.length} songs from master list.`);
    
    // Read current song index if it exists
    let currentSongIndex = { headers: [], data: [] };
    try {
      console.log(`Reading current song index from ${SONG_INDEX_PATH}...`);
      currentSongIndex = await parseCSV(SONG_INDEX_PATH);
      console.log(`Loaded ${currentSongIndex.data.length} songs from current index.`);
    } catch (err) {
      console.log('No existing song index found or error reading it. Creating new index.');
    }
    
    // Define required fields for song_index.csv
    const requiredFields = [
      'Has Lyrics', 'Track Number', 'Year', 'Song Title', 'Album', 'Album ID', 
      'Title', 'Spotify URL', 'Description', 'YouTube URL', 'ID', 'Contributors', 
      'Tags', 'Created At', 'Markdown Path'
    ];
    
    // Ensure all required fields exist in headers
    for (const field of requiredFields) {
      if (!currentSongIndex.headers.includes(field)) {
        currentSongIndex.headers.push(field);
      }
    }
    
    // Create a map of the current song index for easy lookup
    const songIndexMap = new Map();
    currentSongIndex.data.forEach(song => {
      // Try to match on both Title and Song Title to handle different formats
      const titleField = song['Song Title'] || song['Title'];
      if (song.Album && titleField) {
        const key = `${song.Album}|${titleField}`;
        songIndexMap.set(key, song);
      }
    });
    
    // Build updated song index
    const updatedSongIndex = masterSongs.map(masterSong => {
      const albumDirectoryName = albumToDirectoryName(masterSong.Album);
      const songTitle = masterSong['Song Title'];
      const songSlug = titleToSlug(songTitle);
      const key = `${masterSong.Album}|${songTitle}`;
      
      // Check if lyrics file exists
      const hasLyrics = lyricsFileExists(albumDirectoryName, songSlug);
      
      // Get current song data if it exists
      const existingSong = songIndexMap.get(key);
      
      // Build the new song entry, preserving all existing fields
      const newSong = {};
      
      // Add all required fields with proper fallbacks
      newSong['Has Lyrics'] = hasLyrics ? 'Yes' : (existingSong && existingSong['Has Lyrics'] === 'Failed' ? 'Failed' : 'Skipped');
      newSong['Track Number'] = masterSong['Track #'] || (existingSong ? existingSong['Track Number'] || '' : '');
      newSong['Year'] = existingSong ? existingSong.Year || '' : '';
      newSong['Song Title'] = songTitle;
      newSong['Album'] = masterSong.Album;
      
      // Copy over all other fields from existing song data
      if (existingSong) {
        for (const field of currentSongIndex.headers) {
          if (!newSong[field] && existingSong[field]) {
            newSong[field] = existingSong[field];
          }
        }
      }
      
      // Set these even if they might overwrite
      newSong['Album ID'] = existingSong ? existingSong['Album ID'] || '' : '';
      newSong['Title'] = songTitle; // Ensure Title matches Song Title
      newSong['Markdown Path'] = hasLyrics ? `src/content/lyrics/${albumDirectoryName}/${songSlug}.md` : '';
      
      return newSong;
    });
    
    // Write the updated song index
    const csvOutput = [
      currentSongIndex.headers.join(','),
      ...updatedSongIndex.map(song => 
        currentSongIndex.headers.map(field => {
          const value = song[field] || '';
          // Escape values with commas by wrapping in quotes
          return value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    console.log(`Writing updated song index to ${SONG_INDEX_PATH}...`);
    fs.writeFileSync(SONG_INDEX_PATH, csvOutput, 'utf8');
    
    // Print summary
    const hasLyricsCount = updatedSongIndex.filter(song => song['Has Lyrics'] === 'Yes').length;
    const skippedCount = updatedSongIndex.filter(song => song['Has Lyrics'] === 'Skipped').length;
    const failedCount = updatedSongIndex.filter(song => song['Has Lyrics'] === 'Failed').length;
    
    console.log('\nSummary:');
    console.log(`Total songs: ${updatedSongIndex.length}`);
    console.log(`Songs with lyrics: ${hasLyricsCount}`);
    console.log(`Songs skipped: ${skippedCount}`);
    console.log(`Songs failed: ${failedCount}`);
  } catch (err) {
    console.error('Error updating song index:', err);
  }
}

// Run the script
updateSongIndex().catch(error => {
  console.error('Error updating song index:', error);
  process.exit(1);
}); 