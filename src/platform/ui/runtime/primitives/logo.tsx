import Image from 'next/image';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'icon';
  alt?: string;
  priority?: boolean;
  className?: string;
}

const logoDimensions = {
  sm: { width: 400, height: 219 },
  md: { width: 600, height: 328 },
  lg: { width: 1200, height: 656 },
  icon: { width: 64, height: 64 },
};

export function Logo({
  size = 'md',
  alt = 'GOVA Logo',
  priority = false,
  className = '',
}: LogoProps) {
  const dims = logoDimensions[size];
  const imagePath = `/images/logos/logo-${size === 'lg' ? 'full' : size}.webp`;
  const fallbackPath = `/images/logos/logo-${size === 'lg' ? 'full' : size}.png`;

  return (
    <picture>
      <source srcSet={imagePath} type="image/webp" />
      <Image
        src={fallbackPath}
        alt={alt}
        width={dims.width}
        height={dims.height}
        priority={priority}
        quality={85}
        className={className}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </picture>
  );
}

export default Logo;
