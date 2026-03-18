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
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      // Return all songs
      const songIndex = await getSongIndex();
      return NextResponse.json({ songs: songIndex });
    }

    const songIndex = await getSongIndex();

    // Find song by pre-computed slug from CSV
    const entry: any = songIndex.find((s: any) => s['Song Slug'] === slug);

    if (!entry) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    if (entry['Has Lyrics'] !== 'TRUE' && entry['Has Lyrics'] !== 'Yes') {
      return NextResponse.json({ error: 'Song has no lyrics' }, { status: 404 });
    }

    // Use pre-computed album directory from CSV
    const albumDir = entry['Album Directory'];

    const songPath = path.join(
      getContentPath(),
      albumDir,
      `${slug}.md`
    );

    // Check if file exists before trying to read it
    try {
      await fs.access(songPath);
    } catch (accessError) {
      return NextResponse.json(
        { error: 'Lyrics file not found', path: songPath },
        { status: 404 }
      );
    }

    try {
      const content = await fs.readFile(songPath, 'utf-8');
      return NextResponse.json({ content, songIndex });
    } catch (fileError) {
      return NextResponse.json(
        { error: 'Error reading lyrics file', path: songPath, message: fileError instanceof Error ? fileError.message : String(fileError) },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Error processing request', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
