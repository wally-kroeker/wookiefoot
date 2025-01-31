import csv
import os
from pathlib import Path
import requests
from bs4 import BeautifulSoup
import time
import logging
import re
import yaml
import json
from datetime import datetime

class MultiSourceLyricsScraper:
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
        
        # Load known URLs if exists
        self.known_urls_file = self.project_root / 'scripts' / 'known_lyrics_urls.json'
        self.known_urls = self.load_known_urls()

    def load_known_urls(self):
        """Load known working URLs."""
        if self.known_urls_file.exists():
            try:
                with open(self.known_urls_file, 'r') as f:
                    return json.load(f)
            except:
                return {"genius": {}, "musixmatch": {}}
        return {"genius": {}, "musixmatch": {}}

    def save_known_urls(self):
        """Save working URLs."""
        with open(self.known_urls_file, 'w') as f:
            json.dump(self.known_urls, f, indent=2)

    def get_genius_url(self, artist, song_title):
        """Get Genius URL for song."""
        if song_title in self.known_urls["genius"]:
            return self.known_urls["genius"][song_title]

        # Generate URL using Genius pattern
        artist_url = artist.replace(" ", "")
        song_url = song_title.lower().replace(" ", "-")
        song_url = re.sub(r'[^a-z0-9\-]', '', song_url)
        song_url = re.sub(r'-+', '-', song_url)
        
        return f"https://genius.com/{artist_url}-{song_url}-lyrics"

    def get_musixmatch_url(self, artist, song_title):
        """Get Musixmatch URL for song."""
        if song_title in self.known_urls["musixmatch"]:
            return self.known_urls["musixmatch"][song_title]

        # Generate URL using Musixmatch pattern
        artist_url = artist.replace(" ", "-")
        song_url = song_title.replace(" ", "-")
        # Remove special characters except hyphens
        song_url = re.sub(r'[^a-zA-Z0-9\-]', '', song_url)
        # Replace multiple hyphens with single hyphen
        song_url = re.sub(r'-+', '-', song_url)
        
        return f"https://www.musixmatch.com/lyrics/{artist_url}/{song_url}"

    def verify_url(self, url):
        """Verify if URL exists without downloading full page."""
        try:
            response = self.session.head(url)
            return response.status_code == 200
        except:
            return False

    def scrape_genius(self, url, song_title):
        """Scrape lyrics from Genius."""
        self.logger.info(f"Attempting to scrape from Genius: {url}")
        try:
            response = self.session.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            lyrics_div = soup.find('div', attrs={'data-lyrics-container': 'true'})
            
            if lyrics_div:
                # Remove script tags
                for script in lyrics_div.find_all('script'):
                    script.decompose()
                
                lyrics = lyrics_div.get_text(separator='\n').strip()
                if lyrics:
                    self.known_urls["genius"][song_title] = url
                    self.save_known_urls()
                    return lyrics
            
            return None

        except Exception as e:
            self.logger.error(f"Error scraping Genius: {str(e)}")
            return None

    def scrape_musixmatch(self, url, song_title):
        """Scrape lyrics from Musixmatch."""
        self.logger.info(f"Attempting to scrape from Musixmatch: {url}")
        try:
            response = self.session.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find the lyrics container
            lyrics_div = soup.find('span', class_='lyrics__content__ok')
            if not lyrics_div:
                lyrics_div = soup.find('div', class_='mxm-lyrics')
            
            if lyrics_div:
                lyrics = lyrics_div.get_text(separator='\n').strip()
                if lyrics:
                    self.known_urls["musixmatch"][song_title] = url
                    self.save_known_urls()
                    return lyrics
            
            return None

        except Exception as e:
            self.logger.error(f"Error scraping Musixmatch: {str(e)}")
            return None

    def get_lyrics(self, song_title):
        """Try multiple sources to get lyrics."""
        # Try Genius first
        genius_url = self.get_genius_url("Wookiefoot", song_title)
        if self.verify_url(genius_url):
            lyrics = self.scrape_genius(genius_url, song_title)
            if lyrics:
                self.logger.info("Found lyrics on Genius")
                return lyrics

        # Try Musixmatch next
        musixmatch_url = self.get_musixmatch_url("Wookiefoot", song_title)
        if self.verify_url(musixmatch_url):
            lyrics = self.scrape_musixmatch(musixmatch_url, song_title)
            if lyrics:
                self.logger.info("Found lyrics on Musixmatch")
                return lyrics

        self.logger.info("Could not find lyrics on any source")
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

                    # Try to get lyrics from any source
                    lyrics = self.get_lyrics(row['Song Title'])
                    
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
                            continue

                    failed_songs += 1
                    self.update_song_index(row, 'Failed')
                    self.logger.info(f"Failed to process: {row['Song Title']}")

                    time.sleep(2)  # Delay between songs

        self.logger.info(f"\nProcessing complete.")
        self.logger.info(f"Total songs processed: {processed_songs}")
        self.logger.info(f"Successfully processed: {processed_songs - failed_songs - skipped_songs}")
        self.logger.info(f"Failed songs: {failed_songs}")
        self.logger.info(f"Skipped songs: {skipped_songs}")
        
        # Print all known working URLs at the end
        self.logger.info("\nKnown working URLs:")
        for source in ["genius", "musixmatch"]:
            if self.known_urls[source]:
                self.logger.info(f"\n{source.title()} URLs:")
                for song, url in self.known_urls[source].items():
                    self.logger.info(f"{song}: {url}")

def main():
    try:
        scraper = MultiSourceLyricsScraper()
        scraper.process_songs()
    except Exception as e:
        print(f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    main()