import csv
import os
import json
import requests
from datetime import datetime
import yaml
import re
from bs4 import BeautifulSoup
import time
from pathlib import Path
from urllib.parse import urlparse, parse_qs

class LyricsFetcher:
    def __init__(self, genius_token=None): # Genius token is now optional
        self.genius_token = genius_token
        self.base_url = "https://api.genius.com"
        self.headers = {'Authorization': f'Bearer {genius_token}'} if genius_token else {} # Conditionally set headers
        self.error_log = []
        self.project_root = Path(__file__).parent.parent

    def sanitize_azlyrics_title(self, title):
        """Sanitize title for AZLyrics URL."""
        title = re.sub(r'[^a-zA-Z0-9 ]', '', title) # Remove special chars except spaces
        title = title.replace(' ', '').lower() # Remove spaces and lowercase
        return title

    def scrape_azlyrics(self, artist_name, song_title):
        """Scrape lyrics from AZLyrics."""
        artist_initial = artist_name[0].lower()
        artist_name_sanitized = self.sanitize_azlyrics_title(artist_name)
        song_title_sanitized = self.sanitize_azlyrics_title(song_title)

        azlyrics_url = f"https://www.azlyrics.com/lyrics/{artist_name_sanitized}/{song_title_sanitized}.html"

        try:
            page = requests.get(azlyrics_url)
            page.raise_for_status()
            soup = BeautifulSoup(page.content, 'html.parser')

            ringtone_div = soup.find('div', class_='ringtone')  # Find ringtone div first
            if ringtone_div:
                lyrics_div = ringtone_div.find_next_sibling('div')  # Then find the next sibling
            else:
                # If ringtone div is not found, try a more general approach
                text_center_div = soup.find('div', class_='text-center')
                if text_center_div:
                    lyrics_div = text_center_div.find('div') # lyrics div might be a direct child
                else:
                    lyrics_div = None # lyrics div not found

            if lyrics_div:
                lyrics = lyrics_div.get_text(strip=True, separator='\n')
                return lyrics
            else:
                self.error_log.append({
                    'artist': artist_name,
                    'title': song_title,
                    'url': azlyrics_url,
                    'error': 'Lyrics div not found on AZLyrics using both methods',
                    'type': 'azlyrics_scraping_error',
                    'html_content': soup.prettify()  # Log HTML content for debugging
                })
                return None


        except requests.exceptions.RequestException as e:
            self.error_log.append({
                'artist': artist_name,
                'title': song_title,
                'url': azlyrics_url,
                'error': str(e),
                'type': 'azlyrics_request_error'
            })
            return None

    def get_lyrics(self, song_id=None, song_title=None, artist_name="Wookiefoot"): # Modified get_lyrics to use AZLyrics
        """Get lyrics - now primarily using AZLyrics."""
        lyrics = self.scrape_azlyrics(artist_name, song_title)
        if lyrics:
            return lyrics
        else:
            self.error_log.append({
                'title': song_title,
                'artist': artist_name,
                'error': 'Failed to get lyrics from AZLyrics',
                'type': 'lyrics_error'
            })
            return None


    def create_markdown(self, song_data, lyrics, album_id, track_number):
        """Create or update markdown file with lyrics."""
        try:
            # Create album directory if it doesn't exist
            album_dir = self.project_root / 'src' / 'content' / 'lyrics' / self.sanitize_filename(album_id.lower())
            album_dir.mkdir(parents=True, exist_ok=True)

            # Create song slug
            song_slug = self.sanitize_filename(song_data['title'].lower())

            # Prepare frontmatter
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
                'createdAt': datetime.now().strftime("%Y-%m-%d"),
                'geniusId': song_data.get('id', '') # Still keep geniusId for potential future use
            }

            # Format lyrics - no extra formatting for AZLyrics for now
            formatted_lyrics = lyrics #.replace('\n\n', '\n\n\n')  # No extra line break for AZLyrics yet

            # Create markdown content
            content = "---\n"
            content += yaml.dump(frontmatter, default_flow_style=False)
            content += "---\n\n"
            content += formatted_lyrics

            # Write to file
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
        # Remove invalid chars
        filename = re.sub(r'[<>:"/\\|?*]', '', filename)
        # Replace spaces and other chars with hyphens
        filename = re.sub(r'[\s\-]+', '-', filename)
        # Remove leading/trailing hyphens
        return filename.strip('-')

    def update_song_index(self, current_song, has_lyrics=False):
        """Update song_index.csv with lyrics status."""
        csv_path = self.project_root / 'song_index.csv'
        temp_path = self.project_root / 'song_index_temp.csv'

        with open(csv_path, 'r') as infile, open(temp_path, 'w', newline='') as outfile:
            reader = csv.DictReader(infile)
            fieldnames = reader.fieldnames
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()

            for row in reader:
                if (row['Album'] == current_song['Album'] and
                    row['Song Title'] == current_song['Song Title']):
                    row['Has Lyrics'] = 'Yes' if has_lyrics else 'No'
                writer.writerow(row)

        # Replace original file
        os.replace(temp_path, csv_path)

    def process_songs(self):
        """Process all songs in song_index.csv using AZLyrics.""" # Updated to reflect AZLyrics focus
        csv_path = self.project_root / 'song_index.csv'
        total_songs = 0
        processed_songs = 0
        failed_songs = 0
        skipped_songs = 0

        # First count total songs to process
        with open(csv_path, 'r') as file:
            reader = csv.DictReader(file)
            total_songs = sum(1 for row in reader if row['Has Lyrics'] == 'No')

        print(f"Found {total_songs} songs to process using AZLyrics\n") # Updated log message

        with open(csv_path, 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                if row['Has Lyrics'] == 'No':  # Only process songs without lyrics
                    processed_songs += 1
                    print(f"Processing [{processed_songs}/{total_songs}]: {row['Song Title']} from {row['Album']} (AZLyrics)") # Updated log message

                    # Skip instrumental or intro tracks - same logic
                    if any(keyword in row['Song Title'].lower() for keyword in ['(intro)', '(shock)', '(denial)', '(anger)', '(bargaining)', '(depression)', '(acceptance)', '(the end)', '(yellow #5)', '(rumi)']):
                        print(f"Skipping instrumental/intro track: {row['Song Title']}\n")
                        skipped_songs += 1
                        continue

                    # Get lyrics from AZLyrics
                    lyrics = self.get_lyrics(song_title=row['Song Title'], artist_name="Wookiefoot") # Using AZLyrics get_lyrics now
                    if lyrics:
                        # Create markdown file - same logic
                        success = self.create_markdown(
                            {'title': row['Song Title']}, # Removed song_id as it's not relevant for AZLyrics
                            lyrics,
                            row['Album'],
                            row['Track Number']
                        )
                        if success:
                            self.update_song_index(row, True)
                            print(f"Successfully processed: {row['Song Title']} (AZLyrics)\n") # Updated log message
                            continue

                    # If we get here, something failed - same error handling
                    failed_songs += 1
                    self.error_log.append({
                        'album': row['Album'],
                        'title': row['Song Title'],
                        'error': 'Failed to process song (AZLyrics)', # Updated error message
                        'type': 'process_error'
                    })
                    print(f"Failed to process: {row['Song Title']} (AZLyrics)\n") # Updated log message
                    self.update_song_index(row, False)

                    # Add delay between songs even on failure
                    time.sleep(0.5)

        # Write error log - same logic
        if self.error_log:
            error_path = self.project_root / 'scripts' / 'failed_songs.json'
            with open(error_path, 'w') as f:
                json.dump(self.error_log, f, indent=2)
            print(f"\nProcessing complete.")
            print(f"Total songs processed: {processed_songs}")
            print(f"Successfully processed: {processed_songs - failed_songs - skipped_songs}")
            print(f"Failed songs: {failed_songs}")
            print(f"Skipped songs: {skipped_songs}")
            print("Check failed_songs.json for details.")
        else:
            print("\nProcessing complete. All songs processed successfully from AZLyrics!") # Updated success message

def main():
    # Genius token is no longer required
    fetcher = LyricsFetcher() # No Genius token needed
    fetcher.process_songs()

if __name__ == "__main__":
    main()
