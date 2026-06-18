import { Label, type LabelProps } from '../primitives/label';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiLabelProps = UiStyledProps<LabelProps>;
export const UiLabel = createUiStyledComponent<LabelProps, HTMLLabelElement>(Label, 'UiLabel');
