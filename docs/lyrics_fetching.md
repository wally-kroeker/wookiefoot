# Lyrics Fetching System

## Overview
The lyrics fetching system consists of multiple scripts designed to fetch lyrics from various sources, with fallback mechanisms and manual input capabilities. The system tracks progress in song_index.csv and generates markdown files for each song.

## Scripts

### enhanced_lyrics_fetcher.py
The primary lyrics fetching script with multi-source support.

Features:
- Multiple source support (Genius, AZLyrics, Musixmatch, Lyrics.com, songlyrics.com, elyrics.net)
- Direct URL pattern matching
- Tavily API integration for intelligent search
- Manual input fallback
- YouTube Music and Spotify link finding
- Progress tracking and detailed logging
- Markdown file generation with frontmatter

Usage:
```bash
python scripts/enhanced_lyrics_fetcher.py
```

### lyricsaz_fetcher.py
Specialized script for fetching lyrics from lyrics.az.

Features:
- Direct URL pattern matching for lyrics.az
- Follows format: https://lyrics.az/wookiefoot/{album}/{song}.html
- Progress tracking
- Markdown file generation

Usage:
```bash
python scripts/lyricsaz_fetcher.py
```

## File Organization

### Lyrics Storage
- Location: `/src/content/lyrics/`
- Structure:
  ```
  lyrics/
  ├── album-name/
  │   ├── song-title.md
  │   └── ...
  └── ...
  ```

### Markdown Format
```markdown
---
id: song-slug
title: Song Title
albumId: album-slug
trackNumber: 1
description: Lyrics for Song Title by WookieFoot
youtubeUrl: https://music.youtube.com/watch?v=...
spotifyUrl: https://open.spotify.com/track/...
tags: ["lyrics"]
contributors: ["WookieFoot"]
createdAt: YYYY-MM-DD
---

[Lyrics content here]
```

## Progress Tracking
- File: song_index.csv
- Status values:
  - "Yes": Lyrics successfully fetched
  - "Failed": Unable to fetch lyrics
  - "Skipped": Instrumental or intro track
  - "Manual": Lyrics entered manually

## Environment Setup
Required Python packages:
```
requests
beautifulsoup4
pyyaml
tavily-python
```

## Adding New Sources
To add a new lyrics source:
1. Create URL pattern matching method
2. Implement scraping logic
3. Add to the source list in enhanced_lyrics_fetcher.py
4. Update documentation

## Error Handling
- Rate limiting between requests
- Proper error logging
- Multiple fallback sources
- Manual input option

## Future Improvements
1. Add more lyrics sources
2. Implement batch processing
3. Improve error recovery
4. Add source reliability tracking
5. Enhance music link finding