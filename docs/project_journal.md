# WookieFoot Project Journal

## 2025-01-28
### Project Planning and Documentation

#### Activities Completed:
1. Analyzed existing project structure:
   - Reviewed song_index.csv containing full album and song listings
   - Examined wookiefoot_lyrics.py script for lyrics fetching functionality
   - Reviewed infrastructure.md for deployment setup
   - Analyzed current Next.js project structure and components

2. Created Phase Two Implementation Plan:
   - Documented current implementation status
   - Created detailed content completion tracking
   - Established core features implementation plan
   - Set up progress tracking metrics
   - Defined launch criteria checklist

#### Current Project Metrics:
- Total Songs: 145
- Complete Lyrics: 40 (27.6%)
- Failed Status: 85
- Skipped Status: 20

#### Implementation Status:
```
Albums with Complete Lyrics:
- Be Fearless and Play (13/16 songs)
- Activate (13/31 songs)
- Make Belief (12/15 songs)
- Domesticated (2/22 songs)

Albums Needing Work:
- You're IT! (0/17 songs)
- Out of the Jar (0/19 songs)
- Ready or Not... (0/13 songs)
- Writing on the Wall (0/12 songs)
```

#### Next Steps:
1. ✅ Completed Phase 1: Content Completion
   - Completed audit of existing lyrics
   - Created and populated content completion tracking sheet
   - Prioritized missing lyrics for "Failed" status songs
   - Documented problematic/unavailable lyrics
   - Created content validation checklist and system

2. Begin Phase 2: Core Features Implementation
   - Complete album listing page
   - Implement lyrics display functionality
   - Develop basic navigation structure

#### Documents Created:
- Phase_Two_Implementation.md: Comprehensive implementation plan and tracking document
- Updated project_journal.md (this document)

#### Notes:
- Project structure is well-organized with Next.js and TypeScript
- Basic routing and component foundation is in place
- Focus will be on core lyrics display functionality
- Regular progress updates will be maintained in this journal

## 2025-01-28
### Content Integration and Bug Fixes

#### Activities Completed:
1. Integrated real content from /src/content/lyrics:
   - Removed mock data from markdown.ts utility
   - Updated markdown utility to use actual content files
   - Fixed file path handling for special cases (e.g., "St." in filenames)

2. Fixed dynamic route parameter handling:
   - Updated lyrics page to properly handle slug parameter
   - Updated album page to properly handle id parameter
   - Updated search page to properly handle query parameter
   - Added proper parameter resolution for Next.js async components

#### Technical Improvements:
- Modified titleToSlug function to preserve dots in abbreviations (e.g., "St.")
- Updated file path handling in getSongBySlug to match actual content structure
- Improved error handling for missing content files
- Added proper type handling for song status (Yes/Failed/Skipped)

#### Next Steps:
1. Continue content completion for remaining albums
2. Implement remaining core features
3. Add responsive design improvements

---

### Lyrics Fetching Implementation

#### Activities Completed:
1. Refactored lyrics fetching script:
   - Removed Genius API and AZLyrics scraping
   - Implemented lyrics.ovh API as primary source
   - Added proper error handling and logging
   - Improved file organization structure

2. Updated song tracking system:
   - Created fresh song_index.csv from Wookiefoot_Albums.csv
   - Added proper album years for all entries
   - Implemented status tracking (Yes/Failed/Skipped)
   - Organized lyrics under src/content/lyrics/{album-name}/

#### Fetching Results:
Successfully fetched lyrics for:
- Activate album: 12 songs
- Be Fearless and Play album: 13 songs
- Domesticated album: 2 songs
- Make Belief album: 12 songs

#### File Structure Improvements:
- Organized lyrics files in markdown format with frontmatter
- Implemented consistent kebab-case naming
- Created album-specific directories
- Added proper metadata (title, album, track, year)

#### Next Steps:
1. Manual lyrics collection for failed entries
2. Quality check of successfully fetched lyrics
3. Implementation of lyrics display components

#### Notes:
- lyrics.ovh API provides cleaner results than previous sources
- Interludes and transition tracks properly marked as "Skipped"
- CSV index now serves as source of truth for lyrics status
