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

  await sharp(inputPath)
    .resize(WIDTH, HEIGHT, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({
      quality: 80,
      progressive: true,
    })
    .toFile(outputPath);

  // Verify thumbnail size
  const stats = await fs.stat(outputPath);
  if (stats.size > MAX_FILE_SIZE) {
    // If thumbnail is too large, regenerate with lower quality
    await sharp(inputPath)
      .resize(WIDTH, HEIGHT, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({
        quality: 60,
        progressive: true,
      })
      .toFile(outputPath);
  }
}

/**
 * Processes an album cover image:
 * 1. Validates the full-size image
 * 2. Generates and validates thumbnail
 * 3. Returns paths to both images
 */
export async function processAlbumCover(
  albumName: string,
  inputPath: string
): Promise<{ fullPath: string; thumbnailPath: string }> {
  // Create sanitized filename
  const sanitizedName = albumName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const extension = path.extname(inputPath);

  // Define output paths
  const fullPath = path.join('public/images/albums/full', `${sanitizedName}${extension}`);
  const thumbnailPath = path.join('public/images/albums/thumbnails', `${sanitizedName}${extension}`);

  // Validate full-size image
  await validateImage(inputPath, {
    MIN_WIDTH: IMAGE_REQUIREMENTS.FULL_SIZE.MIN_WIDTH,
    MIN_HEIGHT: IMAGE_REQUIREMENTS.FULL_SIZE.MIN_HEIGHT,
    ASPECT_RATIO: IMAGE_REQUIREMENTS.FULL_SIZE.ASPECT_RATIO,
    MAX_FILE_SIZE: IMAGE_REQUIREMENTS.FULL_SIZE.MAX_FILE_SIZE,
    DPI: IMAGE_REQUIREMENTS.FULL_SIZE.DPI,
  });

  // Copy full-size image to destination
  await fs.copyFile(inputPath, fullPath);

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
  return `/images/albums/${type}/${sanitizedName}.jpg`;
}
