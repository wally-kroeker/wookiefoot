import type { Metadata } from 'next';
import Link from 'next/link';
import WFCard from '@/components/ui/WFCard';
import { getAllSongs } from '@/lib/utils/markdown';

export const metadata: Metadata = {
  title: 'Lyrics | WookieFoot',
  description: 'Browse all WookieFoot song lyrics organized by album.',
};

export const dynamic = 'force-dynamic';

export default async function LyricsPage() {
  const songs = await getAllSongs();

  // Group songs by album
  const albumGroups = new Map<string, typeof songs>();
  for (const song of songs) {
    const albumKey = song.albumTitle || 'Unknown Album';
    if (!albumGroups.has(albumKey)) {
      albumGroups.set(albumKey, []);
    }
    albumGroups.get(albumKey)!.push(song);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-4xl text-text-primary">Lyrics</h1>
        <p className="mt-2 text-text-secondary font-body">Browse all WookieFoot songs</p>
      </div>

      {/* Search Link */}
      <p className="text-text-secondary font-body">
        Looking for specific lyrics?{' '}
        <Link
          href="/search"
          className="text-accent-primary hover:text-accent-secondary transition-colors duration-200"
        >
          Try our search &rarr;
        </Link>
      </p>

      {/* Songs Grouped by Album */}
      {Array.from(albumGroups.entries()).map(([albumTitle, albumSongs]) => (
        <WFCard key={albumTitle}>
          <h2 className="font-display text-xl text-accent-secondary mb-4">{albumTitle}</h2>
          <div className="divide-y divide-border-subtle">
            {albumSongs.map((song) => (
              <Link
                key={song.id}
                href={`/lyrics/${song.slug}`}
                className="block py-3 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-text-primary font-medium font-body group-hover:text-accent-primary transition-colors duration-200">
                      {song.title}
                    </span>
                    <span className="ml-3 text-text-muted text-sm font-body">
                      {albumTitle}
                    </span>
                  </div>
                  <span className="text-text-muted text-sm font-body flex-shrink-0 ml-4">
                    {song.duration}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </WFCard>
      ))}
    </div>
  );
}
