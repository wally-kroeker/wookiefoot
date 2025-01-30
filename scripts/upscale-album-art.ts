#!/usr/bin/env node
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { IMAGE_REQUIREMENTS, processAlbumCover } from '../src/lib/utils/image-processing.js';

// Override the upscale threshold to allow smaller images
const MODIFIED_REQUIREMENTS = {
  ...IMAGE_REQUIREMENTS,
  FULL_SIZE: {
    ...IMAGE_REQUIREMENTS.FULL_SIZE,
    UPSCALE_THRESHOLD: 0, // Allow any size to be upscaled
  },
};

async function upscaleImage(inputPath: string, outputPath: string): Promise<void> {
  // Use high-quality upscaling settings
  await sharp(inputPath)
    .resize(MODIFIED_REQUIREMENTS.FULL_SIZE.MIN_WIDTH, MODIFIED_REQUIREMENTS.FULL_SIZE.MIN_WIDTH, {
      fit: 'fill',
      withoutEnlargement: false,
      kernel: 'lanczos3', // High-quality resampling
    })
    .png({
      quality: 100,
      compressionLevel: 9,
      palette: false, // Preserve full color range
    })
    .toFile(outputPath);
}

async function processImage(inputPath: string, albumName: string): Promise<void> {
  console.log(`\nProcessing album art for "${albumName}"...`);
  console.log(`Input file: ${inputPath}`);

  try {
    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    // First upscale the image
    const upscaledPath = path.join(tempDir, `${path.basename(inputPath)}.upscaled.png`);
    await upscaleImage(inputPath, upscaledPath);

    // Then process it using the standard album cover processor
    await processAlbumCover(albumName, upscaledPath);

    // Clean up temp file
    await fs.unlink(upscaledPath);

    console.log('✓ Successfully processed album artwork');
    console.log(`  Full size: public/images/albums/full/${albumName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`);
    console.log(`  Thumbnail: public/images/albums/thumbnails/${albumName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`);

  } catch (error) {
    console.error('\n✗ Error processing album artwork:');
    if (error instanceof Error) {
      console.error('  ' + error.message);
    } else {
      console.error('  An unknown error occurred');
    }
    process.exit(1);
  }
}

// Get command line arguments
const [,, inputPath, albumName] = process.argv;

if (!inputPath || !albumName) {
  console.error('\nUsage: npm run upscale-album-art "/path/to/image" "Album Name"');
  console.error('\nExample: npm run upscale-album-art "./album-art.png" "Ready or Not"');
  process.exit(1);
}

processImage(inputPath, albumName);
