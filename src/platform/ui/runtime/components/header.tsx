import { Header, type HeaderProps } from '../primitives/header';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiHeaderProps = UiStyledProps<HeaderProps>;
export const UiHeader = createUiStyledComponent<HeaderProps, HTMLHeadingElement>(Header, 'UiHeader');
