import Link from 'next/link';
import { RetroCard } from '@/components/ui/RetroCard';
import { AlbumCover } from '@/components/ui/AlbumCover';
import { getAllAlbums } from '@/lib/utils/markdown';

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
              <span className="text-retro-paper">WookieFoot</span>
              <span className="text-gradient block mt-2">Lyrics Archive</span>
            </h1>
            <p className="mt-6 text-lg text-retro-paper/80 max-w-2xl">
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
                className="btn-retro"
                prefetch={true}
              >
                Search Lyrics
              </Link>
            </div>
          </div>
          <div className="w-72 md:w-96 transform hover:scale-105 transition-transform duration-300 relative z-10">
            <AlbumCover
              albumArt={featuredAlbum.coverArt}
              title={featuredAlbum.title}
              priority={true}
              size="lg"
            />
          </div>
        </div>
      </RetroCard>

      {/* Featured Sections */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Latest Album */}
        <RetroCard variant="secondary" className="p-6">
          <h2 className="text-2xl font-bold text-gradient mb-4">
            Latest Album
          </h2>
          <div className="space-y-4">
            <div className="w-48 mx-auto transform hover:scale-105 transition-transform duration-300">
              <AlbumCover
                albumArt={featuredAlbum.coverArt}
                title={featuredAlbum.title}
                size="md"
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-retro-paper">
                {featuredAlbum.title}
              </h3>
              <p className="text-retro-paper/60 mt-2">
                {featuredAlbum.description}
              </p>
              <Link
                href={`/albums/${featuredAlbum.id}`}
                className="btn-retro mt-4 inline-block"
                prefetch={true}
              >
                View Album
              </Link>
            </div>
          </div>
        </RetroCard>

        {/* Popular Lyrics */}
        <RetroCard variant="secondary" className="p-6">
          <h2 className="text-2xl font-bold text-gradient mb-4">
            Popular Lyrics
          </h2>
          <div className="space-y-4">
            {featuredAlbum.tracks?.slice(0, 3).map((track) => (
              <Link
                key={track.id}
                href={`/lyrics/${track.slug}`}
                className="block group"
                prefetch={true}
              >
                <RetroCard variant="default" className="p-4 hover-lift">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-retro-paper group-hover:text-gradient">
                        {track.title}
                      </h3>
                      <p className="text-sm text-retro-paper/60">
                        {featuredAlbum.title}
                      </p>
                    </div>
                    <span className="text-sm text-retro-paper/60">
                      {track.duration}
                    </span>
                  </div>
                </RetroCard>
              </Link>
            ))}
            <div className="text-center">
              <Link 
                href="/lyrics" 
                className="btn-retro"
                prefetch={true}
              >
                View All Lyrics
              </Link>
            </div>
          </div>
        </RetroCard>
      </div>

      {/* Community Section */}
      <RetroCard variant="primary" className="p-8 text-center">
        <h2 className="text-3xl font-bold text-gradient mb-4">
          Join the Community
        </h2>
        <p className="text-lg text-retro-paper/80 max-w-2xl mx-auto">
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
            className="btn-retro"
          >
            Follow on Spotify
          </a>
        </div>
      </RetroCard>
    </div>
  );
}
