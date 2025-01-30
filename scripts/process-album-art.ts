#!/usr/bin/env node
import { processAlbumCover, ImageValidationError } from '../src/lib/utils/image-processing.js';
import path from 'path';

async function main() {
  const [inputPath, albumName] = process.argv.slice(2);
  
  if (!inputPath || !albumName) {
    console.error('\nUsage: npm run process-album-art <input-path> "Album Name"');
    console.error('\nExample:');
    console.error('npm run process-album-art "./Album art Writing on the Wall.png" "Writing on the Wall"\n');
    process.exit(1);
  }

  try {
    // Resolve absolute path if relative path is provided
    const absolutePath = path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
    
    console.log(`\nProcessing album art for "${albumName}"...`);
    console.log(`Input file: ${absolutePath}`);
    
    const { fullPath, thumbnailPath } = await processAlbumCover(albumName, absolutePath);
    
    console.log('\n✓ Successfully processed album artwork:');
    console.log(`  Full size: ${fullPath}`);
    console.log(`  Thumbnail: ${thumbnailPath}\n`);
  } catch (error: unknown) {
    console.error('\n✗ Error processing album artwork:');
    if (error instanceof ImageValidationError) {
      console.error(`  ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`  ${error.message}`);
    } else {
      console.error('  An unknown error occurred');
    }
    console.error('\nPlease ensure the input image meets these requirements:');
    console.error('- Full size: 1200x1200px minimum, square, 300 DPI, max 500KB');
    console.error('- Format: JPG/PNG\n');
    process.exit(1);
  }
}

main();
