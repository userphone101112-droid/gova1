import { Badge, type BadgeProps } from '../primitives/badge';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiBadgeProps = UiStyledProps<BadgeProps>;
export const UiBadge = createUiStyledComponent<BadgeProps, HTMLSpanElement>(Badge, 'UiBadge');
