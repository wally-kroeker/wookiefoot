import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="text-6xl font-display text-accent-secondary">404</div>
        <h1 className="text-2xl font-display text-text-primary">
          Page Not Found
        </h1>
        <p className="text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link href="/" className="btn-primary">
            Return Home
          </Link>
          <Link href="/albums" className="btn-secondary">
            Browse Albums
          </Link>
        </div>
      </div>
    </div>
  );
}
