import { RetroCard } from '@/components/ui/RetroCard';

export default function AlbumLoading() {
  return (
    <div className="space-y-8">
      {/* Album Header Skeleton */}
      <RetroCard variant="primary" className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Album artwork skeleton */}
          <div className="w-72">
            <RetroCard variant="secondary" className="relative aspect-square">
              <div className="w-full h-full bg-navy-700/50 rounded-lg animate-pulse" />
            </RetroCard>
          </div>

          {/* Album info skeleton */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              <div className="h-10 w-64 bg-navy-700/50 rounded-lg animate-pulse" />
              <div className="h-6 w-48 bg-navy-700/50 rounded-lg animate-pulse mt-2" />
            </div>
            <div className="h-20 w-full bg-navy-700/50 rounded-lg animate-pulse" />
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="h-10 w-32 bg-navy-700/50 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-navy-700/50 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </RetroCard>

      {/* Track List Skeleton */}
      <RetroCard variant="secondary" className="p-6">
        <div className="h-8 w-32 bg-navy-700/50 rounded-lg animate-pulse mb-6" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <RetroCard key={i} variant="default" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-6 bg-navy-700/50 rounded animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-6 w-48 bg-navy-700/50 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-navy-700/50 rounded animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="h-4 w-16 bg-navy-700/50 rounded animate-pulse" />
                  <div className="flex space-x-3">
                    <div className="h-5 w-5 bg-navy-700/50 rounded animate-pulse" />
                    <div className="h-5 w-5 bg-navy-700/50 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </RetroCard>
          ))}
        </div>
      </RetroCard>

      {/* Navigation Skeleton */}
      <RetroCard variant="secondary" className="p-6">
        <div className="flex justify-between items-center">
          <div className="h-10 w-32 bg-navy-700/50 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-navy-700/50 rounded-lg animate-pulse" />
        </div>
      </RetroCard>

      {/* Loading indicator */}
      <div className="fixed bottom-8 right-8 text-accent-blue animate-spin">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    </div>
  );
}