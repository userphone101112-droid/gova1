import { Textarea, type TextareaProps } from '../primitives/textarea';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiTextareaProps = UiStyledProps<TextareaProps>;
export const UiTextarea = createUiStyledComponent<TextareaProps, HTMLTextAreaElement>(
  Textarea,
  'UiTextarea'
);
