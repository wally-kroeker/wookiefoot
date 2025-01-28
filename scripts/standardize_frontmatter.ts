#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

interface SongMetadata {
  title: string;
  albumId: string;
  description?: string;
  duration?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  tags?: string[];
  contributors?: string[];
  lrcLibId?: number;
  isVerified?: boolean;
  syncedLyrics?: string;
  slug?: string;
}

async function getAllLyricFiles(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir, { withFileTypes: true });
  const paths: string[] = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      paths.push(...await getAllLyricFiles(fullPath));
    } else if (file.name.endsWith('.md')) {
      paths.push(fullPath);
    }
  }

  return paths;
}

function generateSlug(filePath: string): string {
  // Remove extension and get the base filename
  const basename = path.basename(filePath, '.md');
  // Convert to lowercase and replace spaces with hyphens
  return basename.toLowerCase().replace(/\s+/g, '-');
}

function getAlbumIdFromPath(filePath: string): string {
  // Get the album name from the directory structure
  const parts = filePath.split(path.sep);
  const albumIndex = parts.indexOf('lyrics') + 1;
  if (albumIndex > 0 && albumIndex < parts.length) {
    return parts[albumIndex];
  }
  return '';
}

async function standardizeFrontmatter(filePath: string): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data: existingFrontmatter, content: markdownContent } = matter(content);

  // Keep existing metadata or use defaults, but don't generate new content
  const newMetadata: Partial<SongMetadata> = {
    // Required fields
    title: existingFrontmatter.title || path.basename(filePath, '.md'),
    albumId: getAlbumIdFromPath(filePath),
    slug: generateSlug(filePath),
  };

  // Always include these fields, even if empty
  newMetadata.description = existingFrontmatter.description || '';
  newMetadata.duration = existingFrontmatter.duration || '';
  newMetadata.youtubeUrl = existingFrontmatter.youtubeUrl || '';
  newMetadata.spotifyUrl = existingFrontmatter.spotifyUrl || '';
  newMetadata.tags = existingFrontmatter.tags || [];
  newMetadata.contributors = existingFrontmatter.contributors || [];

  // Optional fields - only include if they exist and are not undefined
  if (existingFrontmatter.lrcLibId !== undefined) {
    newMetadata.lrcLibId = existingFrontmatter.lrcLibId;
  }
  if (existingFrontmatter.isVerified !== undefined) {
    newMetadata.isVerified = existingFrontmatter.isVerified;
  }
  if (existingFrontmatter.syncedLyrics !== undefined) {
    newMetadata.syncedLyrics = existingFrontmatter.syncedLyrics;
  }

  // Remove any undefined values
  Object.keys(newMetadata).forEach(key => {
    if ((newMetadata as any)[key] === undefined) {
      delete (newMetadata as any)[key];
    }
  });

  // Create new frontmatter content
  const newContent = matter.stringify(markdownContent, newMetadata);

  // Write the updated content back to the file
  await fs.writeFile(filePath, newContent, 'utf-8');
  console.log(`Updated frontmatter for ${filePath}`);
}

async function main() {
  try {
    const lyricsDir = path.join(process.cwd(), 'src', 'content', 'lyrics');
    const lyricFiles = await getAllLyricFiles(lyricsDir);
    
    console.log(`Found ${lyricFiles.length} lyric files`);
    
    for (const file of lyricFiles) {
      await standardizeFrontmatter(file);
    }
    
    console.log('Frontmatter standardization complete!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
