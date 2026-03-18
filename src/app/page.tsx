import WFCard from '@/components/ui/WFCard';
import { AlbumCover } from '@/components/ui/AlbumCover';
import Link from 'next/link';
import { getAllAlbums } from '@/lib/utils/markdown';
import { getAlbumImageUrl } from '@/lib/utils/image-processing';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WookieFoot Lyrics Archive',
  description: 'Explore WookieFoot lyrics, albums, and connect with the community.',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const albums = await getAllAlbums();

  // Get the latest album chronologically (last in sorted array)
  const latestAlbum = albums.length > 0 ? albums[albums.length - 1] : null;
  const latestAlbumCover = latestAlbum
    ? getAlbumImageUrl(latestAlbum.title, 'full')
    : '';

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section
        className="rounded-xl rounded-b-3xl p-10 md:p-16 text-center"
        style={{
          background: 'linear-gradient(135deg, #2D5016, #4A7A2B, #D4910A)',
        }}
      >
        <h1 className="font-display text-5xl md:text-6xl text-white">
          WookieFoot
        </h1>
        <p className="font-lyrics italic text-xl text-white/90 mt-4 max-w-xl mx-auto">
          Music for the mind, body, and soul
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/albums" className="btn-primary w-full sm:w-auto">
            Explore Albums
          </Link>
          <a
            href="https://www.youtube.com/@wookiefootmark"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full sm:w-auto text-white border-2 border-white hover:bg-white/10"
          >
            Watch on YouTube
          </a>
        </div>
      </section>

      {/* Band Intro */}
      <section className="bg-bg-secondary rounded-xl p-8 md:p-10">
        <p className="font-body text-text-secondary text-lg max-w-3xl mx-auto text-center leading-relaxed">
          WookieFoot is a band from Minneapolis that blends folk, funk, reggae,
          and rock with conscious lyrics and high-energy live shows. Known for
          their annual Shangri-La Music Festival, they have been spreading joy
          and wisdom since 2000.
        </p>
      </section>

      {/* Latest Album */}
      {latestAlbum && (
        <section>
          <WFCard variant="elevated" className="flex flex-col md:flex-row items-center gap-8">
            <AlbumCover
              albumTitle={latestAlbum.title}
              src={latestAlbumCover}
              size="lg"
            />
            <div className="text-center md:text-left">
              <p className="text-text-muted text-sm font-body uppercase tracking-wide">
                Latest Album
              </p>
              <h2 className="font-display text-3xl text-text-primary mt-1">
                {latestAlbum.title}
              </h2>
              <p className="text-text-secondary font-body mt-1">
                {latestAlbum.year} &middot; {latestAlbum.tracks?.length ?? 0} tracks
              </p>
              <Link
                href={`/albums/${latestAlbum.id}`}
                className="btn-primary inline-block mt-4"
              >
                View Album
              </Link>
            </div>
          </WFCard>
        </section>
      )}

      {/* Community Links */}
      <section>
        <h2 className="font-display text-2xl text-text-primary text-center mb-6">
          Connect
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <WFCard className="border border-[#D4C5A9] rounded-xl p-6 hover:shadow-md transition-shadow">
            <h3 className="font-display text-accent-primary text-lg">YouTube</h3>
            <p className="text-text-secondary text-sm mt-2 font-body">
              Official YouTube channel with live performances and music videos
            </p>
            <a
              href="https://www.youtube.com/@wookiefootmark"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-accent-primary text-sm font-body hover:underline"
            >
              Visit &rarr;
            </a>
          </WFCard>

          <WFCard className="border border-[#D4C5A9] rounded-xl p-6 hover:shadow-md transition-shadow">
            <h3 className="font-display text-accent-primary text-lg">Shangri-La</h3>
            <p className="text-text-secondary text-sm mt-2 font-body">
              Annual music festival in Minnesota &mdash; Labor Day Weekend
            </p>
            <a
              href="https://www.shangrilafest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-accent-primary text-sm font-body hover:underline"
            >
              Visit &rarr;
            </a>
          </WFCard>

          <WFCard className="border border-[#D4C5A9] rounded-xl p-6 hover:shadow-md transition-shadow">
            <h3 className="font-display text-accent-primary text-lg">Be The Change</h3>
            <p className="text-text-secondary text-sm mt-2 font-body">
              501(c)(3) charity &mdash; $500K+ donated to communities
            </p>
            <a
              href="https://www.bethechangecharities.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-accent-primary text-sm font-body hover:underline"
            >
              Visit &rarr;
            </a>
          </WFCard>

          <WFCard className="border border-[#D4C5A9] rounded-xl p-6 hover:shadow-md transition-shadow">
            <h3 className="font-display text-accent-primary text-lg">Bandcamp</h3>
            <p className="text-text-secondary text-sm mt-2 font-body">
              Support the band &mdash; buy their music
            </p>
            <a
              href="https://wookiefoot.bandcamp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-accent-primary text-sm font-body hover:underline"
            >
              Visit &rarr;
            </a>
          </WFCard>
        </div>
      </section>
    </div>
  );
}
