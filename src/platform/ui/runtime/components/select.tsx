import { Select, type SelectProps } from '../primitives/select';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiSelectProps = UiStyledProps<SelectProps>;
export const UiSelect = createUiStyledComponent<SelectProps, HTMLSelectElement>(Select, 'UiSelect');
