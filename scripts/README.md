# WookieFoot Project Scripts

This directory contains utility scripts for managing the WookieFoot project.

## update_song_index.js

This script updates the `song_index.csv` file using:
1. The master song list in `cline_docs/mastersonglist.csv` as the source of truth for all songs
2. The existing lyrics files in `src/content/lyrics` to determine which songs have lyrics

### Purpose

The script performs several key operations:
- Ensures all songs from the master list are included in the index
- Checks which songs have actual lyrics files and updates the "Has Lyrics" column
- Preserves existing metadata from the current song_index.csv when available
- Generates proper file paths for lyrics files
- Maintains consistent slug formatting

### Usage

```bash
# Make the script executable
chmod +x ./scripts/update_song_index.js

# Run the script
node ./scripts/update_song_index.js
```

### What It Does

1. Reads the master song list from `cline_docs/mastersonglist.csv`
2. Reads the current song index from `song_index.csv`
3. Scans the lyrics directories to check for existing files
4. For each song in the master list:
   - Determines if lyrics exist
   - Preserves any existing metadata from the current index
   - Updates the "Has Lyrics" field appropriately
5. Writes the updated index back to `song_index.csv`
6. Prints a summary of the update

### Expected Output

The script will output information about its progress, including:
- Number of songs loaded from both sources
- Number of songs in the updated index
- Summary of songs with lyrics, skipped, and failed

### Notes

- The script never modifies `mastersonglist.csv`
- It preserves existing metadata like Spotify URLs, descriptions, etc.
- Any inconsistencies in the current index are resolved using the master list
- The "Has Lyrics" field is updated based on actual file existence 