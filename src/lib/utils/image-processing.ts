// Constants for image requirements (used for both client and server)
export const IMAGE_REQUIREMENTS = {
  FULL_SIZE: {
    MIN_WIDTH: 1200,
    MIN_HEIGHT: 1200,
    ASPECT_RATIO: 1, // 1:1 square
    MAX_FILE_SIZE: 500 * 1024, // 500KB
    DPI: 300,
    UPSCALE_THRESHOLD: 0.8, // 960x960 and above can be upscaled
  },
  THUMBNAIL: {
    WIDTH: 300,
    HEIGHT: 300,
    MAX_FILE_SIZE: 50 * 1024, // 50KB
  },
} as const;

// Types for validation options (used for type safety across the app)
export interface ValidationOptions {
  MIN_WIDTH?: number;
  MIN_HEIGHT?: number;
  WIDTH?: number;
  HEIGHT?: number;
  ASPECT_RATIO?: number;
  MAX_FILE_SIZE: number;
  DPI?: number;
}

// Types for image metadata (used for type safety across the app)
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  density?: number;
}

/**
 * Gets the relative URL for an album image
 * This is a client-safe function that only handles URL construction
 */
export function getAlbumImageUrl(
  albumName: string,
  type: 'full' | 'thumbnail' = 'full'
): string {
  const sanitizedName = sanitizeAlbumName(albumName);
  const basePath = type === 'full' ? '/images/albums/full' : '/images/albums/thumbnails';
  return `${basePath}/${sanitizedName}.png`;
}

/**
 * Helper function to sanitize album names consistently
 */
export function sanitizeAlbumName(albumName: string): string {
  return albumName
    .toLowerCase()
    .replace(/[''"]/g, '') // Remove apostrophes and quotes
    .replace(/[^a-z0-9]+/g, '-') // Replace any non-alphanumeric with single hyphen
    .replace(/-{2,}/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .trim();
}
