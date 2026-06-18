import { Switch, type SwitchProps } from '../primitives/switch';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiSwitchProps = UiStyledProps<SwitchProps>;
export const UiSwitch = createUiStyledComponent<SwitchProps, HTMLInputElement>(Switch, 'UiSwitch');
