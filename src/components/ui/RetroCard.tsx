'use client';

import React from 'react';

interface RetroCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

export function RetroCard({ 
  children, 
  className = '',
  variant = 'default'
}: RetroCardProps) {
  const baseStyles = 'relative rounded-lg p-4 backdrop-blur-md transition-all duration-300';
  
  const variantStyles = {
    default: 'bg-black/40 border border-accent-green/20',
    primary: 'bg-black/50 border border-accent-green/30',
    secondary: 'bg-black/30 border border-accent-teal/20'
  };

  const gradientBorders = {
    default: 'before:bg-gradient-green-orange before:opacity-20',
    primary: 'before:bg-gradient-earth before:opacity-25',
    secondary: 'before:bg-gradient-teal-brown before:opacity-20'
  };

  return (
    <div className={`
      ${baseStyles}
      ${variantStyles[variant]}
      ${className}
      group
      hover:border-accent-green/40 hover:scale-[1.01]
      hover:shadow-lg hover:shadow-accent-green/10
    `}>
      {children}
    </div>
  );
}