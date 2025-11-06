import Link from 'next/link';
import { RetroCard } from '@/components/ui/RetroCard';
import { AlbumCover } from '@/components/ui/AlbumCover';
import { getAllAlbums } from '@/lib/utils/markdown';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const albums = await getAllAlbums();
  const featuredAlbum = albums[0]; // Latest album

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <RetroCard variant="primary" className="p-8">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="text-white cosmic-glow">WookieFoot</span>
              <span className="text-gradient block mt-2">Lyrics Archive</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl">
              Explore lyrics, discover meanings, and connect with other fans in our
              growing community of WookieFoot enthusiasts.
            </p>
            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
              <Link 
                href="/albums" 
                className="btn-retro"
                prefetch={true}
              >
                Browse Albums
              </Link>
              <Link 
                href="/search" 
                className="btn-retro bg-gradient-teal-brown hover:bg-gradient-green-orange"
                prefetch={true}
              >
                Search Lyrics
              </Link>
            </div>
          </div>
          <div className="w-72 md:w-96 transform hover:scale-105 transition-transform duration-500 relative z-10 group">
            <div className="absolute -inset-4 bg-gradient-green-orange rounded-lg blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <AlbumCover
                albumArt={featuredAlbum.coverArt}
                title={featuredAlbum.title}
                priority={true}
                size="lg"
              />
            </div>
          </div>
        </div>
      </RetroCard>

      {/* Featured Sections */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Latest Album */}
        <RetroCard variant="secondary" className="p-6 hover:bg-black/40 transition-all duration-300">
          <h2 className="text-xl font-bold text-gradient mb-4">
            Latest Album
          </h2>
          <div className="space-y-4">
            <div className="w-40 mx-auto transform hover:scale-105 transition-transform duration-500 group relative">
              <div className="absolute -inset-2 bg-gradient-green-orange rounded-lg blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <AlbumCover
                  albumArt={featuredAlbum.coverArt}
                  title={featuredAlbum.title}
                  size="md"
                />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">
                {featuredAlbum.title}
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                {featuredAlbum.description}
              </p>
              <Link
                href={`/albums/${featuredAlbum.id}`}
                className="btn-retro mt-4 inline-block text-sm"
                prefetch={true}
              >
                View Album
              </Link>
            </div>
          </div>
        </RetroCard>

        {/* Popular Lyrics */}
        <RetroCard variant="secondary" className="p-6 hover:bg-black/40 transition-all duration-300">
          <h2 className="text-xl font-bold text-gradient mb-4">
            Popular Lyrics
          </h2>
          <div className="space-y-3">
            {featuredAlbum.tracks?.slice(0, 3).map((track) => (
              <Link
                key={track.id}
                href={`/lyrics/${track.slug}`}
                className="block group"
                prefetch={true}
              >
                <div className="p-3 rounded-lg bg-black/20 hover:bg-black/40 border border-accent-teal/10 hover:border-accent-green/30 transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-white group-hover:text-accent-green transition-all duration-300">
                        {track.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {featuredAlbum.title}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 ml-4">
                      {track.duration}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            <div className="text-center pt-2">
              <Link 
                href="/lyrics" 
                className="btn-retro text-sm"
                prefetch={true}
              >
                View All Lyrics
              </Link>
            </div>
          </div>
        </RetroCard>
      </div>

      {/* Community Section */}
      <RetroCard variant="primary" className="p-8 text-center hover-lift">
        <h2 className="text-3xl font-bold text-gradient mb-4 cosmic-glow">
          Join the Community
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Connect with other WookieFoot fans, share your interpretations, and
          discover new perspectives on your favorite songs.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link 
            href="/about" 
            className="btn-retro"
            prefetch={true}
          >
            Learn More
          </Link>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-retro bg-gradient-teal-brown hover:bg-gradient-green-orange"
          >
            Follow on Spotify
          </a>
        </div>
      </RetroCard>
    </div>
  );
}
