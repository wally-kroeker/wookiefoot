import csv
import os
from pathlib import Path
import time
import requests
import re

# Album release years
ALBUM_YEARS = {
    "You're IT!": "2023",
    "Activate": "2006",
    "Be Fearless and Play": "2009",
    "Domesticated": "2000",
    "Make Belief": "2004",
    "Out of the Jar": "2001",
    "Ready or Not...": "2003",
    "Writing on the Wall": "2019"
}

def to_kebab_case(s):
    """Convert string to kebab-case."""
    # Convert to lowercase and replace spaces/special chars with hyphens
    s = s.lower()
    s = ''.join(c if c.isalnum() or c in '.-' else '-' for c in s)
    # Remove duplicate hyphens and strip leading/trailing hyphens
    s = '-'.join(filter(None, s.split('-')))
    return s

def get_lyrics_from_ovh(song_title, artist_name="Wookiefoot"):
    """Try to get lyrics from lyrics.ovh API."""
    print(f"Trying lyrics.ovh for: {song_title}")
    
    try:
        # Make request to lyrics.ovh API
        url = f"https://api.lyrics.ovh/v1/{artist_name}/{song_title}"
        response = requests.get(url)
        response.raise_for_status()
        
        data = response.json()
        if 'lyrics' in data and data['lyrics']:
            print("Found lyrics on lyrics.ovh!")
            return data['lyrics']
        else:
            print("No lyrics found on lyrics.ovh")
            return None
            
    except requests.exceptions.HTTPError as e:
        print(f"lyrics.ovh HTTP error: {str(e)}")
        if e.response.status_code == 404:
            print("Song not found on lyrics.ovh")
    except Exception as e:
        print(f"lyrics.ovh error: {str(e)}")
    return None

def create_song_index(albums_csv, output_csv):
    """Create song_index.csv from Wookiefoot_Albums.csv."""
    with open(albums_csv, 'r', newline='', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        rows = list(reader)

    # Create song index with additional fields
    index_rows = []
    for row in rows:
        index_rows.append({
            'Album': row['Album'],
            'Year': ALBUM_YEARS.get(row['Album'], ''),
            'Song Title': row['Song Title'],
            'Track Number': row['Track Number'],
            'Has Lyrics': 'No'  # Start with all songs needing lyrics
        })

    # Write the new song index
    with open(output_csv, 'w', newline='', encoding='utf-8') as outfile:
        fieldnames = ['Album', 'Year', 'Song Title', 'Track Number', 'Has Lyrics']
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(index_rows)

def update_song_index(csv_filepath, lyrics_base_dir):
    """Update song index CSV and fetch missing lyrics."""
    # Read the song index CSV
    with open(csv_filepath, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    # Create base lyrics directory if it doesn't exist
    lyrics_base_dir = Path(lyrics_base_dir)
    lyrics_base_dir.mkdir(parents=True, exist_ok=True)

    updated_rows = []
    for row in rows:
        song_title = row['Song Title']
        album_name = row['Album']
        has_lyrics = row['Has Lyrics']

        # Skip songs that already have lyrics
        if has_lyrics == 'Yes':
            updated_rows.append(row)
            continue

        # Skip interludes and transition tracks
        if song_title.lower() in ['intro', 'air', 'water', 'earth', 'fire', 'spirit', 'shock', 'denial', 'anger', 'bargaining', 'depression', 'acceptance', 'yellow #5', 'rumi', 'extra', 'bonus', 'untitled']:
            print(f"Skipping interlude track: {song_title}")
            row['Has Lyrics'] = 'Skipped'
            updated_rows.append(row)
            continue

        print(f"\nSearching for {song_title} by Wookiefoot...")
        try:
            # Try lyrics.ovh
            lyrics = get_lyrics_from_ovh(song_title)

            if lyrics:
                # Create album directory if it doesn't exist
                album_folder = to_kebab_case(album_name)
                lyrics_dir = lyrics_base_dir / album_folder
                lyrics_dir.mkdir(parents=True, exist_ok=True)

                # Create lyrics file with frontmatter
                song_filename = f"{to_kebab_case(song_title)}.md"
                lyrics_path = lyrics_dir / song_filename

                print(f"Saving lyrics to: {lyrics_path}")
                
                # Write lyrics file with frontmatter
                with open(lyrics_path, 'w', encoding='utf-8') as f:
                    f.write('---\n')
                    f.write(f'title: "{song_title}"\n')
                    f.write(f'album: "{album_name}"\n')
                    f.write(f'track: {row["Track Number"]}\n')
                    f.write(f'year: {row["Year"]}\n')
                    f.write('---\n\n')
                    f.write(lyrics)

                row['Has Lyrics'] = 'Yes'
                print(f"Successfully saved lyrics for: {song_title}")
            else:
                row['Has Lyrics'] = 'Failed'
                print(f"No lyrics found for: {song_title}")

        except Exception as e:
            print(f"Error processing {song_title}: {str(e)}")
            row['Has Lyrics'] = 'Failed'

        updated_rows.append(row)

        # Update the CSV after each song in case of interruption
        with open(csv_filepath, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=reader.fieldnames)
            writer.writeheader()
            writer.writerows(updated_rows)
            
        # Add delay between songs
        time.sleep(2.0)  # Delay to avoid rate limiting

if __name__ == '__main__':
    albums_csv = '/home/walub/projects/wookiefoot_docs/Wookiefoot_Albums.csv'
    song_index_csv = '/home/walub/projects/wookiefoot/song_index.csv'
    lyrics_dir = '/home/walub/projects/wookiefoot/src/content/lyrics'
    
    # First create/update song_index.csv from albums CSV
    print("Creating song index from albums CSV...")
    create_song_index(albums_csv, song_index_csv)
    
    # Then process all songs
    print("\nProcessing songs...")
    update_song_index(song_index_csv, lyrics_dir)
