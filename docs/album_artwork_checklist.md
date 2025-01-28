# Album Artwork Checklist

Each album requires two versions of artwork:
1. Full Size: 1200x1200px minimum, square, 300 DPI, max 500KB
2. Thumbnail: 300x300px, square, max 50KB

## Processing Album Artwork

Use the provided script to automatically process album artwork:

```bash
cd projects/wookiefoot
npm run process-album-art "/path/to/image" "Album Name"
```

For example:
```bash
npm run process-album-art "./album-art.png" "Writing on the Wall"
```

The script will:
- Validate image dimensions and aspect ratio
- Upscale images if they're close to required size (within 20%)
- Optimize the image to meet size requirements
- Generate both full-size and thumbnail versions
- Place files in the correct project directories

## Required Images

### You're IT! (2024)
- [ ] Full: `/public/images/albums/full/youre-it.png`
- [ ] Thumbnail: `/public/images/albums/thumbnails/youre-it.png`

### Activate (2023)
- [ ] Full: `/public/images/albums/full/activate.png`
- [ ] Thumbnail: `/public/images/albums/thumbnails/activate.png`

### Be Fearless and Play (2021)
- [ ] Full: `/public/images/albums/full/be-fearless-and-play.png`
- [ ] Thumbnail: `/public/images/albums/thumbnails/be-fearless-and-play.png`

### Make Belief (2019)
- [ ] Full: `/public/images/albums/full/make-belief.png`
- [ ] Thumbnail: `/public/images/albums/thumbnails/make-belief.png`

### Domesticated (2016)
- [ ] Full: `/public/images/albums/full/domesticated.png`
- [ ] Thumbnail: `/public/images/albums/thumbnails/domesticated.png`

### Out of the Jar (2013)
- [ ] Full: `/public/images/albums/full/out-of-the-jar.png`
- [ ] Thumbnail: `/public/images/albums/thumbnails/out-of-the-jar.png`

### Ready or Not... (2010)
- [ ] Full: `/public/images/albums/full/ready-or-not.png`
- [ ] Thumbnail: `/public/images/albums/thumbnails/ready-or-not.png`

### Writing on the Wall (2004)
- [x] Full: `/public/images/albums/full/writing-on-the-wall.png`
- [x] Thumbnail: `/public/images/albums/thumbnails/writing-on-the-wall.png`

## Image Requirements

### Full Size Requirements
- Resolution: Minimum 1200x1200 pixels
- DPI: 300
- Aspect Ratio: 1:1 (square)
- Color Space: sRGB
- Format: PNG
- Max File Size: 500KB
- Quality: No compression artifacts, sharp text, consistent color

### Thumbnail Requirements
- Resolution: 300x300 pixels
- Aspect Ratio: 1:1 (square)
- Format: PNG
- Max File Size: 50KB
- Quality: Web-optimized but clear

## Notes
- All filenames use kebab-case
- Images will be automatically processed and validated by the image processing utility
- Thumbnails will be generated automatically from full-size images
- Both versions must maintain consistent color reproduction
- Images should have proper white balance
- Text in artwork should remain sharp and legible
- PNG format is used for all images to maintain quality and consistency
