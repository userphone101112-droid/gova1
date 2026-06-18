import { Card, type CardProps } from '../primitives/card';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiCardProps = UiStyledProps<CardProps>;
export const UiCard = createUiStyledComponent<CardProps, HTMLDivElement>(Card, 'UiCard');
