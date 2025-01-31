#!/usr/bin/env python3
import os
import csv
import frontmatter
import re

def normalize_name(name):
    """Normalize names for comparison by removing special characters and converting to lowercase"""
    # Remove special characters, convert to lowercase
    normalized = re.sub(r'[^\w\s-]', '', name.lower())
    # Replace multiple spaces/dashes with single dash
    normalized = re.sub(r'[\s-]+', '-', normalized.strip())
    return normalized

def read_csv(file_path):
    """Read CSV file and return list of dictionaries"""
    with open(file_path, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        return list(reader)

def write_csv(file_path, data, fieldnames):
    """Write data to CSV file"""
    with open(file_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

def extract_metadata_from_markdown(directory):
    """Extract metadata from markdown files in directory"""
    metadata = {}
    metadata_fields = {
        'albumId': 'Album ID',
        'contributors': 'Contributors',
        'createdAt': 'Created At',
        'description': 'Description',
        'id': 'ID',
        'spotifyUrl': 'Spotify URL',
        'tags': 'Tags',
        'title': 'Title',
        'trackNumber': 'Track Number',
        'youtubeUrl': 'YouTube URL'
    }
    
    for root, _, files in os.walk(directory):
        album = os.path.basename(root)
        if not album:  # Skip the root directory itself
            continue
            
        for file in files:
            if file.endswith('.md'):
                try:
                    path = os.path.join(root, file)
                    with open(path, 'r', encoding='utf-8') as f:
                        post = frontmatter.load(f)
                        # Get song title from the frontmatter title if available
                        song_title = post.metadata.get('title', 
                                                     os.path.splitext(file)[0].replace('-', ' ').title())
                        
                        # Store metadata with normalized keys for comparison
                        metadata[(normalize_name(album), song_title)] = {
                            field: post.metadata.get(key, '')
                            for key, field in metadata_fields.items()
                        }
                except Exception as e:
                    print(f"Error processing {path}: {str(e)}")
    return metadata

def update_csv_with_metadata(csv_data, metadata):
    """Update CSV data with metadata information"""
    # Gather all metadata fields
    all_meta_keys = set()
    for meta in metadata.values():
        all_meta_keys.update(meta.keys())

    # Initialize fieldnames with existing CSV headers
    fieldnames = list(csv_data[0].keys())
    
    # Add new metadata keys as columns if they don't exist
    for key in all_meta_keys:
        if key not in fieldnames:
            fieldnames.append(key)
            # Initialize new columns with empty string
            for row in csv_data:
                row[key] = ''

    # Update metadata where present
    for row in csv_data:
        album = row['Album']
        song_title = row['Song Title']
        key = (normalize_name(album), song_title)
        
        if key in metadata:
            # Update all metadata fields
            for meta_key, meta_value in metadata[key].items():
                if isinstance(meta_value, list):
                    row[meta_key] = ', '.join(str(v) for v in meta_value)
                else:
                    row[meta_key] = str(meta_value) if meta_value is not None else ''

    return csv_data, fieldnames

def main():
    """Main function to update song index with metadata"""
    csv_path = 'song_index.csv'
    lyrics_dir = 'src/content/lyrics'
    
    try:
        print("Reading CSV file...")
        csv_data = read_csv(csv_path)
        
        print("Extracting metadata from markdown files...")
        metadata = extract_metadata_from_markdown(lyrics_dir)
        
        print("Updating CSV with metadata...")
        updated_data, updated_fieldnames = update_csv_with_metadata(csv_data, metadata)
        
        print("Writing updated CSV file...")
        write_csv(csv_path, updated_data, updated_fieldnames)
        
        print("Successfully updated song index!")
    except Exception as e:
        print(f"Error: {str(e)}")
        raise

if __name__ == '__main__':
    main()