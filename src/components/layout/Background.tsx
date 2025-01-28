'use client';

import React from 'react';

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-5" />
      
      {/* Left speaker */}
      <div className="absolute left-4 top-1/4 w-32 h-48 hidden lg:block">
        <div className="relative w-full h-full bg-navy-800/50 rounded-lg border-2 border-accent-blue/20">
          <div className="absolute inset-4 rounded-full border-2 border-accent-blue/30" />
          <div className="absolute inset-8 rounded-full border-2 border-accent-blue/20" />
          <div className="absolute inset-12 rounded-full bg-navy-900/50" />
        </div>
      </div>

      {/* Right speaker */}
      <div className="absolute right-4 top-1/4 w-32 h-48 hidden lg:block">
        <div className="relative w-full h-full bg-navy-800/50 rounded-lg border-2 border-accent-blue/20">
          <div className="absolute inset-4 rounded-full border-2 border-accent-blue/30" />
          <div className="absolute inset-8 rounded-full border-2 border-accent-blue/20" />
          <div className="absolute inset-12 rounded-full bg-navy-900/50" />
        </div>
      </div>

      {/* Floating music notes */}
      <div className="absolute left-12 top-1/3 text-accent-pink/20 text-6xl animate-float-slow">♪</div>
      <div className="absolute right-12 top-2/3 text-accent-blue/20 text-4xl animate-float-medium">♫</div>
      <div className="absolute left-1/4 bottom-1/4 text-accent-yellow/20 text-5xl animate-float-fast">♩</div>

      {/* Pencils */}
      <div className="absolute left-8 bottom-8 w-2 h-32 rotate-45 hidden lg:block">
        <div className="w-full h-full bg-accent-pink/80 rounded-t-lg" />
        <div className="w-full h-8 bg-retro-paper/90 rounded-b-lg" />
      </div>
      <div className="absolute right-8 bottom-8 w-2 h-32 -rotate-45 hidden lg:block">
        <div className="w-full h-full bg-accent-blue/80 rounded-t-lg" />
        <div className="w-full h-8 bg-retro-paper/90 rounded-b-lg" />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-navy-900/50" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy-900/30" />
    </div>
  );
}