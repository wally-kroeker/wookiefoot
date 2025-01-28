import { RetroCard } from '@/components/ui/RetroCard';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Main About Section */}
      <RetroCard variant="primary" className="p-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          <span className="text-retro-paper">About</span>
          <span className="text-gradient block mt-2">WookieFoot Lyrics</span>
        </h1>
        
        <div className="space-y-6 text-retro-paper/80">
          <p>
            Welcome to WookieFoot Lyrics, a fan-created archive dedicated to celebrating
            and preserving the musical legacy of WookieFoot. Our mission is to provide
            a comprehensive resource for fans to explore lyrics, share interpretations,
            and connect through music.
          </p>
          
          <p>
            This site is created by fans, for fans, and is not officially affiliated
            with WookieFoot. All lyrics and content are property of their respective
            owners and are provided for educational and entertainment purposes only.
          </p>
        </div>
      </RetroCard>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <RetroCard variant="secondary" className="p-6">
          <h2 className="text-2xl font-bold text-gradient mb-4">
            Features
          </h2>
          <ul className="space-y-4 text-retro-paper/80">
            <li className="flex items-center gap-3">
              <span className="text-accent-pink">♪</span>
              Complete lyrics archive
            </li>
            <li className="flex items-center gap-3">
              <span className="text-accent-blue">♪</span>
              Album information and artwork
            </li>
            <li className="flex items-center gap-3">
              <span className="text-accent-yellow">♪</span>
              Search functionality
            </li>
            <li className="flex items-center gap-3">
              <span className="text-accent-green">♪</span>
              Community discussions
            </li>
          </ul>
        </RetroCard>

        <RetroCard variant="secondary" className="p-6">
          <h2 className="text-2xl font-bold text-gradient mb-4">
            Community
          </h2>
          <div className="space-y-4 text-retro-paper/80">
            <p>
              Join our growing community of WookieFoot enthusiasts. Share your
              interpretations, discover new meanings, and connect with other fans.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-retro"
              >
                Follow on Spotify
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-retro"
              >
                YouTube Channel
              </a>
            </div>
          </div>
        </RetroCard>
      </div>

      {/* Contact Section */}
      <RetroCard variant="primary" className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-4">
          Get in Touch
        </h2>
        <p className="text-retro-paper/80 max-w-2xl mx-auto mb-6">
          Have suggestions, corrections, or want to contribute? We'd love to hear
          from you! This is a community project, and your input helps make it better.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/search" className="btn-retro">
            Search Lyrics
          </Link>
          <Link href="/albums" className="btn-retro">
            Browse Albums
          </Link>
        </div>
      </RetroCard>

      {/* Disclaimer */}
      <RetroCard variant="secondary" className="p-6">
        <div className="text-sm text-retro-paper/60 text-center">
          <p>
            WookieFoot Lyrics is a fan-made website and is not affiliated with
            WookieFoot or any record label. All lyrics and content are property
            of their respective owners.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} WookieFoot Lyrics. Created with love by fans.
          </p>
        </div>
      </RetroCard>
    </div>
  );
}