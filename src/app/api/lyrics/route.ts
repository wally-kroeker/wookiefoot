import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Function to get the content directory path
function getContentPath(): string {
  return path.join(process.cwd(), 'src', 'content', 'lyrics');
}

// Function to read and parse song_index.csv
async function getSongIndex() {
  try {
    const csvPath = path.join(process.cwd(), 'song_index.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');

    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    return records;
  } catch (error) {
    console.error('Error reading song_index.csv:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    console.log(`API Request received with slug: ${slug || 'none'}`);
    
    if (!slug) {
      // Return all songs
      const songIndex = await getSongIndex();
      console.log(`Returning full song index with ${songIndex.length} songs`);
      return NextResponse.json({ songs: songIndex });
    }

    const songIndex = await getSongIndex();
    console.log(`Loaded song index with ${songIndex.length} entries`);
    
    // Find song by pre-computed slug from CSV
    const entry: any = songIndex.find((s: any) => s['Song Slug'] === slug);

    if (entry) {
      console.log(`Found matching song: "${entry.Title}" (${entry.Album}) with slug "${entry['Song Slug']}"`);
    }
    
    if (!entry) {
      console.log(`No matching song found for slug: ${slug}`);
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }
    
    if (entry['Has Lyrics'] !== 'TRUE' && entry['Has Lyrics'] !== 'Yes') {
      console.log(`Song found but has no lyrics. Has Lyrics value: ${entry['Has Lyrics']}`);
      return NextResponse.json({ error: 'Song has no lyrics' }, { status: 404 });
    }

    // Use pre-computed album directory from CSV
    const albumDir = entry['Album Directory'];
    console.log(`Album directory name: ${albumDir}`);

    const songPath = path.join(
      getContentPath(),
      albumDir,
      `${slug}.md`
    );

    console.log(`Attempting to read lyrics file at: ${songPath}`);
    
    // Check if file exists before trying to read it
    try {
      await fs.access(songPath);
    } catch (accessError) {
      console.error(`File does not exist: ${songPath}`);
      
      // Try to list available files in the album directory to help debugging
      try {
        const albumDirPath = path.join(getContentPath(), albumDir);
        console.log(`Listing files in ${albumDirPath}:`);
        const files = await fs.readdir(albumDirPath);
        console.log(files);
      } catch (dirError) {
        console.error(`Could not list directory: ${dirError instanceof Error ? dirError.message : String(dirError)}`);
      }
      
      return NextResponse.json(
        { error: 'Lyrics file not found', path: songPath },
        { status: 404 }
      );
    }
    
    try {
      const content = await fs.readFile(songPath, 'utf-8');
      console.log(`Successfully read lyrics file, returning content (${content.length} bytes)`);
      return NextResponse.json({ content, songIndex });
    } catch (fileError) {
      console.error(`Error reading lyrics file: ${fileError}`);
      return NextResponse.json(
        { error: 'Error reading lyrics file', path: songPath, message: fileError instanceof Error ? fileError.message : String(fileError) },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error(`Error in lyrics API:`, error);
    return NextResponse.json(
      { error: 'Error processing request', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
