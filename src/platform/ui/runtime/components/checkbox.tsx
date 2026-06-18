import { Checkbox, type CheckboxProps } from '../primitives/checkbox';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiCheckboxProps = UiStyledProps<CheckboxProps>;
export const UiCheckbox = createUiStyledComponent<CheckboxProps, HTMLInputElement>(
  Checkbox,
  'UiCheckbox'
);
