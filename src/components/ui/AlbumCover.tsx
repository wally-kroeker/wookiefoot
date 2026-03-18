import Image from 'next/image';

interface AlbumCoverProps {
  albumTitle: string;
  src: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { dimension: 80, className: 'w-20 h-20' },
  md: { dimension: 160, className: 'w-40 h-40' },
  lg: { dimension: 320, className: 'w-80 h-80' },
};

export function AlbumCover({ albumTitle, src, alt, size = 'md' }: AlbumCoverProps) {
  const { dimension, className } = sizeMap[size];

  return (
    <div className={`${className} aspect-square rounded-lg overflow-hidden flex-shrink-0`}>
      <Image
        src={src}
        alt={alt ?? albumTitle}
        width={dimension}
        height={dimension}
        className="object-cover w-full h-full"
      />
    </div>
  );
}
