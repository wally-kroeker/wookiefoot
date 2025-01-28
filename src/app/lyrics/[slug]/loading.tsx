import React from 'react';

export default function LoadingPage(): React.ReactElement {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Navigation */}
      <div className="h-4 w-24 bg-gray-200 rounded"></div>

      {/* Header */}
      <div className="space-y-4">
        <div>
          <div className="h-10 w-3/4 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
        </div>

        {/* Media Links */}
        <div className="flex space-x-4">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Lyrics Content */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 rounded"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          ></div>
        ))}
      </div>

      {/* Tags */}
      <div className="pt-6">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-6 w-20 bg-gray-200 rounded-full"
            ></div>
          ))}
        </div>
      </div>

      {/* Contributors */}
      <div className="pt-6 border-t border-gray-200">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="flex flex-wrap gap-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-6 w-24 bg-gray-200 rounded-full"
            ></div>
          ))}
        </div>
      </div>

      {/* Discussion Section */}
      <div className="pt-8 border-t border-gray-200">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="h-20 w-full bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}