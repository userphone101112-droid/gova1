/**
 * Public UI Component API
 * 
 * This is the ONLY public API for UI components in the project.
 * All interactive elements MUST use these identified components with registry-based identifiers.
 * 
 * Direct usage of base UI components (Button, Input, Select, etc.) is FORBIDDEN.
 * Direct usage of native HTML elements (button, input, select, etc.) is FORBIDDEN.
 * 
 * To add a new UI element:
 * 1. Add the identifier to src/shared/ui-registry.ts
 * 2. Import the appropriate component from this file
 * 3. Use the registry constant for the ui prop
 * 
 * @example
 * import { UiButton } from '@/components/ui';
 * import { HOME } from '@/shared/ui-registry';
 * 
 * <UiButton ui={HOME.HERO.CTA.PRIMARY_BUTTON}>{{t("common.click-me")}}</UiButton>
 */

export { UiButton } from './ui-identified/button';
export type { UiButtonProps } from './ui-identified/button';

export { UiInput } from './ui-identified/input';
export type { UiInputProps } from './ui-identified/input';

export { UiSelect } from './ui-identified/select';
export type { UiSelectProps } from './ui-identified/select';

export { UiTextarea } from './ui-identified/textarea';
export type { UiTextareaProps } from './ui-identified/textarea';

export { UiCheckbox } from './ui-identified/checkbox';
export type { UiCheckboxProps } from './ui-identified/checkbox';

export { UiRadio } from './ui-identified/radio';
export type { UiRadioProps } from './ui-identified/radio';

export { UiSwitch } from './ui-identified/switch';
export type { UiSwitchProps } from './ui-identified/switch';

export { UiLink } from './ui-identified/link';
export type { UiLinkProps } from './ui-identified/link';

export { UiLabel } from './ui-identified/label';
export type { UiLabelProps } from './ui-identified/label';

export { UiHeader } from './ui-identified/header';
export type { UiHeaderProps } from './ui-identified/header';

export { UiImage } from './ui-identified/image';
export type { UiImageProps } from './ui-identified/image';
