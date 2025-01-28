import { ReactNode, ElementType } from 'react';
import clsx from 'clsx';

interface TypographyProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'lyrics' | 'album-title' | 'song-title';
  className?: string;
}

export function Typography({ 
  children, 
  variant = 'lyrics',
  className 
}: TypographyProps) {
  let Component: ElementType = 'div';
  
  if (variant === 'h1') Component = 'h1';
  else if (variant === 'h2') Component = 'h2';
  else if (variant === 'h3') Component = 'h3';
  
  return (
    <Component
      className={clsx(
        'prose max-w-none',
        {
          'lyrics': variant === 'lyrics',
          'album-title': variant === 'album-title',
          'song-title': variant === 'song-title',
        },
        className
      )}
    >
      {children}
    </Component>
  );
}

// Usage example:
// <Typography variant="lyrics">
//   Song lyrics content here...
// </Typography>
//
// <Typography variant="album-title">
//   Album Title
// </Typography>
//
// <Typography variant="song-title">
//   Song Title
// </Typography>
