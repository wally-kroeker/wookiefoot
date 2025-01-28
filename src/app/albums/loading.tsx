import { RetroCard } from '@/components/ui/RetroCard';

export default function AlbumsLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <RetroCard variant="primary" className="p-6">
        <div className="h-8 w-64 bg-navy-700/50 rounded-lg mx-auto animate-pulse" />
        <div className="h-4 w-96 bg-navy-700/50 rounded-lg mx-auto mt-4 animate-pulse" />
      </RetroCard>

      {/* Albums grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <RetroCard key={i} variant="secondary" className="p-6">
            <div className="space-y-6">
              {/* Album artwork skeleton */}
              <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0 rounded-full bg-navy-700/50 animate-pulse">
                  <div className="absolute inset-4 rounded-full border border-navy-600/20" />
                  <div className="absolute inset-8 rounded-full border border-navy-600/20" />
                  <div className="absolute inset-12 rounded-full border border-navy-600/20" />
                </div>
              </div>

              {/* Album info skeleton */}
              <div className="text-center space-y-3">
                <div className="h-6 w-32 bg-navy-700/50 rounded-lg mx-auto animate-pulse" />
                <div className="h-4 w-24 bg-navy-700/50 rounded-lg mx-auto animate-pulse" />
                <div className="h-4 w-48 bg-navy-700/50 rounded-lg mx-auto animate-pulse" />
              </div>

              {/* Button skeletons */}
              <div className="flex justify-center space-x-4">
                <div className="h-10 w-24 bg-navy-700/50 rounded-lg animate-pulse" />
                <div className="h-10 w-24 bg-navy-700/50 rounded-lg animate-pulse" />
              </div>
            </div>
          </RetroCard>
        ))}
      </div>

      {/* Featured album skeleton */}
      <RetroCard variant="primary" className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-64 h-64 rounded-full bg-navy-700/50 animate-pulse">
            <div className="absolute inset-4 rounded-full border border-navy-600/20" />
            <div className="absolute inset-8 rounded-full border border-navy-600/20" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-8 w-48 bg-navy-700/50 rounded-lg animate-pulse" />
            <div className="h-4 w-full bg-navy-700/50 rounded-lg animate-pulse" />
            <div className="h-4 w-3/4 bg-navy-700/50 rounded-lg animate-pulse" />
            <div className="h-10 w-32 bg-navy-700/50 rounded-lg animate-pulse" />
          </div>
        </div>
      </RetroCard>
    </div>
  );
}