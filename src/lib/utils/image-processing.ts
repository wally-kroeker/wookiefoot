import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

// Constants for image requirements
export const IMAGE_REQUIREMENTS = {
  FULL_SIZE: {
    MIN_WIDTH: 1200,
    MIN_HEIGHT: 1200,
    ASPECT_RATIO: 1, // 1:1 square
    MAX_FILE_SIZE: 500 * 1024, // 500KB
    DPI: 300,
    // Allow upscaling if image is within 20% of minimum size
    UPSCALE_THRESHOLD: 0.8, // 960x960 and above can be upscaled
  },
  THUMBNAIL: {
    WIDTH: 300,
    HEIGHT: 300,
    MAX_FILE_SIZE: 50 * 1024, // 50KB
  },
} as const;

// Custom error for image validation
export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageValidationError';
  }
}

// Types for validation options
export interface ValidationOptions {
  MIN_WIDTH?: number;
  MIN_HEIGHT?: number;
  WIDTH?: number;
  HEIGHT?: number;
  ASPECT_RATIO?: number;
  MAX_FILE_SIZE: number;
  DPI?: number;
}

// Types for image metadata
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  density?: number;
}

/**
 * Validates image dimensions and properties
 */
export async function validateImage(
  imagePath: string,
  options: ValidationOptions
): Promise<ImageMetadata> {
  const stats = await fs.stat(imagePath);
  const fileSize = stats.size;

  if (fileSize > options.MAX_FILE_SIZE) {
    throw new ImageValidationError(
      `Image size ${fileSize} bytes exceeds maximum ${options.MAX_FILE_SIZE} bytes`
    );
  }

  const metadata = await sharp(imagePath).metadata();

  if (!metadata.width || !metadata.height) {
    throw new ImageValidationError('Unable to read image dimensions');
  }

  // Check dimensions
  if (options.MIN_WIDTH && options.MIN_HEIGHT) {
    if (metadata.width < options.MIN_WIDTH || metadata.height < options.MIN_HEIGHT) {
      throw new ImageValidationError(
        `Image dimensions ${metadata.width}x${metadata.height} below minimum ${options.MIN_WIDTH}x${options.MIN_HEIGHT}`
      );
    }

    // Check aspect ratio if specified
    if (options.ASPECT_RATIO) {
      const aspectRatio = metadata.width / metadata.height;
      if (Math.abs(aspectRatio - options.ASPECT_RATIO) > 0.01) {
        throw new ImageValidationError(
          `Image aspect ratio ${aspectRatio.toFixed(2)} does not match required ${options.ASPECT_RATIO}`
        );
      }
    }

    // Check DPI if specified
    if (options.DPI && metadata.density && metadata.density < options.DPI) {
      throw new ImageValidationError(
        `Image DPI ${metadata.density} below required ${options.DPI}`
      );
    }
  }

  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format || '',
    size: fileSize,
    density: metadata.density,
  };
}

/**
 * Generates a thumbnail from a full-size image
 */
export async function generateThumbnail(
  inputPath: string,
  outputPath: string
): Promise<void> {
  const { WIDTH, HEIGHT, MAX_FILE_SIZE } = IMAGE_REQUIREMENTS.THUMBNAIL;

  // First attempt with high quality
  await sharp(inputPath)
    .resize(WIDTH, HEIGHT, {
      fit: 'cover',
      position: 'center',
    })
    .png({
      quality: 80,
      compressionLevel: 9,
      palette: true,
      colors: 256
    })
    .toFile(outputPath);

  // Verify thumbnail size
  const stats = await fs.stat(outputPath);
  if (stats.size > MAX_FILE_SIZE) {
    // If thumbnail is too large, regenerate with more compression
    await sharp(inputPath)
      .resize(WIDTH, HEIGHT, {
        fit: 'cover',
        position: 'center',
      })
      .png({
        quality: 60,
        compressionLevel: 9,
        palette: true,
        colors: 128
      })
      .toFile(outputPath);
  }
}

/**
 * Processes an album cover image:
 * 1. Validates dimensions and aspect ratio
 * 2. Optimizes full-size image
 * 3. Generates thumbnail
 * 4. Returns paths to both images
 */
export async function processAlbumCover(
  albumName: string,
  inputPath: string
): Promise<{ fullPath: string; thumbnailPath: string }> {
  // Create sanitized filename
  const sanitizedName = albumName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Always use PNG for consistency and quality
  const fullPath = path.join('public/images/albums/full', `${sanitizedName}.png`);
  const thumbnailPath = path.join('public/images/albums/thumbnails', `${sanitizedName}.png`);

  // First validate dimensions and aspect ratio
  const metadata = await sharp(inputPath).metadata();
  
  if (!metadata.width || !metadata.height) {
    throw new ImageValidationError('Unable to read image dimensions');
  }

  // Check if image needs and can be upscaled
  const minRequiredSize = IMAGE_REQUIREMENTS.FULL_SIZE.MIN_WIDTH;
  const minAllowedSize = minRequiredSize * IMAGE_REQUIREMENTS.FULL_SIZE.UPSCALE_THRESHOLD;
  
  if (metadata.width < minAllowedSize || metadata.height < minAllowedSize) {
    throw new ImageValidationError(
      `Image dimensions ${metadata.width}x${metadata.height} too small to upscale. Minimum allowed: ${minAllowedSize}x${minAllowedSize}`
    );
  }

  // Check aspect ratio
  const aspectRatio = metadata.width / metadata.height;
  if (Math.abs(aspectRatio - IMAGE_REQUIREMENTS.FULL_SIZE.ASPECT_RATIO) > 0.01) {
    throw new ImageValidationError(
      `Image aspect ratio ${aspectRatio.toFixed(2)} does not match required ${IMAGE_REQUIREMENTS.FULL_SIZE.ASPECT_RATIO}`
    );
  }

  // Process full-size image with progressive optimization strategies
  const strategies = [
    // Strategy 1: High quality, maximum compression
    { quality: 100, compressionLevel: 9, palette: false },
    // Strategy 2: Slightly reduced quality, maximum compression
    { quality: 90, compressionLevel: 9, palette: false },
    // Strategy 3: Reduced quality with color palette
    { quality: 80, compressionLevel: 9, palette: true, colors: 256 },
    // Strategy 4: Further reduced quality with smaller palette
    { quality: 70, compressionLevel: 9, palette: true, colors: 128 },
    // Strategy 5: Minimum acceptable quality with smallest palette
    { quality: 60, compressionLevel: 9, palette: true, colors: 64 }
  ];

  let success = false;
  for (const strategy of strategies) {
    try {
      const pipeline = sharp(inputPath)
        .resize(minRequiredSize, minRequiredSize, {
          fit: 'fill',
          withoutEnlargement: false
        })
        .png(strategy);

      await pipeline.toFile(fullPath);

      const stats = await fs.stat(fullPath);
      if (stats.size <= IMAGE_REQUIREMENTS.FULL_SIZE.MAX_FILE_SIZE) {
        success = true;
        break;
      }

      console.log(`Strategy (quality: ${strategy.quality}, colors: ${strategy.colors || 'full'}) produced size: ${stats.size} bytes`);
    } catch (error) {
      console.error('Error with strategy:', error);
    }
  }

  if (!success) {
    throw new ImageValidationError(
      'Unable to compress image to meet size requirement while maintaining acceptable quality'
    );
  }

  // Generate and validate thumbnail
  await generateThumbnail(inputPath, thumbnailPath);
  await validateImage(thumbnailPath, {
    WIDTH: IMAGE_REQUIREMENTS.THUMBNAIL.WIDTH,
    HEIGHT: IMAGE_REQUIREMENTS.THUMBNAIL.HEIGHT,
    MAX_FILE_SIZE: IMAGE_REQUIREMENTS.THUMBNAIL.MAX_FILE_SIZE,
  });

  return { fullPath, thumbnailPath };
}

/**
 * Gets the relative URL for an album image
 */
export function getAlbumImageUrl(
  albumName: string,
  type: 'full' | 'thumbnail' = 'full'
): string {
  const sanitizedName = albumName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `/images/albums/${type}/${sanitizedName}.png`;
}
