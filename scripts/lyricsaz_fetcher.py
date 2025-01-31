import csv
import os
from pathlib import Path
import requests
from bs4 import BeautifulSoup
import time
import logging
import re
import yaml
from datetime import datetime

class LyricsAzFetcher:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def get_lyricsaz_url(self, album, song_title):
        """Generate URL for lyrics.az."""
        # Convert album and song title to URL format
        album_url = album.lower().replace(" ", "-")
        song_url = song_title.lower().replace(" ", "-")
        
        # Remove special characters except hyphens
        album_url = re.sub(r'[^a-z0-9\-]', '', album_url)
        song_url = re.sub(r'[^a-z0-9\-]', '', song_url)
        
        # Replace multiple hyphens with single hyphen
        album_url = re.sub(r'-+', '-', album_url)
        song_url = re.sub(r'-+', '-', song_url)
        
        # Remove leading/trailing hyphens
        album_url = album_url.strip('-')
        song_url = song_url.strip('-')
        
        return f"https://lyrics.az/wookiefoot/{album_url}/{song_url}.html"

    def scrape_lyricsaz(self, album, song_title):
        """Scrape lyrics from lyrics.az."""
        url = self.get_lyricsaz_url(album, song_title)
        self.logger.info(f"Attempting to scrape lyrics from lyrics.az: {url}")
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find the lyrics div
            lyrics_div = soup.find('div', class_='lyric-body')
            if lyrics_div:
                # Remove any script tags
                for script in lyrics_div.find_all('script'):
                    script.decompose()
                
                lyrics = lyrics_div.get_text(separator='\n').strip()
                if lyrics and not any(x in lyrics.lower() for x in ['not found', 'no lyrics']):
                    self.logger.info("Successfully found lyrics on lyrics.az")
                    return lyrics
            
            self.logger.info("Could not find lyrics on lyrics.az")
            return None
            
        except Exception as e:
            self.logger.error(f"Error scraping lyrics.az: {str(e)}")
            return None

    def create_markdown(self, song_data, lyrics, album_id, track_number):
        """Create markdown file with lyrics."""
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
            self.logger.error(f"Error creating markdown for {song_data['title']}: {str(e)}")
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
        success_songs = 0

        with open(csv_path, 'r') as file:
            reader = csv.DictReader(file)
            total_songs = sum(1 for row in reader if row['Has Lyrics'] == 'Failed')

        self.logger.info(f"Found {total_songs} failed songs to retry")

        with open(csv_path, 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                if row['Has Lyrics'] == 'Failed':
                    processed_songs += 1
                    self.logger.info(f"\nProcessing [{processed_songs}/{total_songs}]: {row['Song Title']} from {row['Album']}")

                    if any(keyword in row['Song Title'].lower() for keyword in 
                          ['(intro)', '(shock)', '(denial)', '(anger)', '(bargaining)', 
                           '(depression)', '(acceptance)', '(the end)', '(yellow #5)', '(rumi)']):
                        self.logger.info(f"Skipping instrumental/intro track: {row['Song Title']}")
                        self.update_song_index(row, 'Skipped')
                        skipped_songs += 1
                        continue

                    # Try to get lyrics from lyrics.az
                    lyrics = self.scrape_lyricsaz(row['Album'], row['Song Title'])
                    
                    if lyrics:
                        success = self.create_markdown(
                            {'title': row['Song Title']},
                            lyrics,
                            row['Album'],
                            row['Track Number']
                        )
                        if success:
                            self.update_song_index(row, 'Yes')
                            self.logger.info(f"Successfully processed: {row['Song Title']}")
                            success_songs += 1
                            continue

                    failed_songs += 1
                    self.update_song_index(row, 'Failed')
                    self.logger.info(f"Failed to process: {row['Song Title']}")

                    time.sleep(2)  # Delay between requests

        self.logger.info(f"\nProcessing complete.")
        self.logger.info(f"Total songs processed: {processed_songs}")
        self.logger.info(f"Successfully processed: {success_songs}")
        self.logger.info(f"Failed songs: {failed_songs}")
        self.logger.info(f"Skipped songs: {skipped_songs}")

def main():
    try:
        fetcher = LyricsAzFetcher()
        fetcher.process_songs()
    except Exception as e:
        print(f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    main()