# Design System - Single Source of Truth (SSOT)

## Overview

This design system provides a centralized, consistent source of truth for all styling across the Gova application. It eliminates hardcoded values and ensures visual consistency.

## Architecture

The design system is organized into three layers:

1. **Primitive Tokens** (`src/design-system/primitive-tokens.css`): Raw, immutable values (e.g., hex colors, pixel values)
2. **Semantic Tokens** (`src/design-system/semantic-tokens.css`): Meaningful values that map to primitives (e.g., `--gova-background`, `--gova-primary`)
3. **Component Tokens** (`src/design-system/component-tokens.css`): Tokens specific to individual components

## Token Naming Convention

All tokens follow this pattern:
```
--gova-<layer>-<category>-<name>
```

Example:
- `--gova-primitive-color-primary-500` (Primitive Layer)
- `--gova-primary` (Semantic Layer)
- `--gova-component-button-primary-bg` (Component Layer)

## Usage Rules

### ✅ Do's
- Always use semantic tokens in components and pages
- Use CSS variables directly: `var(--gova-primary)`
- Use Tailwind utility classes that map to design tokens
- Use TypeScript types from `@/design-system/tokens.ts`

### ❌ Don'ts
- Do not use hardcoded hex colors (e.g., `#3b82f6`)
- Do not use hardcoded spacing values (e.g., `16px`)
- Do not define new theme variables outside the design system
- Do not bypass the token layers

## Available Tokens

### Colors (Semantic)
```css
--gova-background
--gova-on-background
--gova-primary
--gova-primary-fixed
--gova-primary-container
--gova-on-primary
--gova-secondary
--gova-surface
--gova-error
--gova-warning
--gova-success
--gova-info
```

### Spacing
```css
--gova-spacing-xs
--gova-spacing-sm
--gova-spacing-md
--gova-spacing-lg
--gova-spacing-xl
--gova-spacing-2xl
```

### Border Radius
```css
--gova-radius-sm
--gova-radius-md
--gova-radius-lg
--gova-radius-xl
--gova-radius-full
```

### Shadows
```css
--gova-shadow-sm
--gova-shadow-md
--gova-shadow-lg
--gova-shadow-xl
```

## Tailwind CSS 4 Configuration

Tailwind is configured to use our design system tokens via the `@theme` directive in `src/app/globals.css`.

## TypeScript Support

Type definitions are available in `src/design-system/tokens.ts`:
```typescript
import { getDesignToken, isDesignToken } from "@/design-system/tokens";
```

## Linting & Enforcement

An ESLint rule (`design-token-enforcement/no-hardcoded-design-tokens`) is included to detect hardcoded values.

## Migration Guide

For existing files, replace hardcoded values with design tokens:

Before:
```css
.button {
  background-color: #3b82f6;
  padding: 16px;
  border-radius: 8px;
}
```

After:
```css
.button {
  background-color: var(--gova-primary);
  padding: var(--gova-spacing-md);
  border-radius: var(--gova-radius-md);
}
```

## Dark Mode

The design system automatically supports dark mode via `@media (prefers-color-scheme: dark)`.
