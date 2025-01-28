#!/usr/bin/env python3
import os
import json
import csv
import re
from typing import List, Dict, Optional

def read_album_metadata(album_dir: str) -> Optional[Dict]:
    """Read album metadata from json file."""
    metadata_path = os.path.join(album_dir, 'metadata.json')
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def sanitize_filename(filename: str) -> str:
    """Remove invalid characters from filename."""
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    return filename

def check_lyrics_exist(song_path: str) -> bool:
    """Check if lyrics exist in the markdown file."""
    if os.path.exists(song_path):
        with open(song_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Check if there's more content than just the metadata
            lines = content.strip().split('\n')
            return len(lines) > 3  # More than title and metadata lines
    return False

def normalize_title(title: str) -> str:
    """Normalize song title for matching."""
    # First handle special cases
    title = title.lower()
    
    # Remove featuring/feat./ft. and anything after
    title = re.sub(r'\s*(?:featuring|feat\.?|ft\.?)\s+.*$', '', title)
    
    # Remove parenthetical content
    title = re.sub(r'\s*\([^)]*\)', '', title)
    
    # Remove square brackets
    title = re.sub(r'\s*\[[^\]]*\]', '', title)
    
    # Replace apostrophes and similar characters
    title = title.replace("'", "").replace("'", "").replace("'", "")
    
    # Remove other punctuation
    title = re.sub(r'[^\w\s]', '', title)
    
    # Remove common words
    words = title.split()
    words = [w for w in words if w not in ('the', 'a', 'an', 'and', 'or', 'but', 'feat', 'featuring')]
    
    # Join and normalize spaces
    return ' '.join(words)

def get_canonical_album_name(album: str) -> str:
    """Get the canonical album name."""
    album_mapping = {
        "You're It!": "You're IT!",
        "Youre It": "You're IT!",
        "You're IT": "You're IT!",
        "Ready or Not": "Ready or Not...",
        "Domesticated: The Story of Nothing and the Monkey": "Domesticated",
        "Domesticated": "Domesticated",
    }
    return album_mapping.get(album, album)

def generate_title_variants(title: str) -> List[str]:
    """Generate variations of a title for matching."""
    variants = {title.lower()}
    
    # Get content inside parentheses
    paren_match = re.search(r'\(([^)]*)\)', title)
    if paren_match:
        variants.add(paren_match.group(1).lower())
    
    # Remove parentheses and content
    base = re.sub(r'\s*\([^)]*\)', '', title.lower())
    variants.add(base)
    
    # Remove square brackets and content
    base = re.sub(r'\s*\[[^\]]*\]', '', title.lower())
    variants.add(base)
    
    # Remove featuring/feat./ft. and anything after
    base = re.sub(r'\s*(?:featuring|feat\.?|ft\.?)\s+.*$', '', title.lower())
    variants.add(base)
    
    # Handle apostrophes
    variants.add(title.lower().replace("'", ""))
    variants.add(title.lower().replace("'", ""))
    
    # Handle exclamation marks
    variants.add(title.lower().replace("!", ""))
    
    # Add normalized version
    variants.add(normalize_title(title))
    
    # Handle special cases
    if "giving tree" in title.lower() or "taking boy" in title.lower():
        variants.add("talking boy")
    if "loose your mind" in title.lower():
        variants.add("lose your mind")
    
    return list(variants)

def load_track_numbers() -> Dict[str, Dict[str, int]]:
    """Load track numbers from Wookiefoot_Albums.csv."""
    track_numbers = {}
    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Wookiefoot_Albums.csv")
    
    # First load from CSV
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            album = row['Album'].strip()
            title = row['Song Title'].strip()
            track = int(row['Track Number'])
            
            # Get canonical album name
            album = get_canonical_album_name(album)
            
            if album not in track_numbers:
                track_numbers[album] = {}
            
            # Store all variants of the title
            for variant in generate_title_variants(title):
                track_numbers[album][variant] = track
            
            # Handle special cases
            if title.lower() == "air":
                track_numbers[album]["[air]"] = track
            if title.lower() == "water":
                track_numbers[album]["[water]"] = track
            if title.lower() == "earth":
                track_numbers[album]["[earth]"] = track
            if title.lower() == "fire":
                track_numbers[album]["[fire]"] = track
            if "road" in title.lower():
                track_numbers[album]["the road"] = track
                track_numbers[album]["the road feat maya elena"] = track
            if "intro" in title.lower():
                track_numbers[album]["intro"] = track
                track_numbers[album]["captains log intro"] = track
    
    # Add special cases for Activate album
    activate_special = {
        "acceptance": 14,
        "anger": 9,
        "bargaining": 11,
        "denial": 7,
        "depression": 12,
        "intro": 1,
        "rumi": 29,
        "shock": 5,
        "the end again": 17,
        "yellow #5": 26,
        "giving tree/taking boy": 28,
        "talking boy": 28,
        "let go": None,  # Not in source CSV
    }
    
    if "Activate" in track_numbers:
        for title, track in activate_special.items():
            track_numbers["Activate"][title] = track
            if track is not None:  # Don't add parenthetical version for None tracks
                track_numbers["Activate"][f"({title})"] = track
    
    # Add special cases for Ready or Not album
    ready_special = {
        "loose your mind": 6,
        "lose your mind": 6,
    }
    
    if "Ready or Not..." in track_numbers:
        track_numbers["Ready or Not..."].update(ready_special)
    
    return track_numbers

def get_track_number(track_numbers: Dict[str, Dict[str, int]], album: str, title: str) -> Optional[int]:
    """Get track number for a song."""
    # Get canonical album name
    album = get_canonical_album_name(album)
    
    # Generate all possible variants of the title
    variants = generate_title_variants(title)
    
    # Try exact matches first
    if album in track_numbers:
        for variant in variants:
            if variant in track_numbers[album]:
                return track_numbers[album][variant]
    
    # Try album variants
    for album_name in track_numbers:
        if normalize_title(album_name) == normalize_title(album):
            for variant in variants:
                if variant in track_numbers[album_name]:
                    return track_numbers[album_name][variant]
    
    return None

def create_song_index(source_dir: str, output_path: str):
    """Create CSV index of all songs with their lyrics status."""
    rows = []
    track_numbers = load_track_numbers()
    
    # Get all album directories
    for album_name in sorted(os.listdir(source_dir)):
        album_dir = os.path.join(source_dir, album_name)
        if not os.path.isdir(album_dir):
            continue
            
        # Read album metadata
        metadata = read_album_metadata(album_dir)
        if not metadata:
            continue
            
        print(f"\nProcessing album: {metadata['name']}")
        
        # Process each song in the album
        for track in metadata['tracks']:
            song_title = track['title']
            
            # Check if lyrics exist
            song_filename = sanitize_filename(f"{song_title}.md")
            song_path = os.path.join(album_dir, song_filename)
            has_lyrics = check_lyrics_exist(song_path)
            
            # Get track number from CSV data
            track_number = get_track_number(track_numbers, metadata['name'], song_title)
            print(f"Found track {track_number} for {song_title}")
            
            # Add row to CSV data
            rows.append({
                'Album': metadata['name'],
                'Year': metadata['year'],
                'Song Title': song_title,
                'Track Number': track_number if track_number else '',
                'Has Lyrics': 'Yes' if has_lyrics else 'No'
            })
    
    # Sort rows by album year and track number
    rows.sort(key=lambda x: (x['Year'], x['Track Number'] if x['Track Number'] else float('inf')))
    
    # Write to CSV
    fieldnames = ['Album', 'Year', 'Song Title', 'Track Number', 'Has Lyrics']
    
    # First write with tab delimiter for debug output
    print("\nFirst 5 rows of data:")
    print("\t".join(fieldnames))
    for row in rows[:5]:
        print("\t".join(str(row[field]) for field in fieldnames))
    
    # Write the actual CSV file
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=',', quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        writer.writerows(rows)
        
    # Print summary
    print(f"\nCreated song index with {len(rows)} songs:")
    album_counts = {}
    lyrics_count = sum(1 for row in rows if row['Has Lyrics'] == 'Yes')
    
    for row in rows:
        album = row['Album']
        if album not in album_counts:
            album_counts[album] = 0
        album_counts[album] += 1
    
    for album, count in sorted(album_counts.items()):
        print(f"- {album}: {count} songs")
    print(f"\nTotal songs with lyrics: {lyrics_count}/{len(rows)}")

def main():
    source_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "wookiefoot")
    output_dir = "/home/walub/projects/wookiefoot"
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Create the song index
    output_path = os.path.join(output_dir, "song_index.csv")
    create_song_index(source_dir, output_path)
    print(f"\nCSV file created at: {output_path}")

if __name__ == "__main__":
    main()
