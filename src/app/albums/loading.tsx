export default function AlbumsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-10 w-48 bg-bg-secondary rounded animate-pulse" />
        <div className="h-5 w-72 bg-bg-secondary rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-bg-card rounded-xl border border-border-subtle p-4 space-y-3">
            <div className="aspect-square bg-bg-secondary rounded-lg animate-pulse" />
            <div className="h-5 w-3/4 bg-bg-secondary rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-bg-secondary rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
