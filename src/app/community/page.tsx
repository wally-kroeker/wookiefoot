import type { Metadata } from 'next';
import WFCard from '@/components/ui/WFCard';

export const metadata: Metadata = {
  title: 'Community',
  description:
    'Connect with the WookieFoot community — YouTube, Shangri-La Festival, Be The Change, and more.',
};

export default function CommunityPage() {
  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Hero */}
      <section className="text-center py-8">
        <h1 className="font-display text-4xl text-text-primary">
          Join the Community
        </h1>
        <p className="font-lyrics italic text-lg text-text-secondary mt-3 max-w-xl mx-auto">
          WookieFoot is more than a band &mdash; it&apos;s a movement
        </p>
      </section>

      {/* YouTube */}
      <WFCard variant="elevated">
        <h2 className="font-display text-2xl text-accent-primary">
          WookieFoot on YouTube
        </h2>
        <p className="text-text-secondary font-body mt-3 leading-relaxed">
          The official WookieFoot YouTube channel features live performances,
          music videos, festival highlights, and behind-the-scenes moments.
          Subscribe to stay up to date with new releases and tour footage.
        </p>
        <a
          href="https://www.youtube.com/@wookiefootmark"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-block mt-4"
        >
          Visit YouTube Channel
        </a>
      </WFCard>

      {/* Shangri-La Festival */}
      <WFCard variant="elevated">
        <h2 className="font-display text-2xl text-accent-primary">
          Shangri-La Music Festival
        </h2>
        <p className="text-text-secondary font-body mt-3 leading-relaxed">
          An annual gathering of music, art, and community. Labor Day Weekend,
          Minnesota. A place where everyone belongs.
        </p>
        <a
          href="https://www.shangrilafest.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-block mt-4"
        >
          Visit Shangri-La
        </a>
      </WFCard>

      {/* Be The Change */}
      <WFCard variant="accent">
        <h2 className="font-display text-2xl text-accent-primary">
          Be The Change Charities
        </h2>
        <p className="text-text-secondary font-body mt-3 leading-relaxed">
          WookieFoot&apos;s 501(c)(3) nonprofit has donated over $500,000 to
          communities and causes worldwide. Music as a force for good.
        </p>
        <a
          href="https://www.bethechangecharities.org"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-block mt-4"
        >
          Visit Be The Change
        </a>
      </WFCard>

      {/* More Links */}
      <section>
        <h2 className="font-display text-xl text-text-primary text-center mb-4">
          More Links
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <WFCard>
            <h3 className="font-display text-accent-primary">Facebook</h3>
            <a
              href="https://www.facebook.com/wookiefoot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary text-sm font-body hover:underline mt-2 inline-block"
            >
              Visit &rarr;
            </a>
          </WFCard>

          <WFCard>
            <h3 className="font-display text-accent-primary">Bandcamp</h3>
            <a
              href="https://wookiefoot.bandcamp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary text-sm font-body hover:underline mt-2 inline-block"
            >
              Visit &rarr;
            </a>
          </WFCard>

          <WFCard>
            <h3 className="font-display text-accent-primary">Instagram</h3>
            <a
              href="https://www.instagram.com/wookiefoot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary text-sm font-body hover:underline mt-2 inline-block"
            >
              Visit &rarr;
            </a>
          </WFCard>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="text-center py-6 border-t border-border-subtle">
        <p className="text-text-muted text-sm font-body">
          This is a fan-made site. Not officially affiliated with WookieFoot.
        </p>
      </section>
    </div>
  );
}
