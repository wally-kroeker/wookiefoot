import { RetroCard } from '@/components/ui/RetroCard';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <RetroCard variant="primary" className="max-w-lg w-full p-8">
        <div className="space-y-8 text-center">
          {/* Vinyl record loading animation */}
          <div className="relative w-48 h-48 mx-auto">
            <div className="absolute inset-0 rounded-full bg-navy-800/80 border-2 border-accent-blue/20 animate-spin-slow">
              {/* Record grooves */}
              <div className="absolute inset-4 rounded-full border border-accent-blue/10" />
              <div className="absolute inset-8 rounded-full border border-accent-blue/10" />
              <div className="absolute inset-12 rounded-full border border-accent-blue/10" />
              <div className="absolute inset-16 rounded-full border border-accent-blue/10" />
              
              {/* Center hole */}
              <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-navy-900 border-2 border-accent-blue/20">
                <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-accent-blue/20" />
              </div>
            </div>
          </div>

          {/* Loading text */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-retro-paper animate-pulse">
              Loading...
            </h2>
            <p className="text-retro-paper/60">
              Dropping the needle on your request
            </p>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 w-64 mx-auto bg-navy-800/50 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-pink via-accent-blue to-accent-pink animate-gradient" />
          </div>

          {/* Decorative elements */}
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