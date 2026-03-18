import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      <h1 className="font-display text-3xl text-text-primary mb-4">Song Not Found</h1>
      <p className="text-text-secondary font-body mb-8">
        The lyrics you&apos;re looking for don&apos;t exist.
      </p>
      <Link href="/lyrics" className="btn-primary">
        Browse All Lyrics
      </Link>
    </div>
  );
}
