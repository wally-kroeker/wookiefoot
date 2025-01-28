import Link from 'next/link';
import { RetroCard } from '@/components/ui/RetroCard';
import { getAllSongs } from '@/lib/utils/markdown';

export default async function LyricsPage() {
  const songs = await getAllSongs();

  return (
    <div className="space-y-8">
      {/* Header */}
      <RetroCard variant="primary" className="p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-retro-paper">WookieFoot</span>
            <span className="text-gradient block mt-2">Lyrics Archive</span>
          </h1>
          <p className="text-lg text-retro-paper/80 max-w-2xl mx-auto">
            Browse through our collection of WookieFoot lyrics. Click on any song to
            view its full lyrics and details.
          </p>
        </div>
      </RetroCard>

      {/* Songs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {songs.map((song) => (
          <Link key={song.id} href={`/lyrics/${song.slug}`}>
            <RetroCard
              variant="secondary"
              className="p-6 hover-lift group transition-all duration-300 hover:bg-navy-800/50"
            >
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-retro-paper group-hover:text-gradient">
                    {song.title}
                  </h2>
                  {song.description && (
                    <p className="mt-2 text-sm text-retro-paper/60">
                      {song.description}
                    </p>
                  )}
                </div>

                {/* Tags */}
                {song.tags && song.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {song.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full bg-navy-800 text-retro-paper/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-accent-blue/20">
                  <span className="text-sm text-retro-paper/60">
                    {song.duration}
                  </span>
                  <span className="text-accent-blue group-hover:text-accent-pink transition-colors duration-300">
                    View Lyrics →
                  </span>
                </div>
              </div>
            </RetroCard>
          </Link>
        ))}
      </div>

      {/* Call to Action */}
      <RetroCard variant="secondary" className="p-6 text-center">
        <p className="text-retro-paper/80">
          Can't find what you're looking for?{' '}
          <Link
            href="/search"
            className="text-accent-blue hover:text-accent-pink transition-colors duration-300"
          >
            Try searching our complete lyrics archive
          </Link>
        </p>
      </RetroCard>
    </div>
  );
}