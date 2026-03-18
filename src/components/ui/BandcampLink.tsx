interface BandcampLinkProps {
  albumTitle: string;
  className?: string;
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[''\"\.!?]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const SPECIAL_SLUGS: Record<string, string> = {
  'ready or not...': 'ready-or-not',
};

export default function BandcampLink({ albumTitle, className = '' }: BandcampLinkProps) {
  const normalizedTitle = albumTitle.toLowerCase().trim();
  const slug = SPECIAL_SLUGS[normalizedTitle] ?? toSlug(albumTitle);
  const url = `https://wookiefoot.bandcamp.com/album/${slug}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle bg-bg-card text-text-primary font-body text-sm hover:border-border-accent hover:shadow-card-hover transition-all duration-200 ${className}`}
    >
      Listen on Bandcamp &#8599;
    </a>
  );
}
