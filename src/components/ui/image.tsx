import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ImageProps extends React.ComponentProps<typeof Image> {
  className?: string;
}

const CustomImage = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, ...props }, ref) => {
    return (
      <Image
        ref={ref}
        className={cn('object-cover', className)}
        {...props}
      />
    );
  }
);
CustomImage.displayName = 'CustomImage';

export { CustomImage as Image };
