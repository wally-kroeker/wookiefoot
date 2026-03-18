import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export default function sitemap(): MetadataRoute.Sitemap {
  const csvPath = path.join(process.cwd(), 'song_index.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const songs = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
  const baseUrl = 'https://wookiefoot.kroeker.fun';

  const albumDirs = [...new Set(songs.map((s: any) => s['Album Directory']))];

  const songUrls = songs
    .filter((s: any) => s['Has Lyrics'] === 'TRUE')
    .map((s: any) => ({
      url: `${baseUrl}/lyrics/${s['Song Slug']}`,
      lastModified: new Date(),
      priority: 0.7 as const,
    }));

  const albumUrls = albumDirs.map((dir: string) => ({
    url: `${baseUrl}/albums/${dir}`,
    lastModified: new Date(),
    priority: 0.8 as const,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/albums`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/search`, lastModified: new Date(), priority: 0.5 },
    { url: `${baseUrl}/community`, lastModified: new Date(), priority: 0.5 },
    ...albumUrls,
    ...songUrls,
  ];
}
