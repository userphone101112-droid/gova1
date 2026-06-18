import { Button, type ButtonProps } from '../primitives/button';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiButtonProps = UiStyledProps<ButtonProps>;
export const UiButton = createUiStyledComponent<ButtonProps, HTMLButtonElement>(Button, 'UiButton');
