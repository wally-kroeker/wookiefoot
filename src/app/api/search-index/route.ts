import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import matter from 'gray-matter';

export const dynamic = 'force-dynamic';

export async function GET() {
  const csvPath = path.join(process.cwd(), 'song_index.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

  const songs = [];

  for (const record of records) {
    const hasLyrics = record['Has Lyrics'];
    if (hasLyrics !== 'Yes' && hasLyrics !== 'TRUE') continue;

    const albumDir = record['Album Directory'];
    const slug = record['Song Slug'];

    const mdPath = path.join(
      process.cwd(),
      'src',
      'content',
      'lyrics',
      albumDir,
      `${slug}.md`
    );
    let lyrics = '';
    let tags: string[] = [];

    try {
      const mdContent = fs.readFileSync(mdPath, 'utf-8');
      const { data, content } = matter(mdContent);
      lyrics = content.trim();
      tags = data.tags || [];
    } catch {
      // File might not exist, skip lyrics
    }

    songs.push({
      title: record['Title'],
      album: record['Album'],
      slug: slug,
      albumDirectory: albumDir,
      duration: record['Duration'],
      lyrics: lyrics,
      tags: tags,
    });
  }

  return NextResponse.json({ songs });
}
