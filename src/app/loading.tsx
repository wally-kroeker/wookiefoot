export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="text-accent-secondary text-4xl animate-pulse">♪</div>
        <h2 className="text-2xl font-display text-text-primary">Loading...</h2>
        <p className="text-text-muted">Preparing your musical journey</p>
        <div className="h-1 w-48 mx-auto bg-bg-secondary rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-accent-primary rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
