import styles from './AlbumCard.module.css';

interface AlbumCardProps {
  title: string;
  year: number;
  imagePath: string;
  thumbnailPath: string;
}

export default function AlbumCard({
  title,
  year,
  imagePath,
  thumbnailPath
}: AlbumCardProps) {
  return (
    <div className={styles['album-card']}>
      <div className={styles['album-image']}>
        <img
          src={imagePath}
          alt={`${title} album cover`}
          srcSet={`${thumbnailPath} 300w, ${imagePath} 1200w`}
          sizes="(max-width: 600px) 300px, 1200px"
        />
      </div>
      <div className={styles['album-info']}>
        <h3>{title}</h3>
        <p>{year}</p>
      </div>
    </div>
  );
}