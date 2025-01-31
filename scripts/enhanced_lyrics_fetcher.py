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
import logging
from tavily import TavilyClient
from tavily.errors import MissingAPIKeyError, InvalidAPIKeyError, UsageLimitExceededError

TAVILY_API_KEY = "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"

class EnhancedLyricsFetcher:
    def __init__(self):
        self.error_log = []
        self.project_root = Path(__file__).parent.parent
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Configure logging first
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler()  # Only log to console for better visibility
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        try:
            self.tavily_client = TavilyClient(api_key=TAVILY_API_KEY)
        except MissingAPIKeyError:
            self.logger.error("Tavily API key is missing")
            raise

    def search_tavily(self, query, include_domains=None, search_depth="basic"):
        """Search using Tavily API."""
        self.logger.info(f"Searching Tavily for: {query}")
        try:
            response = self.tavily_client.search(
                query,
                search_depth=search_depth,
                include_domains=include_domains,
                max_results=5
            )
            if response and response.get('results'):
                self.logger.info(f"Found {len(response['results'])} results from Tavily")
            else:
                self.logger.info("No results found from Tavily")
            return response
        except (InvalidAPIKeyError, UsageLimitExceededError) as e:
            self.logger.error(f"Tavily API error: {str(e)}")
            raise
        except Exception as e:
            self.logger.error(f"Unexpected error during Tavily search: {str(e)}")
            return None

    def find_music_links(self, artist, song_title):
        """Find YouTube Music and Spotify links for the song."""
        self.logger.info(f"Searching music links for: {artist} - {song_title}")
        youtube_url = ""
        spotify_url = ""

        try:
            # Search for YouTube Music
            self.logger.info("Searching YouTube Music...")
            yt_response = self.search_tavily(
                f"{artist} {song_title} site:music.youtube.com",
                include_domains=["music.youtube.com"],
                search_depth="basic"
            )
            
            if yt_response and yt_response.get('results'):
                for result in yt_response['results']:
                    if 'music.youtube.com' in result['url'] and '/watch?' in result['url']:
                        youtube_url = result['url']
                        self.logger.info(f"Found YouTube Music link: {youtube_url}")
                        break

            # Search for Spotify
            self.logger.info("Searching Spotify...")
            spotify_response = self.search_tavily(
                f"{artist} {song_title} site:open.spotify.com",
                include_domains=["open.spotify.com"],
                search_depth="basic"
            )
            
            if spotify_response and spotify_response.get('results'):
                for result in spotify_response['results']:
                    if 'open.spotify.com/track' in result['url']:
                        spotify_url = result['url']
                        self.logger.info(f"Found Spotify link: {spotify_url}")
                        break

        except Exception as e:
            self.logger.error(f"Error searching music links: {str(e)}")
        
        return youtube_url, spotify_url

    def get_elyrics_url(self, artist, song_title):
        """Generate URL for elyrics.net."""
        # elyrics.net uses first letter of artist name in URL
        artist_first_letter = artist[0].lower()
        artist_url = artist.lower().replace(" ", "-")
        song_url = song_title.lower().replace(" ", "-")
        # Remove special characters except hyphens
        song_url = re.sub(r'[^a-z0-9\-]', '', song_url)
        # Replace multiple hyphens with single hyphen
        song_url = re.sub(r'-+', '-', song_url)
        return f"https://www.elyrics.net/read/{artist_first_letter}/{artist_url}-lyrics/{song_url}-lyrics.html"

    def scrape_elyrics(self, artist, song_title):
        """Scrape lyrics directly from elyrics.net."""
        url = self.get_elyrics_url(artist, song_title)
        self.logger.info(f"Attempting to scrape lyrics from elyrics.net: {url}")
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find the lyrics div (it's usually the second div with class 'ly')
            lyrics_div = soup.find_all('div', class_='ly')
            if len(lyrics_div) >= 2:
                lyrics_div = lyrics_div[1]  # Get the second div
                lyrics = lyrics_div.get_text(separator='\n').strip()
                if lyrics and not any(x in lyrics.lower() for x in ['not found', 'no lyrics']):
                    self.logger.info("Successfully found lyrics on elyrics.net")
                    return lyrics
            
            self.logger.info("Could not find lyrics on elyrics.net")
            return None
            
        except Exception as e:
            self.logger.error(f"Error scraping elyrics.net: {str(e)}")
            return None

    def get_songlyrics_url(self, artist, song_title):
        """Generate URL for songlyrics.com."""
        artist_url = artist.lower().replace(" ", "-")
        song_url = song_title.lower().replace(" ", "-")
        # Remove special characters except hyphens
        song_url = re.sub(r'[^a-z0-9\-]', '', song_url)
        # Replace multiple hyphens with single hyphen
        song_url = re.sub(r'-+', '-', song_url)
        return f"https://www.songlyrics.com/{artist_url}/{song_url}-lyrics/"

    def scrape_songlyrics(self, artist, song_title):
        """Scrape lyrics directly from songlyrics.com."""
        url = self.get_songlyrics_url(artist, song_title)
        self.logger.info(f"Attempting to scrape lyrics from songlyrics.com: {url}")
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            lyrics_div = soup.find('p', id='songLyricsDiv')
            if lyrics_div:
                lyrics = lyrics_div.get_text(separator='\n').strip()
                if lyrics and not lyrics.lower().startswith('sorry'):  # Check for "sorry, we have no" message
                    self.logger.info("Successfully found lyrics on songlyrics.com")
                    return lyrics
            
            self.logger.info("Could not find lyrics on songlyrics.com")
            return None
            
        except Exception as e:
            self.logger.error(f"Error scraping songlyrics.com: {str(e)}")
            return None

    def scrape_lyrics_from_search(self, artist, song_title):
        """Search and scrape lyrics from multiple sources."""
        lyrics_domains = [
            "genius.com",
            "azlyrics.com",
            "musixmatch.com",
            "lyrics.com",
            "songlyrics.com",
            "elyrics.net"
        ]

        self.logger.info(f"Searching for lyrics: {artist} - {song_title}")
        try:
            # Search for lyrics across multiple domains
            self.logger.info(f"Searching lyrics on domains: {', '.join(lyrics_domains)}")
            search_response = self.search_tavily(
                f"{artist} {song_title} lyrics",
                include_domains=lyrics_domains,
                search_depth="advanced"
            )

            if not search_response or not search_response.get('results'):
                self.logger.info("No lyrics search results found")
                return None

            for result in search_response['results']:
                url = result['url']
                domain = url.split('/')[2]
                self.logger.info(f"Attempting to scrape lyrics from: {domain}")
                
                try:
                    response = self.session.get(url, timeout=10)
                    response.raise_for_status()
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Different scraping logic for different domains
                    if 'genius.com' in domain:
                        lyrics_div = soup.find('div', class_='Lyrics__Container-sc-1ynbvzw-6')
                        if lyrics_div:
                            self.logger.info("Successfully found lyrics on Genius")
                            return lyrics_div.get_text(separator='\n')
                    
                    elif 'azlyrics.com' in domain:
                        ringtone_div = soup.find('div', class_='ringtone')
                        if ringtone_div:
                            lyrics_div = ringtone_div.find_next_sibling('div')
                            if lyrics_div:
                                self.logger.info("Successfully found lyrics on AZLyrics")
                                return lyrics_div.get_text(separator='\n')
                    
                    elif 'musixmatch.com' in domain:
                        lyrics_div = soup.find('span', class_='lyrics__content__ok')
                        if lyrics_div:
                            self.logger.info("Successfully found lyrics on Musixmatch")
                            return lyrics_div.get_text(separator='\n')
                    
                    elif 'lyrics.com' in domain:
                        lyrics_div = soup.find('pre', id='lyric-body-text')
                        if lyrics_div:
                            self.logger.info("Successfully found lyrics on Lyrics.com")
                            return lyrics_div.get_text(separator='\n')

                    self.logger.info(f"Could not find lyrics in {domain} HTML structure")

                except Exception as e:
                    self.logger.error(f"Error scraping {domain}: {str(e)}")
                    continue

            self.logger.info("Could not find lyrics on any source")
            return None

        except Exception as e:
            self.logger.error(f"Tavily search error: {str(e)}")
            return None

    def create_markdown(self, song_data, lyrics, album_id, track_number):
        """Create markdown file with lyrics and music links."""
        try:
            album_dir = self.project_root / 'src' / 'content' / 'lyrics' / self.sanitize_filename(album_id.lower())
            album_dir.mkdir(parents=True, exist_ok=True)

            song_slug = self.sanitize_filename(song_data['title'].lower())
            
            # Find music links
            youtube_url, spotify_url = self.find_music_links("Wookiefoot", song_data['title'])

            frontmatter = {
                'id': song_slug,
                'title': song_data['title'],
                'albumId': self.sanitize_filename(album_id.lower()),
                'trackNumber': track_number,
                'description': f"Lyrics for {song_data['title']} by WookieFoot",
                'youtubeUrl': youtube_url,
                'spotifyUrl': spotify_url,
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
            except (KeyboardInterrupt, EOFError):
                print("\nInput cancelled. Skipping song.")
                return None

        if not lyrics_lines:
            return None
            
        return '\n'.join(lyrics_lines)

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

                    # Try songlyrics.com first
                    lyrics = self.scrape_songlyrics("Wookiefoot", row['Song Title'])
                    
                    # If songlyrics.com fails, try elyrics.net
                    if not lyrics:
                        lyrics = self.scrape_elyrics("Wookiefoot", row['Song Title'])
                    
                    # If both direct sources fail, try other sources via Tavily search
                    if not lyrics:
                        lyrics = self.scrape_lyrics_from_search("Wookiefoot", row['Song Title'])
                        
                        # If all automatic methods fail, try manual input
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
                            self.logger.info(f"Successfully processed: {row['Song Title']}")
                            continue

                    failed_songs += 1
                    self.update_song_index(row, 'Failed')
                    self.logger.info(f"Failed to process: {row['Song Title']}")

                    time.sleep(2)  # Delay between requests

        self.logger.info(f"\nProcessing complete.")
        self.logger.info(f"Total songs processed: {processed_songs}")
        self.logger.info(f"Successfully processed: {processed_songs - failed_songs - skipped_songs}")
        self.logger.info(f"Manually entered: {manual_songs}")
        self.logger.info(f"Failed songs: {failed_songs}")
        self.logger.info(f"Skipped songs: {skipped_songs}")

def main():
    try:
        fetcher = EnhancedLyricsFetcher()
        fetcher.process_songs()
    except (MissingAPIKeyError, InvalidAPIKeyError, UsageLimitExceededError) as e:
        print(f"Tavily API Error: {str(e)}")
        print("Please check your API key and usage limits.")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    main()