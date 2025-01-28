import Link from 'next/link';
import { RetroCard } from '@/components/ui/RetroCard';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <RetroCard variant="primary" className="max-w-2xl w-full p-8 text-center">
        <div className="space-y-6">
          {/* Retro-style error code */}
          <div className="text-8xl font-bold text-gradient animate-float-slow">
            404
          </div>

          {/* Cassette tape illustration */}
          <div className="relative w-48 h-24 mx-auto my-8">
            <div className="absolute inset-0 bg-navy-800/80 rounded-lg border-2 border-accent-blue/20">
              <div className="absolute inset-x-8 top-4 h-16 border-2 border-accent-blue/30 rounded">
                <div className="absolute inset-4 flex justify-center items-center">
                  <div className="w-8 h-8 rounded-full border-2 border-accent-blue/20 animate-spin-slow" />
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          <h1 className="text-2xl font-bold text-retro-paper">
            Oops! The groove seems to have skipped...
          </h1>
          
          <p className="text-retro-paper/80 max-w-md mx-auto">
            We couldn't find the track you're looking for. It might have been moved, deleted, or never existed in the first place.
          </p>

          {/* Navigation options */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link href="/" className="btn-retro">
              Return Home
            </Link>
            <Link href="/albums" className="btn-retro">
              Browse Albums
            </Link>
          </div>

          {/* Decorative music notes */}
          <div className="absolute left-12 top-1/3 text-accent-pink/20 text-6xl animate-float-slow hidden lg:block">
            ♪
          </div>
          <div className="absolute right-12 bottom-1/3 text-accent-blue/20 text-4xl animate-float-medium hidden lg:block">
            ♫
          </div>
        </div>
      </RetroCard>
    </div>
  );
}