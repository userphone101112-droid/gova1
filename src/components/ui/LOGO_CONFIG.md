# Logo Configuration Guide

## Optimized Variants

All logo files are stored in `public/images/logos/` with the following variants:

| File | Size | Use Case |
|------|------|----------|
| `logo-icon.png` | 64×64 | Favicon, small badges |
| `logo-sm.webp`/`.png` | 400×219 | Navigation bar, mobile header |
| `logo-md.webp`/`.png` | 600×328 | Default/recommended size |
| `logo-full.webp`/`.png` | 1200×656 | Hero sections, banners |
| `logo-original.png` | 1408×768 | Original quality (archived) |

## File Size Comparison

| Format | Original | Optimized | Reduction |
|--------|----------|-----------|-----------|
| PNG (original) | 1,837.63 KB | 1,110.50 KB | 39% |
| **WebP (full)** | — | **82.66 KB** | **95%** |
| **WebP (small)** | — | **33.35 KB** | **98%** |

## Usage

### React Component

```tsx
import { Logo } from '@/components/ui/logo';

// Small size (navbar)
<Logo size="sm" />

// Medium (recommended default)
<Logo size="md" />

// Large (hero section)
<Logo size="lg" />

// Icon
<Logo size="icon" />
```

### Direct Image Usage

```html
<!-- WebP with PNG fallback -->
<picture>
  <source srcSet="/images/logos/logo-md.webp" type="image/webp" />
  <img src="/images/logos/logo-md.png" alt="GOVA Logo" width="600" height="328" />
</picture>
```

### Next.js Image Component

```tsx
import Image from 'next/image';

<Image
  src="/images/logos/logo-md.webp"
  alt="GOVA Logo"
  width={600}
  height={328}
  priority={false}
/>
```

## Best Practices

- **Use WebP** by default (95% smaller) with PNG fallback
- **Use appropriate sizes**: sm for navbars, md for general use, lg for heroes
- **Set `priority={true}`** for logo in main layout (LCP optimization)
- **Preload** the logo in layout meta tags if needed:
  ```html
  <link rel="preload" href="/images/logos/logo-md.webp" as="image" />
  ```

## Configuration Notes

- All PNGs are optimized with palette reduction and compression
- WebP quality set to 85 (optimal balance between quality and size)
- RGBA mode preserved for transparency
- Responsive sizing handled via CSS (max-width: 100%, height: auto)
