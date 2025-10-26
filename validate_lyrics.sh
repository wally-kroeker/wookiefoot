#!/bin/bash

echo "=== Songs marked FALSE but have actual files ==="
while IFS=',' read -r album track title slug haslyrics dir duration; do
  if [ "$haslyrics" = "FALSE" ]; then
    # Check if markdown file exists
    for file in src/content/lyrics/*/; do
      if [ -f "$file$slug.md" ]; then
        echo "MISMATCH: $title ($slug) - marked FALSE but file exists at $file$slug.md"
      fi
    done
  fi
done < <(tail -n +2 song_index.csv)

echo ""
echo "=== Songs marked TRUE but have NO files ==="
while IFS=',' read -r album track title slug haslyrics dir duration; do
  if [ "$haslyrics" = "TRUE" ]; then
    found=0
    for file in src/content/lyrics/*/"$slug.md"; do
      if [ -f "$file" ]; then
        found=1
        break
      fi
    done
    if [ $found -eq 0 ]; then
      echo "MISMATCH: $title ($slug) - marked TRUE but NO file found"
    fi
  fi
done < <(tail -n +2 song_index.csv)
