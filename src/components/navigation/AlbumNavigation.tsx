import Link from 'next/link';

interface NavLink {
  title: string;
  slug: string;
}

interface AlbumNavigationProps {
  previous?: NavLink;
  next?: NavLink;
  albumId: string;
  albumTitle: string;
}

export default function AlbumNavigation({ previous, next, albumId, albumTitle }: AlbumNavigationProps) {
  return (
    <nav className="mt-12 pt-8 border-t border-border-subtle">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {previous ? (
            <Link
              href={`/lyrics/${previous.slug}`}
              className="group flex items-center gap-2 text-accent-primary hover:text-accent-secondary transition-colors duration-200"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="max-w-[120px] sm:max-w-[200px] truncate text-sm font-body">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </div>

        <Link
          href={`/albums/${albumId}`}
          className="flex-shrink-0 px-4 py-2 rounded-lg border border-border-subtle text-text-secondary text-sm font-body hover:border-border-accent hover:text-accent-primary transition-all duration-200"
        >
          Back to {albumTitle}
        </Link>

        <div className="flex-1 min-w-0 text-right">
          {next ? (
            <Link
              href={`/lyrics/${next.slug}`}
              className="group inline-flex items-center gap-2 text-accent-primary hover:text-accent-secondary transition-colors duration-200"
            >
              <span className="max-w-[120px] sm:max-w-[200px] truncate text-sm font-body">{next.title}</span>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </nav>
  );
}
