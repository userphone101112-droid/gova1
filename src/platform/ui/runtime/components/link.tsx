import { Link, type LinkProps } from '../primitives/link';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiLinkProps = UiStyledProps<LinkProps>;
export const UiLink = createUiStyledComponent<LinkProps, HTMLAnchorElement>(Link, 'UiLink');
