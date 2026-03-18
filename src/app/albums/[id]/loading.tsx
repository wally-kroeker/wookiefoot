import WFCard from '@/components/ui/WFCard';

export default function AlbumLoading() {
  return (
    <div className="space-y-8">
      {/* Back link skeleton */}
      <div className="h-5 w-32 bg-bg-secondary rounded animate-pulse" />

      {/* Album Header Skeleton */}
      <WFCard variant="elevated">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Album artwork skeleton */}
          <div className="w-80 h-80 bg-bg-secondary rounded-lg animate-pulse flex-shrink-0" />

          {/* Album info skeleton */}
          <div className="flex-1 space-y-4 text-center md:text-left w-full">
            <div className="h-9 w-64 bg-bg-secondary rounded animate-pulse mx-auto md:mx-0" />
            <div className="h-6 w-24 bg-bg-secondary rounded animate-pulse mx-auto md:mx-0" />
            <div className="h-5 w-20 bg-bg-secondary rounded animate-pulse mx-auto md:mx-0" />
            <div className="h-10 w-44 bg-bg-secondary rounded-lg animate-pulse mx-auto md:mx-0" />
          </div>
        </div>
      </WFCard>

      {/* Track List Skeleton */}
      <WFCard>
        <div className="h-8 w-24 bg-bg-secondary rounded animate-pulse mb-4" />
        <div className="divide-y divide-border-subtle">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center py-3">
              <div className="w-8 h-5 bg-bg-secondary rounded animate-pulse flex-shrink-0" />
              <div className="h-5 w-48 bg-bg-secondary rounded animate-pulse ml-2" />
              <div className="h-4 w-12 bg-bg-secondary rounded animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      </WFCard>
    </div>
  );
}
