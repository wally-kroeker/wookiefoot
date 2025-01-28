import azapi
import csv
import os

def fetch_lyrics(artist_name, song_title):
    api = azapi.AZlyrics()
    api.artist = artist_name
    api.title = song_title
    api.getLyrics()
    return api.lyrics

def update_song_index(csv_filepath, lyrics_dir):
    with open(csv_filepath, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    updated_rows = []
    for row in rows:
        song_title = row['Song Title']
        album_name = row['Album'] # Added album_name
        has_lyrics = row['Has Lyrics']

        if has_lyrics == 'No': # Check if lyrics are not already fetched
            lyrics = fetch_lyrics('Wookiefoot', song_title)
            if lyrics and lyrics != 'No lyrics found :(':
                lyrics_filename = f"{album_name} - {song_title}.html" # Use album_name
                lyrics_filepath = os.path.join(lyrics_dir, lyrics_filename)
                with open(lyrics_filepath, 'w', encoding='utf-8') as outfile:
                    outfile.write(lyrics)
                row['Has Lyrics'] = 'Yes' # Update lyrics status to 'Yes'
                print(f"Lyrics fetched and saved for: {song_title}")
            else:
                row['Has Lyrics'] = 'Failed' # Update lyrics status to 'Failed'
                print(f"Lyrics NOT found for: {song_title}")
        updated_rows.append(row)

    with open(csv_filepath, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = reader.fieldnames if reader.fieldnames else ['Album', 'Year', 'Song Title', 'Track Number', 'Has Lyrics'] # Use correct fieldnames
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(updated_rows)

if __name__ == '__main__':
    csv_filepath = '/home/walub/projects/wookiefoot/song_index.csv'
    lyrics_dir = '/home/walub/projects/wookiefoot/lyrics'
    update_song_index(csv_filepath, lyrics_dir)
