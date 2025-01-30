import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

// Constants for image requirements
export const IMAGE_REQUIREMENTS = {
  FULL_SIZE: {
    MIN_WIDTH: 1200,
    MIN_HEIGHT: 1200,
    ASPECT_RATIO: 1,
    MAX_FILE_SIZE: 500 * 1024,
    DPI: 300,
    UPSCALE_THRESHOLD: 0.8,
  },
  THUMBNAIL: {
    WIDTH: 300,
    HEIGHT: 300,
    MAX_FILE_SIZE: 50 * 1024,
  },
};

class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageValidationError';
  }
}

interface ValidationOptions {
  MIN_WIDTH?: number;
  MIN_HEIGHT?: number;
  WIDTH?: number;
  HEIGHT?: number;
  ASPECT_RATIO?: number;
  MAX_FILE_SIZE: number;
  DPI?: number;
}

async function validateImage(imagePath: string, options: ValidationOptions) {
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

  if (options.MIN_WIDTH && options.MIN_HEIGHT) {
    if (metadata.width < options.MIN_WIDTH || metadata.height < options.MIN_HEIGHT) {
      throw new ImageValidationError(
        `Image dimensions ${metadata.width}x${metadata.height} below minimum ${options.MIN_WIDTH}x${options.MIN_HEIGHT}`
      );
    }

    if (options.ASPECT_RATIO) {
      const aspectRatio = metadata.width / metadata.height;
      if (Math.abs(aspectRatio - options.ASPECT_RATIO) > 0.01) {
        throw new ImageValidationError(
          `Image aspect ratio ${aspectRatio.toFixed(2)} does not match required ${options.ASPECT_RATIO}`
        );
      }
    }

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

async function generateThumbnail(inputPath: string, outputPath: string) {
  const { WIDTH, HEIGHT, MAX_FILE_SIZE } = IMAGE_REQUIREMENTS.THUMBNAIL;

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

  const stats = await fs.stat(outputPath);
  if (stats.size > MAX_FILE_SIZE) {
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const albumName = formData.get('albumName') as string;

    if (!file || !albumName) {
      return NextResponse.json(
        { error: 'Missing file or album name' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const sanitizedName = albumName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tempPath = path.join('/tmp', `${sanitizedName}-${Date.now()}.png`);
    const fullPath = path.join('public/images/albums/full', `${sanitizedName}.png`);
    const thumbnailPath = path.join('public/images/albums/thumbnails', `${sanitizedName}.png`);

    // Write the uploaded file to temp location
    await fs.writeFile(tempPath, buffer);

    // Process the image
    const metadata = await sharp(tempPath).metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new ImageValidationError('Unable to read image dimensions');
    }

    const minRequiredSize = IMAGE_REQUIREMENTS.FULL_SIZE.MIN_WIDTH;
    const minAllowedSize = minRequiredSize * IMAGE_REQUIREMENTS.FULL_SIZE.UPSCALE_THRESHOLD;
    
    if (metadata.width < minAllowedSize || metadata.height < minAllowedSize) {
      throw new ImageValidationError(
        `Image dimensions ${metadata.width}x${metadata.height} too small to upscale. Minimum allowed: ${minAllowedSize}x${minAllowedSize}`
      );
    }

    const aspectRatio = metadata.width / metadata.height;
    if (Math.abs(aspectRatio - IMAGE_REQUIREMENTS.FULL_SIZE.ASPECT_RATIO) > 0.01) {
      throw new ImageValidationError(
        `Image aspect ratio ${aspectRatio.toFixed(2)} does not match required ${IMAGE_REQUIREMENTS.FULL_SIZE.ASPECT_RATIO}`
      );
    }

    const strategies = [
      { quality: 100, compressionLevel: 9, palette: false },
      { quality: 90, compressionLevel: 9, palette: false },
      { quality: 80, compressionLevel: 9, palette: true, colors: 256 },
      { quality: 70, compressionLevel: 9, palette: true, colors: 128 },
      { quality: 60, compressionLevel: 9, palette: true, colors: 64 }
    ];

    let success = false;
    for (const strategy of strategies) {
      try {
        const pipeline = sharp(tempPath)
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
      } catch (error) {
        console.error('Error with strategy:', error);
      }
    }

    if (!success) {
      throw new ImageValidationError(
        'Unable to compress image to meet size requirement while maintaining acceptable quality'
      );
    }

    await generateThumbnail(tempPath, thumbnailPath);
    await validateImage(thumbnailPath, {
      WIDTH: IMAGE_REQUIREMENTS.THUMBNAIL.WIDTH,
      HEIGHT: IMAGE_REQUIREMENTS.THUMBNAIL.HEIGHT,
      MAX_FILE_SIZE: IMAGE_REQUIREMENTS.THUMBNAIL.MAX_FILE_SIZE,
    });

    // Clean up temp file
    await fs.unlink(tempPath);

    return NextResponse.json({
      success: true,
      paths: {
        full: `/images/albums/full/${sanitizedName}.png`,
        thumbnail: `/images/albums/thumbnails/${sanitizedName}.png`,
      },
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}