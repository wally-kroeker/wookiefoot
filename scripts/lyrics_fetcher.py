import csv
import os
import json
from datetime import datetime
import yaml
import re
from bs4 import BeautifulSoup
import time
from pathlib import Path
import requests
import azapi
import sys

class LyricsFetcher:
    def __init__(self):
        self.error_log = []
        self.project_root = Path(__file__).parent.parent

    def get_lyrics_from_azapi(self, artist_name, song_title):
        """Get lyrics using azapi library."""
        try:
            print(f"Trying azapi for: {song_title}")
            api = azapi.AZlyrics()
            api.artist = artist_name
            api.title = song_title
            api.getLyrics()
            if api.lyrics and api.lyrics != 'No lyrics found :(':
                print("Found lyrics using azapi!")
                return api.lyrics
            return None
        except Exception as e:
            self.error_log.append({
                'artist': artist_name,
                'title': song_title,
                'error': str(e),
                'type': 'azapi_error'
            })
            return None

    def get_lyrics_from_ovh(self, artist_name, song_title):
        """Try to get lyrics from lyrics.ovh API."""
        print(f"Trying lyrics.ovh for: {song_title}")
        try:
            url = f"https://api.lyrics.ovh/v1/{artist_name}/{song_title}"
            response = requests.get(url)
            response.raise_for_status()
            
            data = response.json()
            if 'lyrics' in data and data['lyrics']:
                print("Found lyrics on lyrics.ovh!")
                return data['lyrics']
            return None
        except Exception as e:
            self.error_log.append({
                'artist': artist_name,
                'title': song_title,
                'error': str(e),
                'type': 'ovh_error'
            })
            return None

    def scrape_azlyrics(self, artist_name, song_title):
        """Scrape lyrics from AZLyrics website."""
        print(f"Trying AZLyrics scraping for: {song_title}")
        artist_name_sanitized = re.sub(r'[^a-zA-Z0-9]', '', artist_name).lower()
        song_title_sanitized = re.sub(r'[^a-zA-Z0-9]', '', song_title).lower()
        
        azlyrics_url = f"https://www.azlyrics.com/lyrics/{artist_name_sanitized}/{song_title_sanitized}.html"

        try:
            page = requests.get(azlyrics_url)
            page.raise_for_status()
            soup = BeautifulSoup(page.content, 'html.parser')

            ringtone_div = soup.find('div', class_='ringtone')
            if ringtone_div:
                lyrics_div = ringtone_div.find_next_sibling('div')
            else:
                text_center_div = soup.find('div', class_='text-center')
                lyrics_div = text_center_div.find('div') if text_center_div else None

            if lyrics_div:
                print("Found lyrics through AZLyrics scraping!")
                return lyrics_div.get_text(strip=True, separator='\n')
            return None
        except Exception as e:
            self.error_log.append({
                'artist': artist_name,
                'title': song_title,
                'url': azlyrics_url,
                'error': str(e),
                'type': 'azlyrics_scraping_error'
            })
            return None

    def get_manual_lyrics(self, song_title, album_name):
        """Prompt for manual lyrics input."""
        print("\n" + "="*60)
        print(f"Could not automatically find lyrics for: {song_title} from {album_name}")
        print("Please manually find the lyrics and paste them below.")
        print("Instructions:")
        print("1. Search for the lyrics online")
        print("2. Copy the lyrics")
        print("3. Paste them below")
        print("4. When finished, type 'END' on a new line and press Enter")
        print("Or type 'SKIP' to skip this song")
        print("="*60 + "\n")

        lyrics_lines = []
        while True:
            try:
                line = input()
                if line.strip() == 'END':
                    break
                if line.strip() == 'SKIP':
                    return None
                lyrics_lines.append(line)
            except KeyboardInterrupt:
                print("\nInput cancelled. Skipping song.")
                return None
            except EOFError:
                print("\nInput terminated. Skipping song.")
                return None

        if not lyrics_lines:
            return None
            
        return '\n'.join(lyrics_lines)

    def get_lyrics(self, song_title, artist_name="Wookiefoot"):
        """Try multiple sources to get lyrics."""
        # Try azapi first
        lyrics = self.get_lyrics_from_azapi(artist_name, song_title)
        if lyrics:
            return lyrics

        # Try lyrics.ovh next
        lyrics = self.get_lyrics_from_ovh(artist_name, song_title)
        if lyrics:
            return lyrics

        # Try AZLyrics scraping
        lyrics = self.scrape_azlyrics(artist_name, song_title)
        if lyrics:
            return lyrics

        self.error_log.append({
            'title': song_title,
            'artist': artist_name,
            'error': 'Failed to get lyrics from all automatic sources',
            'type': 'lyrics_error'
        })
        return None

    def create_markdown(self, song_data, lyrics, album_id, track_number):
        """Create or update markdown file with lyrics."""
        try:
            album_dir = self.project_root / 'src' / 'content' / 'lyrics' / self.sanitize_filename(album_id.lower())
            album_dir.mkdir(parents=True, exist_ok=True)

            song_slug = self.sanitize_filename(song_data['title'].lower())

            frontmatter = {
                'id': song_slug,
                'title': song_data['title'],
                'albumId': self.sanitize_filename(album_id.lower()),
                'trackNumber': track_number,
                'description': f"Lyrics for {song_data['title']} by WookieFoot",
                'youtubeUrl': "",
                'spotifyUrl': "",
                'tags': ["lyrics"],
                'contributors': ["WookieFoot"],
                'createdAt': datetime.now().strftime("%Y-%m-%d")
            }

            content = "---\n"
            content += yaml.dump(frontmatter, default_flow_style=False)
            content += "---\n\n"
            content += lyrics

            file_path = album_dir / f"{song_slug}.md"
            file_path.write_text(content)
            return True

        except Exception as e:
            self.error_log.append({
                'title': song_data['title'],
                'album': album_id,
                'error': f'Failed to create markdown: {str(e)}',
                'type': 'markdown_error'
            })
            return False

    def sanitize_filename(self, filename):
        """Convert string to valid filename."""
        filename = re.sub(r'[<>:"/\\|?*]', '', filename)
        filename = re.sub(r'[\s\-]+', '-', filename)
        return filename.strip('-')

    def update_song_index(self, current_song, status='Failed'):
        """Update song_index.csv with lyrics status."""
        csv_path = self.project_root / 'song_index.csv'
        temp_path = self.project_root / 'song_index_temp.csv'

        with open(csv_path, 'r') as infile, open(temp_path, 'w', newline='') as outfile:
            reader = csv.DictReader(infile)
            writer = csv.DictWriter(outfile, fieldnames=reader.fieldnames)
            writer.writeheader()

            for row in reader:
                if (row['Album'] == current_song['Album'] and
                    row['Song Title'] == current_song['Song Title']):
                    row['Has Lyrics'] = status
                writer.writerow(row)

        os.replace(temp_path, csv_path)

    def process_songs(self):
        """Process all songs in song_index.csv."""
        csv_path = self.project_root / 'song_index.csv'
        total_songs = 0
        processed_songs = 0
        failed_songs = 0
        skipped_songs = 0
        manual_songs = 0

        with open(csv_path, 'r') as file:
            reader = csv.DictReader(file)
            total_songs = sum(1 for row in reader if row['Has Lyrics'] == 'Failed')

        print(f"Found {total_songs} failed songs to retry\n")

        with open(csv_path, 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                if row['Has Lyrics'] == 'Failed':  # Only process failed songs
                    processed_songs += 1
                    print(f"\nProcessing [{processed_songs}/{total_songs}]: {row['Song Title']} from {row['Album']}")

                    if any(keyword in row['Song Title'].lower() for keyword in 
                          ['(intro)', '(shock)', '(denial)', '(anger)', '(bargaining)', 
                           '(depression)', '(acceptance)', '(the end)', '(yellow #5)', '(rumi)']):
                        print(f"Skipping instrumental/intro track: {row['Song Title']}")
                        self.update_song_index(row, 'Skipped')
                        skipped_songs += 1
                        continue

                    # Try automatic sources first
                    lyrics = self.get_lyrics(song_title=row['Song Title'])
                    
                    # If automatic sources fail, try manual input
                    if not lyrics:
                        lyrics = self.get_manual_lyrics(row['Song Title'], row['Album'])
                        if lyrics:
                            manual_songs += 1

                    if lyrics:
                        success = self.create_markdown(
                            {'title': row['Song Title']},
                            lyrics,
                            row['Album'],
                            row['Track Number']
                        )
                        if success:
                            self.update_song_index(row, 'Yes')
                            print(f"Successfully processed: {row['Song Title']}")
                            continue

                    failed_songs += 1
                    self.update_song_index(row, 'Failed')
                    print(f"Failed to process: {row['Song Title']}")

                    time.sleep(1)  # Delay between requests

        if self.error_log:
            error_path = self.project_root / 'scripts' / 'failed_songs.json'
            with open(error_path, 'w') as f:
                json.dump(self.error_log, f, indent=2)

        print(f"\nProcessing complete.")
        print(f"Total songs processed: {processed_songs}")
        print(f"Successfully processed: {processed_songs - failed_songs - skipped_songs}")
        print(f"Manually entered: {manual_songs}")
        print(f"Failed songs: {failed_songs}")
        print(f"Skipped songs: {skipped_songs}")
        if self.error_log:
            print("Check failed_songs.json for error details.")

def main():
    fetcher = LyricsFetcher()
    fetcher.process_songs()

if __name__ == "__main__":
    main()
