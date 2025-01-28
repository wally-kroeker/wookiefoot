import React from 'react';

export function ControlDots({ className = '' }: { className?: string }) {
  return (
    <svg
      width="60"
      height="20"
      viewBox="0 0 60 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="10" cy="10" r="6" fill="#FF6B6B" />
      <circle cx="30" cy="10" r="6" fill="#FFD93D" />
      <circle cx="50" cy="10" r="6" fill="#6BCB77" />
    </svg>
  );
}