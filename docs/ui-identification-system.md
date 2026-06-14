# UI Identification System

## Overview

The UI Identification System is a mandatory, technically-enforced standard across the entire project that ensures every interactive element is uniquely identifiable through a stable `data-ui` attribute. This system serves as the single source of truth for UI element identification, enabling automation, testing, debugging, and AI-assisted modifications.

**This system is technically enforced at compile time - it is impossible to bypass.**

## Purpose

- **Testing**: Enables reliable automated testing by providing stable selectors
- **Debugging**: Makes it easy to identify and inspect specific UI elements
- **Automation**: Supports UI automation and E2E testing
- **AI-Assisted Development**: Provides clear identifiers for AI tools to understand and modify the UI
- **Documentation**: Self-documenting UI structure through meaningful identifiers
- **Type Safety**: Compile-time enforcement prevents invalid identifiers

## Architecture

### Central UI Registry

Located in `src/shared/ui-registry.ts`:
- Contains ALL valid UI identifiers as TypeScript constants
- Exports identifiers using `as const` for maximum type safety
- Auto-validates at module load time for duplicates and naming convention violations
- Serves as the single source of truth for UI identification

### Public UI Component API

Located in `src/components/ui.ts`:
- Exports ONLY the identified components (UiButton, UiInput, etc.)
- This is the ONLY public API for UI components in the project
- Direct imports of base components are blocked by ESLint

### Ui* Wrapper Components

Located in `src/components/ui-identified/`:
- `UiButton` - Button with mandatory `ui` prop (type: UiIdentifier)
- `UiInput` - Input with mandatory `ui` prop (type: UiIdentifier)
- `UiSelect` - Select with mandatory `ui` prop (type: UiIdentifier)
- `UiTextarea` - Textarea with mandatory `ui` prop (type: UiIdentifier)
- `UiCheckbox` - Checkbox with mandatory `ui` prop (type: UiIdentifier)
- `UiRadio` - Radio with mandatory `ui` prop (type: UiIdentifier)
- `UiSwitch` - Switch with mandatory `ui` prop (type: UiIdentifier)
- `UiLink` - Link with mandatory `ui` prop (type: UiIdentifier)

**Important**: The `ui` prop type is restricted to `UiIdentifier` from the registry, preventing arbitrary strings at compile time.

## Usage

### Required Usage

All interactive elements MUST use Ui* components with registry constants:

```tsx
import { UiButton, UiInput, UiSelect } from '@/components/ui';
import { HOME, AUTH, SETTINGS } from '@/shared/ui-registry';

// ✅ Correct - Using registry constants
<UiButton ui={HOME.LANGUAGE_SWITCHER.ENGLISH_BUTTON}>EN</UiButton>
<UiButton ui={AUTH.LOGIN.FORM.SUBMIT_BUTTON}>Login</UiButton>
<UiInput ui={AUTH.LOGIN.FORM.EMAIL_INPUT} type="email" />
<UiSelect ui={SETTINGS.LANGUAGE.SELECTOR.CURRENT_LANGUAGE}>
  <option value="en">English</option>
</UiSelect>
```

### Forbidden Usage

The following are FORBIDDEN and will fail at compile time or lint time:

```tsx
// ❌ Forbidden - Raw strings (TypeScript + ESLint error)
<UiButton ui="auth.login.form.submit-button">Login</UiButton>

// ❌ Forbidden - Native HTML elements (ESLint error)
<button>Submit</button>
<input type="email" />
<select>...</select>
<textarea></textarea>
<a href="/about">About</a>

// ❌ Forbidden - Base UI components (ESLint error)
<Button>Submit</Button>
<Input type="email" />
<Select>...</Select>
<Textarea></Textarea>
<Link href="/about">About</Link>

// ❌ Forbidden - Direct imports of base components (ESLint error)
import { Button } from '@/components/ui/button';
```

## Naming Convention

All UI identifiers in the registry MUST follow the format:

```
page.section.component.element
```

### Regex Pattern

```
^[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$
```

### Examples from Registry

```tsx
// Authentication pages
AUTH.LOGIN.FORM.SUBMIT_BUTTON        // 'auth.login.form.submit-button'
AUTH.LOGIN.FORM.EMAIL_INPUT         // 'auth.login.form.email-input'
AUTH.LOGIN.FORM.PASSWORD_INPUT      // 'auth.login.form.password-input'

// Home page
HOME.LANGUAGE_SWITCHER.ENGLISH_BUTTON   // 'home.language-switcher.english-button'
HOME.LANGUAGE_SWITCHER.ARABIC_BUTTON    // 'home.language-switcher.arabic-button'
HOME.HERO.CTA.PRIMARY_BUTTON           // 'home.hero.cta.primary-button'

// Dashboard pages
DASHBOARD.SIDEBAR.NAVIGATION.USERS_LINK     // 'dashboard.sidebar.navigation.users-link'
DASHBOARD.HEADER.LOGOUT_BUTTON            // 'dashboard.header.logout-button'

// Settings pages
SETTINGS.LANGUAGE.SELECTOR.CURRENT_LANGUAGE              // 'settings.language.selector.current-language'
SETTINGS.NOTIFICATIONS.TOGGLE.EMAIL_NOTIFICATIONS         // 'settings.notifications.toggle.email-notifications'

// Contact page
CONTACT.FORM.SUBMIT_BUTTON        // 'contact.form.submit-button'
CONTACT.FORM.EMAIL_INPUT         // 'contact.form.email-input'
CONTACT.FORM.MESSAGE_TEXTAREA    // 'contact.form.message-textarea'

// Error boundary
ERROR_BOUNDARY.RELOAD_BUTTON      // 'error-boundary.reload-button'
```

### Naming Guidelines

1. **Page**: The top-level page or feature (e.g., `auth`, `dashboard`, `settings`)
2. **Section**: The specific section within the page (e.g., `login`, `sidebar`, `language`)
3. **Component**: The component or container (e.g., `form`, `navigation`, `selector`)
4. **Element**: The specific element (e.g., `submit-button`, `email-input`, `current-language`)

Use lowercase with hyphens for separation. Be descriptive but concise.

## Adding New UI Identifiers

### Step 1: Add to Registry

Add the identifier to `src/shared/ui-registry.ts` in the appropriate section:

```tsx
export const MY_PAGE = {
  MY_SECTION: {
    MY_COMPONENT: {
      MY_ELEMENT: 'my-page.my-section.my-component.my-element' as const,
    },
  },
} as const;
```

### Step 2: Import and Use

```tsx
import { UiButton } from '@/components/ui';
import { MY_PAGE } from '@/shared/ui-registry';

<UiButton ui={MY_PAGE.MY_SECTION.MY_COMPONENT.MY_ELEMENT}>
  Click me
</UiButton>
```

### Step 3: Validation

The registry automatically validates:
- **Uniqueness**: Duplicate identifiers will throw an error at module load time
- **Naming Convention**: Invalid identifiers will throw an error at module load time
- **Type Safety**: TypeScript will only allow registered identifiers as `ui` prop values

## ESLint Enforcement

The project includes custom ESLint rules to enforce the UI Identification System:

### Rules

1. **`ui-identification/no-direct-native-interactive-elements`**
   - Prevents direct usage of native HTML elements (`button`, `input`, `select`, `textarea`, `a`)
   - Error: "Use UiButton component instead of native <button> element"

2. **`ui-identification/no-base-ui-components`**
   - Prevents direct usage of base UI components (`Button`, `Input`, `Select`, etc.)
   - Prevents direct imports of base components
   - Error: "Use UiButton component instead of Button"
   - Error: "Direct import of base UI component 'Button' is forbidden"

3. **`ui-identification/require-ui-prop`**
   - Requires the `ui` prop on all Ui* components
   - Validates naming convention regex
   - Prevents raw string values (must use registry constants)
   - Error: "UiButton component requires a 'ui' prop with a unique identifier from the registry"
   - Error: "UiButton component 'ui' prop must use a constant from the UI Registry, not a raw string"

4. **`ui-identification/validate-registry-uniqueness`**
   - Validates that all identifiers in the registry are unique
   - Runs only on `src/shared/ui-registry.ts`
   - Error: "Duplicate UI identifier found in registry"

### Exceptions

Native HTML elements and base UI components are allowed within:
- Base UI component implementations (in `src/components/ui/`)
- Ui* component implementations (in `src/components/ui-identified/`)

## Technical Enforcement

### TypeScript Type Safety

The `ui` prop is typed as `UiIdentifier`, which is a union type of all registered identifiers:

```tsx
export type UiIdentifier = typeof ALL_UI_IDENTIFIERS[number];
```

This means:
- **Raw strings are rejected**: `<UiButton ui="invalid" />` → TypeScript error
- **Only registry constants are allowed**: `<UiButton ui={HOME.HERO.CTA.PRIMARY_BUTTON} />` → Valid
- **Autocomplete works**: IDEs will suggest valid identifiers from the registry

### Runtime Validation

The registry validates itself at module load time:

```tsx
// Auto-validate registry at module load time
validateRegistry();
```

This throws an error if:
- Duplicate identifiers exist
- Identifiers violate the naming convention

### Build-Time Enforcement

The build will fail if:
- An interactive element is created without a valid registered UI identifier
- A raw string is passed to the `ui` prop
- A duplicate identifier exists in the registry
- An identifier violates the naming convention
- A forbidden base/native interactive element is used

## Implementation Details

### How It Works

Each Ui* component:
1. Requires a mandatory `ui` prop of type `UiIdentifier` (from registry)
2. Automatically renders the identifier as `data-ui={ui}`
3. Passes through all other props to the base component
4. Maintains the same API as the base component

### Example Implementation

```tsx
// src/components/ui-identified/button.tsx
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import type { UiIdentifier } from '@/shared/ui-registry';

export interface UiButtonProps extends Omit<ButtonProps, 'data-ui'> {
  ui: UiIdentifier; // Type restricted to registry values only
}

const UiButton = React.forwardRef<HTMLButtonElement, UiButtonProps>(
  ({ ui, ...props }, ref) => {
    return <Button ref={ref} data-ui={ui} {...props} />;
  }
);
UiButton.displayName = 'UiButton';

export { UiButton };
```

## Migration Guide

When adding new interactive elements:

1. Add the identifier to `src/shared/ui-registry.ts`
2. Import the appropriate component from `@/components/ui`
3. Import the registry constant from `@/shared/ui-registry`
4. Use the registry constant for the `ui` prop

### Example Migration

**Before (Forbidden):**
```tsx
<button onClick={handleSubmit}>Submit</button>
```

**After (Required):**
```tsx
import { UiButton } from '@/components/ui';
import { CONTACT } from '@/shared/ui-registry';

<UiButton ui={CONTACT.FORM.SUBMIT_BUTTON} onClick={handleSubmit}>
  Submit
</UiButton>
```

## Benefits

- **Type Safety**: Compile-time enforcement prevents invalid identifiers
- **Consistency**: Every interactive element follows the same pattern
- **Testability**: Stable selectors for automated testing
- **Debuggability**: Easy to identify elements in browser dev tools
- **Maintainability**: Clear structure and naming conventions
- **AI-Friendly**: Structured identifiers for AI-assisted development
- **Documentation**: Self-documenting through meaningful names
- **Immutability**: Registry-based approach prevents accidental changes

## Best Practices

1. **Always Use Registry Constants**: Never use raw strings for the `ui` prop
2. **Be Descriptive**: Use names that clearly describe the element's purpose
3. **Be Consistent**: Follow the naming convention strictly
4. **Be Specific**: Avoid generic names like "button" or "input"
5. **Think Hierarchically**: Structure identifiers to reflect the UI hierarchy
6. **Keep It Stable**: Don't change identifiers unless necessary
7. **Test Your Selectors**: Verify that identifiers work with your testing tools

## Troubleshooting

### TypeScript Errors

**Error**: Type 'string' is not assignable to type 'UiIdentifier'
- **Cause**: You're using a raw string instead of a registry constant
- **Solution**: Import the constant from `@/shared/ui-registry` and use it

**Error**: Cannot find module '@/components/ui-identified'
- **Cause**: You're importing from the wrong location
- **Solution**: Import from `@/components/ui` instead

### ESLint Errors

**Error**: "UiButton component 'ui' prop must use a constant from the UI Registry"
- **Cause**: You're using a raw string literal
- **Solution**: Use a registry constant from `@/shared/ui-registry`

**Error**: "Direct import of base UI component 'Button' is forbidden"
- **Cause**: You're importing a base component directly
- **Solution**: Import from `@/components/ui` instead

**Error**: "Duplicate UI identifier found in registry"
- **Cause**: You added a duplicate identifier to the registry
- **Solution**: Remove the duplicate and use a unique identifier

### Build Failures

If the build fails:
1. Check for TypeScript errors (run `npm run typecheck`)
2. Check for ESLint errors (run `npm run lint`)
3. Verify all identifiers are in the registry
4. Ensure no raw strings are used for `ui` props
5. Check for duplicate identifiers in the registry

## Registry Structure

The registry is organized by page/feature:

```tsx
export const PAGE_NAME = {
  SECTION_NAME: {
    COMPONENT_NAME: {
      ELEMENT_NAME: 'page-name.section-name.component-name.element-name' as const,
    },
  },
} as const;
```

This structure provides:
- **Type Safety**: Nested objects with `as const` ensure type inference
- **Autocomplete**: IDEs can suggest identifiers based on the structure
- **Organization**: Clear hierarchy for managing identifiers
- **Validation**: Easy to validate uniqueness and naming convention

## Future Enhancements

Potential future improvements:
- Automated identifier generation based on component structure
- Integration with testing frameworks
- Visual identifier inspector tool
- Documentation generator based on identifiers
- Migration tooling for existing codebases

## Questions?

Refer to this documentation or ask the team for clarification on specific use cases.
