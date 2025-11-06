'use client';

import React from 'react';

interface BackgroundProps {
  backgroundImage?: string;
}

export default function Background({ backgroundImage }: BackgroundProps) {
  // Use the high-res background image if available, otherwise use default
  const bgImage = backgroundImage || '/assets/backgrounds/you-re-it.jpg';
  
  return (
    <>
      {/* Fixed high-resolution background with parallax effect */}
      <div 
        className="fixed inset-0 -z-10 bg-black"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Softer overlay for readability */}
      <div className="fixed inset-0 -z-10 bg-black/50" />
      
      {/* Subtle gradient overlay with warmer tones */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-transparent via-black/30 to-black/60" />
      
      {/* Subtle vignette effect */}
      <div className="fixed inset-0 -z-10 bg-gradient-radial from-transparent via-transparent to-black/40" />
    </>
  );
}