#!/usr/bin/env python3
"""Publish WookieFoot lyrics to LRCLIB.net
Usage: python3 scripts/lrclib_publish.py [--batch N-M] [--dry-run]
  --batch 0-19    Process songs at indices 0..19
  --batch 20-39   Process songs at indices 20..39
  --dry-run       Solve challenges but don't actually publish
"""
import hashlib, json, sys, time, os, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor

QUEUE_FILE = "/tmp/lrclib_publish_needed.json"
RESULTS_FILE = "/tmp/lrclib_publish_results.json"
API_BASE = "https://lrclib.net/api"
USER_AGENT = "WookieFoot Lyrics Bot v1.0 (https://wookiefoot.com)"


def request_challenge():
    req = urllib.request.Request(f"{API_BASE}/request-challenge", method="POST")
    req.add_header("User-Agent", USER_AGENT)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def solve_challenge(prefix, target_hex):
    target_int = int(target_hex, 16)
    nonce = 0
    while True:
        test = f"{prefix}{nonce}".encode()
        h = hashlib.sha256(test).hexdigest()
        if int(h, 16) < target_int:
            return nonce
        nonce += 1


def publish_song(song, dry_run=False):
    title = song["trackName"]
    try:
        # First check if it already exists
        search_url = f"{API_BASE}/search?track_name={urllib.parse.quote(title)}&artist_name=Wookiefoot"
        req = urllib.request.Request(search_url)
        req.add_header("User-Agent", USER_AGENT)
        with urllib.request.urlopen(req) as resp:
            existing = json.loads(resp.read())

        # Check if exact match exists with lyrics
        for e in existing:
            if (e.get("trackName", "").lower() == title.lower() and
                e.get("albumName", "").lower() == song["albumName"].lower() and
                e.get("plainLyrics")):
                return {"song": title, "status": "SKIP", "reason": "already exists with lyrics"}

        # Get challenge and solve
        t0 = time.time()
        challenge = request_challenge()
        nonce = solve_challenge(challenge["prefix"], challenge["target"])
        solve_time = time.time() - t0
        publish_token = f"{challenge['prefix']}:{nonce}"

        if dry_run:
            return {"song": title, "status": "DRY_RUN", "solve_time": f"{solve_time:.1f}s", "nonce": nonce}

        # Publish — token goes in X-Publish-Token header, not body
        payload = json.dumps({
            "trackName": song["trackName"],
            "artistName": song["artistName"],
            "albumName": song["albumName"],
            "duration": song["duration"],
            "plainLyrics": song["plainLyrics"],
            "syncedLyrics": song.get("syncedLyrics", ""),
        }).encode()

        req = urllib.request.Request(f"{API_BASE}/publish", data=payload, method="POST")
        req.add_header("Content-Type", "application/json")
        req.add_header("User-Agent", USER_AGENT)
        req.add_header("X-Publish-Token", publish_token)

        with urllib.request.urlopen(req) as resp:
            result = resp.read().decode()

        return {"song": title, "album": song["albumName"], "status": "OK", "solve_time": f"{solve_time:.1f}s"}

    except Exception as e:
        return {"song": title, "status": "ERROR", "error": str(e)}


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    batch_range = None

    for arg in args:
        if arg.startswith("--batch"):
            idx = args.index(arg)
            if idx + 1 < len(args):
                start, end = args[idx + 1].split("-")
                batch_range = (int(start), int(end))

    with open(QUEUE_FILE) as f:
        songs = json.load(f)

    if batch_range:
        start, end = batch_range
        songs = songs[start:end + 1]
        print(f"Processing batch {start}-{end} ({len(songs)} songs)")
    else:
        print(f"Processing all {len(songs)} songs")

    results = []
    for i, song in enumerate(songs):
        print(f"[{i+1}/{len(songs)}] {song['trackName']} ({song['albumName']})...", flush=True)

        # Skip songs with very short lyrics (likely interludes/placeholders)
        if len(song["plainLyrics"]) < 30:
            result = {"song": song["trackName"], "status": "SKIP", "reason": f"too short ({len(song['plainLyrics'])} chars)"}
            print(f"  → SKIP (too short)")
        else:
            result = publish_song(song, dry_run=dry_run)
            print(f"  → {result['status']} {result.get('solve_time', '')}")

        results.append(result)

    # Save results
    batch_suffix = f"_{batch_range[0]}-{batch_range[1]}" if batch_range else ""
    results_path = f"/tmp/lrclib_publish_results{batch_suffix}.json"
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)

    # Summary
    ok = sum(1 for r in results if r["status"] == "OK")
    skip = sum(1 for r in results if r["status"] == "SKIP")
    err = sum(1 for r in results if r["status"] == "ERROR")
    dry = sum(1 for r in results if r["status"] == "DRY_RUN")
    print(f"\nDone! OK={ok} SKIP={skip} ERROR={err} DRY_RUN={dry}")
    print(f"Results: {results_path}")


if __name__ == "__main__":
    main()
