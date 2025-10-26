# WookieFoot Data Dictionary

This document provides information about the data files included in the WookieFoot project, explaining their structure, purpose, and relationships.

## Primary Data Files

### 1. song_index.csv

A master index of all WookieFoot songs containing metadata and lyrics status.

**Key Fields:**
- `Album`: The album title (e.g., "Be Fearless and Play")
- `Track Number`: The song's position in the album
- `Title`/`Song Title`: The song's title
- `Song Slug`: URL-friendly version of the song title (e.g., "be-fearless-and-play")
- `Has Lyrics`: Indicates if lyrics are available ("Yes", "Skipped", or "Failed")
- `Album Directory`: Directory name of the album (e.g., "be-fearless-and-play") 
- `Duration`: Song length in minutes:seconds format
- `Year`: Release year
- `Album ID`: Numeric identifier for the album
- `Spotify URL`: Link to song on Spotify (if available)
- `Description`: Brief description of the song
- `YouTube URL`: Link to song on YouTube (if available)
- `ID`: Unique identifier for the song
- `Contributors`: People who contributed to the song
- `Tags`: Categorical tags for the song
- `Created At`: Date the entry was created
- `Markdown Path`: Path to the lyrics markdown file

### 2. mastersonglist.csv

A comprehensive list of all WookieFoot songs, serving as a source of truth for the song catalog.

**Expected Fields:**
- `Album`: The album title
- `Track #`: The song's position in the album
- `Song Title`: The song's title
- `Duration`: Song length in minutes:seconds format

### 3. Lyrics Files

Markdown files containing the song lyrics, stored in album-based directories.

**Location Pattern:** `src/content/lyrics/[album-directory]/[song-slug].md`

**Front Matter Structure:**
```
---
albumId: [album-identifier]
contributors: [list-of-contributors]
createdAt: [creation-date]
description: [brief-description]
id: [song-slug]
spotifyUrl: [spotify-link]
tags: [list-of-tags]
title: [song-title]
trackNumber: [track-position]
youtubeUrl: [youtube-link]
---
```

**Body Content:** The song lyrics in markdown format

## Relationships Between Data Files

1. **song_index.csv to Lyrics Files**:
   - The `Song Slug` field in song_index.csv corresponds to the filename of lyrics markdown files
   - The `Album Directory` field indicates which album folder contains the lyrics file
   - The `Has Lyrics` field indicates whether a corresponding lyrics file exists
   - The `Markdown Path` field provides the full path to the lyrics file

2. **mastersonglist.csv to song_index.csv**:
   - mastersonglist.csv serves as the authoritative source for song catalog data
   - song_index.csv adds additional metadata and lyrics status to the master list
   - Both files share the album name, track number, and song title fields

## Slug Generation Rules

Song and album slugs follow these formatting rules:

1. Convert to lowercase
2. Replace apostrophes and quotes with nothing
3. Replace non-alphanumeric characters with hyphens
4. Replace multiple consecutive hyphens with a single hyphen
5. Remove leading and trailing hyphens

For example:
- "Come to Life" becomes "come-to-life"
- "You're It!" becomes "youre-it"

## Special Considerations

1. **Consistency Challenges**: There may be inconsistencies between the song_index.csv and actual lyrics files. The update_song_index.js script can be used to reconcile these.

2. **Lyrics Status Meanings**:
   - `Yes`: Lyrics file exists
   - `Skipped`: No lyrics file available
   - `Failed`: Attempted to create lyrics but encountered issues

3. **Directory Structure**: Lyrics are organized by album directories, with each directory named according to the slug rules applied to album titles.

This data dictionary provides a foundation for understanding how song data is organized in the WookieFoot project and can guide the implementation of a new system. 