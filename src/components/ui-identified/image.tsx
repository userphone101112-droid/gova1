import React from 'react';
import { Image, ImageProps } from '@/components/ui/image';
import { type UiParam, resolveUiParam, validateRuntimeIdentity } from '@/shared/ui-registry';

export interface UiImageProps extends Omit<ImageProps, 'data-ui'> {
  ui: UiParam;
}

const UiImage = React.forwardRef<HTMLImageElement, UiImageProps>(
  ({ ui, ...props }, ref) => {
    const identity = resolveUiParam(ui);
    validateRuntimeIdentity('UiImage', ui, identity);

    return (
      <Image
        ref={ref}
        data-ui-id={identity?.id}
        data-ui-path={identity?.path}
        data-ui-feature={identity?.feature}
        data-ui-component="UiImage"
        {...props}
      />
    );
  }
);
UiImage.displayName = 'UiImage';

export { UiImage };
