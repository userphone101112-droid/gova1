import { Radio, type RadioProps } from '../primitives/radio';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiRadioProps = UiStyledProps<RadioProps>;
export const UiRadio = createUiStyledComponent<RadioProps, HTMLInputElement>(Radio, 'UiRadio');
