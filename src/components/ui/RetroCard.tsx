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
  const baseStyles = 'relative rounded-lg p-4 backdrop-blur-sm';
  const variantStyles = {
    default: 'bg-navy-800/80 border-2 border-blue-300/20',
    primary: 'bg-navy-900/90 border-2 border-pink-400/30',
    secondary: 'bg-navy-700/70 border-2 border-blue-400/20'
  };

  return (
    <div className={`
      ${baseStyles}
      ${variantStyles[variant]}
      ${className}
      before:absolute before:inset-0 before:rounded-lg before:border-2
      before:border-white/5 before:content-[''] before:-z-10
      after:absolute after:inset-0 after:rounded-lg after:border-2
      after:border-white/10 after:content-[''] after:translate-x-1 after:translate-y-1 after:-z-10
      relative
    `}>
      {children}
    </div>
  );
}