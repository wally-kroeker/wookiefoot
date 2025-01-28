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
  const csvPath = path.join(process.cwd(), 'song_index.csv');
  const csvContent = await fs.readFile(csvPath, 'utf-8');
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });

  return records;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  
  if (!slug) {
    // Return all songs
    const songIndex = await getSongIndex();
    return NextResponse.json({ songs: songIndex });
  }

  try {
    const songIndex = await getSongIndex();
    const entry = songIndex.find((s: any) => 
      s['Song Title'].toLowerCase()
        .replace(/[^a-z0-9.]+/g, '-')
        .replace(/(^-|-$)/g, '') === slug
    );
    
    if (!entry || entry['Has Lyrics'] !== 'Yes') {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const albumDir = entry.Album.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const songPath = path.join(
      getContentPath(),
      albumDir,
      `${slug}.md`
    );

    const content = await fs.readFile(songPath, 'utf-8');
    
    return NextResponse.json({ content, songIndex });
  } catch (error) {
    console.error(`Error reading song file for ${slug}:`, error);
    return NextResponse.json(
      { error: 'Error reading song file' },
      { status: 500 }
    );
  }
}
