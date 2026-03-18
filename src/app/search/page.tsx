import { Suspense } from 'react';
import SearchContent from './SearchContent';

function SearchFallback() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-8">
        <div className="h-10 w-40 bg-bg-secondary rounded-lg" />
        <div className="h-14 w-full bg-bg-secondary rounded-xl" />
        <div className="space-y-4 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-b border-border-subtle py-4">
              <div className="h-5 w-2/3 bg-bg-secondary rounded" />
              <div className="h-4 w-1/3 bg-bg-secondary rounded mt-2" />
              <div className="h-4 w-full bg-bg-secondary rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}
