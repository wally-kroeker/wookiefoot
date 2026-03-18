# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WookieFoot is a fan website for the band WookieFoot that provides a comprehensive lyrics repository organized by album. Built with Next.js 14, the site uses a CSV-based data architecture with markdown files for lyrics storage. This is a non-monetized, open-source community project.

## Development Commands

```bash
# Start development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Update song index from master song list
node scripts/update_song_index.js

# Standardize markdown front matter
npx tsx scripts/standardize_frontmatter.ts
```

## CSV-Based Data Architecture

The project uses a **two-file CSV system** as the source of truth:

### `song_index.csv` (Master Runtime Index)
- **7 columns**: Album, Track Number, Title, Song Slug, Has Lyrics, Album Directory, Duration
- Read by `/api/lyrics/route.ts` to serve song data
- ~110 songs across 8+ albums
- **Critical**: Always maintain CSV structure when adding songs

### `cline_docs/mastersonglist.csv` (Source of Truth)
- Authoritative song catalog
- Used by `update_song_index.js` to sync with `song_index.csv`

### Slug Generation Rules
When creating new songs or albums, slugs must follow these rules:
1. Lowercase
2. Remove apostrophes/quotes
3. Replace non-alphanumeric with hyphens
4. Collapse multiple hyphens to single
5. Remove leading/trailing hyphens

Examples:
- "You're It!" → "youre-it"
- "Come to Life" → "come-to-life"

## Markdown Lyrics Structure

**Location**: `src/content/lyrics/[album-directory]/[song-slug].md`

**Front Matter Template**:
```yaml
---
title: Song Title
albumId: album-directory-name
slug: song-slug
description: Brief description
duration: MM:SS
youtubeUrl: https://youtube.com/...
spotifyUrl: https://spotify.com/...
tags: [tag1, tag2]
contributors: [contributor1, contributor2]
---
```

**Body**: Plain text lyrics after front matter

## Core Data Flow

```
mastersonglist.csv
  → scripts/update_song_index.js
  → song_index.csv
  → /api/lyrics/route.ts (reads CSV + markdown files)
  → src/lib/utils/markdown.ts (processes markdown to HTML)
  → page components (display)
```

## Key Files & Architecture

### API Layer
- **`src/app/api/lyrics/route.ts`** - Core API endpoint
  - Reads `song_index.csv` from disk
  - Accepts `?slug=song-slug` query parameter
  - Returns either single song with content or full index

### Markdown Processing
- **`src/lib/utils/markdown.ts`** (370 lines) - Central processing hub
  - `getSongIndex()` - Fetch CSV from API
  - `getSongBySlug(slug)` - Get song with processed HTML
  - `processSongMarkdown()` - Parse YAML + convert to HTML using unified/remark/rehype pipeline
  - `getAllAlbums()` - Group songs by album
  - `getAlbumById(id)` - Get specific album data
  - `getNavigationData()` - Get prev/next song in album

### Page Routes (Next.js App Router)
- `/` - Home page (`src/app/page.tsx`)
- `/albums` - Album grid listing
- `/albums/[id]` - Album detail with track list
- `/lyrics/[slug]` - Individual song page with full lyrics
- `/search` - Client-side search filtering

### Key Components
- **Layout**: `Header.tsx`, `Footer.tsx`, `Background.tsx`
- **Albums**: `AlbumGridItem.tsx`, `AlbumCover.tsx`, `AlbumNavigation.tsx`
- **UI**: `RetroCard.tsx` (primary/secondary variants), `SearchBar.tsx`, `VinylRecord.tsx`
- **Forms**: `LyricsSubmissionForm.tsx`

## Type System

Core types in `src/types/index.ts` and `src/types/album.ts`:

```typescript
Song {
  albumId, title, slug, duration, description
  hasLyrics: 'Yes' | 'Failed' | 'Skipped'
  media: { spotify, youtube }
  tags, contributors
}

ProcessedSong extends Song {
  content: string  // HTML version of lyrics
  backgroundImage?: string
}

Album {
  id, title, coverArt, year, description
  tracks?: Track[]
}
```

## Python Scripts for Lyrics Fetching

Located in `scripts/`:
- `lyrics_fetcher.py` - Generic lyrics scraper
- `genius_lyrics_fetcher.py` - Genius API integration
- `azlyrics_fetcher.py` - AZLyrics scraper
- `enhanced_lyrics_fetcher.py` - Multi-source fetcher

These are available for bulk data import but not currently in active use.

## Cline Memory Bank

The `.clinerules` file configures Cline's memory system. Important context is stored in `cline_docs/`:
- `activeContext.md` - Current work and next steps
- `productContext.md` - Project vision and purpose
- `systemPatterns.md` - Architecture patterns
- `techContext.md` - Tech stack details
- `progress.md` - Implementation status

**Important**: During normal development, follow Memory Bank patterns but don't update docs after every small change. Update when user explicitly requests "update memory bank" or after significant milestones.

## Development Workflow

### Adding a New Song
1. Create `.md` file in `src/content/lyrics/[album-directory]/[song-slug].md`
2. Add proper YAML front matter (see template above)
3. Run `node scripts/update_song_index.js` to sync CSV
4. Test with `pnpm dev` and navigate to `/lyrics/[song-slug]`

### Adding a New Album
1. Create new directory in `src/content/lyrics/[album-slug]/`
2. Add album metadata to appropriate data structures
3. Create song markdown files in the new directory
4. Update `song_index.csv` via update script

### Search Implementation
Search is **client-side** in `src/app/search/page.tsx`:
- Loads all songs via `getAllSongs()`
- Filters by: title, album name, description, lyrics content, tags
- Acceptable performance for ~110 songs (MVP)

## Important Considerations

### Security & Git
- **NEVER** commit `.env.local` or API keys
- Check `git remote -v` before committing (per global CLAUDE.md)
- `song_index.csv` corruption: versioned backups exist (`.bak.*` files)

### Data Integrity
- `song_index.csv` is critical - always validate structure after modifications
- Backup files exist: `song_index.csv.corrupted-backup`, `song_index.csv.bak.*`
- If CSV corruption occurs, restore from backup and re-run update script

### Package Manager
- Uses **pnpm** (not npm) - see `pnpm-lock.yaml`
- Install deps: `pnpm install`

### Infrastructure
- Domain: wookiefoot.com (Cloudflare DNS)
- Hosting: Self-hosted servers via Cloudflare tunnel
- Deployment: Docker containerization (planned)

## Common Patterns

### Markdown Processing Pipeline
```typescript
1. Fetch markdown from filesystem via API
2. Parse front matter with gray-matter
3. Process markdown → HTML with unified:
   - remark-parse (markdown AST)
   - remark-rehype (convert to HTML AST)
   - rehype-slug (add heading IDs)
   - rehype-autolink (clickable headings)
   - rehype-stringify (HTML string)
4. Return ProcessedSong with HTML + metadata
```

### Retro Theme (Tailwind)
- Custom Tailwind config in `tailwind.config.ts`
- Uses `@tailwindcss/typography` for rich text
- RetroCard component has `variant="primary"` and `variant="secondary"`

## Publishing Loop Integration

This project integrates with the wallykroeker.com publishing loop system.

### Commit Convention
```bash
feat(project/wookiefoot): description #build-log !milestone
```

**Types**: feat, fix, chore, docs, refactor, perf, test
**Tags**: #build-log #how-to #architecture #ai #release
**Milestone**: `!milestone` triggers build-log append

### Project Configuration
- **Slug**: `wookiefoot` (must match in commits, folder name, and URL)
- **Content repo**: `/home/walub/projects/wallykroeker.com/content/`
- **Project hub**: `content/projects/wookiefoot/index.md`
- **Build log**: `content/projects/wookiefoot/build-log.md`

### Documentation Workflow
When significant milestones are completed, commits with `!milestone` flag automatically append to the build log in the wallykroeker.com repository. This creates a timeline of the project's development.

## Reference Documentation

- `README.md` - Project overview and phases
- `WookieFoot_Data_Dictionary.md` - Data structure details
- `WookieFoot_Project_Outline.md` - Project vision
- `infrastructure.md` - Deployment architecture
- `cline_docs/activeContext.md` - Current development context
