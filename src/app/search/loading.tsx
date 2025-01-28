import React from 'react';

export default function LoadingPage(): React.ReactElement {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="h-5 w-48 bg-gray-200 rounded"></div>
      </div>

      {/* Search Results */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="py-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="space-y-3 flex-1">
                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="flex space-x-4">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="h-5 w-5 bg-gray-200 rounded ml-4"></div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="h-5 w-16 bg-gray-200 rounded-full"
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}