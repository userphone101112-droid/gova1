import { Image, type ImageProps } from '../primitives/image';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiImageProps = UiStyledProps<ImageProps>;
export const UiImage = createUiStyledComponent<ImageProps, HTMLImageElement>(Image, 'UiImage');
