import { Input, type InputProps } from '../primitives/input';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiInputProps = UiStyledProps<InputProps>;
export const UiInput = createUiStyledComponent<InputProps, HTMLInputElement>(Input, 'UiInput');
