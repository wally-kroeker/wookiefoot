import { RetroCard } from '@/components/ui/RetroCard';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <RetroCard variant="primary" className="max-w-lg w-full p-8">
        <div className="space-y-8 text-center">
          {/* Square loading animation */}
          <div className="relative w-48 h-48 mx-auto">
            <RetroCard variant="secondary" className="relative aspect-square">
              <div className="absolute inset-0 bg-navy-800/80 border-2 border-accent-blue/20 animate-pulse">
                {/* Decorative grid lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="border border-accent-blue/10"
                    />
                  ))}
                </div>
                
                {/* Center icon */}
                <div className="absolute inset-0 m-auto w-12 h-12 flex items-center justify-center">
                  <div className="text-accent-blue/40 text-3xl animate-bounce">
                    ♪
                  </div>
                </div>
              </div>
            </RetroCard>
          </div>

          {/* Loading text */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-retro-paper animate-pulse">
              Loading...
            </h2>
            <p className="text-retro-paper/60">
              Preparing your musical journey
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