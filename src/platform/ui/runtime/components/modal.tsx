import { Modal, type ModalProps } from '../primitives/modal';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiModalProps = UiStyledProps<ModalProps>;
export const UiModal = createUiStyledComponent<ModalProps, HTMLDivElement>(Modal, 'UiModal');
