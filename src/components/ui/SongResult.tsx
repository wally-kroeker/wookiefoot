import Link from 'next/link';

interface SongResultProps {
  title: string;
  album: string;
  slug: string;
  snippet?: string;
  score?: number;
}

export default function SongResult({ title, album, slug, snippet }: SongResultProps) {
  return (
    <div className="border-b border-border-subtle py-4">
      <Link href={`/lyrics/${slug}`} className="block group">
        <h3 className="font-display text-accent-primary text-lg group-hover:text-accent-secondary transition-colors duration-200">
          {title}
        </h3>
        <p className="text-text-secondary text-sm mt-1">
          {album}
        </p>
        {snippet && (
          <p
            className="text-text-muted text-sm mt-2 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: snippet }}
          />
        )}
      </Link>
    </div>
  );
}
