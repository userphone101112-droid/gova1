# Gova Design System — Phase 2 Documentation

## Overview

The Gova Design System is the **Single Source of Truth (SSOT)** for all visual decisions across the application. Phase 2 extends Phase 1 (color enforcement) to govern typography, spacing, elevation, motion, layout, and component-specific visual patterns.

## Token Hierarchy

```
Primitive Tokens (immutable physical values)
    ↓
Semantic Tokens (meaningful aliases)
    ↓
Visual Tokens (typography composites, elevation, motion, opacity, blur, layout)
    ↓
Component Tokens (per-component visual properties)
    ↓
Component Patterns (reusable CSS classes)
    ↓
Tailwind @theme bridge (globals.css)
    ↓
Application components
```

### File Ownership

| File | Layer | Owner |
|------|-------|-------|
| `primitive-tokens.css` | Foundation | Design System |
| `semantic-tokens.css` | Semantic colors, spacing, radius, shadows | Design System |
| `visual-tokens.css` | Typography composites, elevation, motion, layout | Design System |
| `component-tokens.css` | Component-specific tokens | Design System |
| `component-patterns.css` | Reusable pattern classes | Design System |
| `globals.css` | Tailwind bridge + global utilities | Design System |
| `token-names.ts` | TypeScript token name registry | Design System |
| `index.ts` | Public SSOT entry point | Design System |

## Naming Conventions

| Layer | Pattern | Example |
|-------|---------|---------|
| Primitive | `--gova-primitive-{category}-{name}` | `--gova-primitive-spacing-4` |
| Semantic | `--gova-{role}` | `--gova-on-surface` |
| Visual | `--gova-type-{scale}-{property}` | `--gova-type-headline-lg-size` |
| Component | `--gova-component-{component}-{property}` | `--gova-component-auth-card-radius` |
| Pattern class | `{domain}-{element}` | `.settings-card`, `.auth-cta` |
| Typography class | `type-{scale}-{size}` | `.type-headline-md` |

## Typography System

### Scales

| Scale | Sizes | Usage |
|-------|-------|-------|
| Display | lg, md, sm | Page heroes, splash screens |
| Headline | lg, md, sm | Section titles, card headers |
| Title | lg, md, sm | Subsection titles, list headers |
| Body | lg, md, sm | Paragraph text, descriptions |
| Label | lg, md, sm | Form labels, buttons, badges |
| Caption | — | Helper text, timestamps |

Each composite includes: **size**, **weight**, **line-height**, **letter-spacing**.

### Usage

```tsx
// Preferred: composite typography class
<h1 className="type-display-md text-primary">Title</h1>

// Acceptable: Tailwind text-* (remapped to MD3 tokens via @theme)
<p className="text-sm text-on-surface-variant">Description</p>

// Header primitive auto-applies type-* classes by level
<UiHeader level={2}>Section</UiHeader>
```

## Spacing System

### Semantic Scale

| Token | Value | Tailwind |
|-------|-------|----------|
| xs | 8px | `p-xs`, `gap-xs` |
| sm | 12px | `p-sm` |
| md | 16px | `p-md` |
| lg | 24px | `p-lg` |
| xl | 32px | `p-xl` |
| 2xl | 48px | `p-2xl` |
| 3xl | 64px | `p-3xl` |

Numeric Tailwind scale (`p-4`, `gap-6`, `mb-12`) is **remapped** to primitive spacing tokens in `@theme`, so existing classes consume the design system automatically.

## Elevation System

| Level | Token | Class |
|-------|-------|-------|
| 0 | `--gova-elevation-0` | `.elevation-0` |
| 1 | `--gova-elevation-1` | `.elevation-1` |
| 2 | `--gova-elevation-2` | `.elevation-2` |
| 3 | `--gova-elevation-3` | `.elevation-3` |
| 4 | `--gova-elevation-4` | `.elevation-4` |
| 5 | `--gova-elevation-5` | `.elevation-5` |
| 6 | `--gova-elevation-6` | `.elevation-6` |

## Motion System

| Token | Usage |
|-------|-------|
| `--gova-motion-duration-*` | Animation/transition durations |
| `--gova-motion-ease-*` | Easing curves |
| `--gova-motion-transition-colors` | Color transitions |
| `--gova-motion-transition-transform` | Transform transitions |
| `.motion-colors` | Apply color transition utility |
| `.motion-transform` | Apply transform transition utility |

## Authentication Patterns

Ready-to-use CSS classes (UI pages not yet implemented):

| Class | Purpose |
|-------|---------|
| `.auth-page` | Full-page auth layout |
| `.auth-card` | Form card container |
| `.auth-hero` | Hero/branding section |
| `.auth-input` | Text input styling |
| `.auth-cta` | Primary action button |
| `.auth-otp-cell` | OTP digit cell |

All reference `--gova-component-auth-*` tokens.

## Settings Patterns

| Class | Purpose |
|-------|---------|
| `.settings-card` | Standard settings card |
| `.settings-section-title` | Section heading |
| `.settings-group` | Grouped settings items |
| `.settings-preview` | Theme preview card |
| `.settings-action-row` | Action row layout |

## Extension Process

1. **Add primitive** in `primitive-tokens.css` (if new physical value)
2. **Add semantic alias** in `semantic-tokens.css` or `visual-tokens.css`
3. **Add component token** in `component-tokens.css` (if component-specific)
4. **Add pattern class** in `component-patterns.css` (if reusable)
5. **Bridge to Tailwind** in `globals.css` `@theme` (if utility needed)
6. **Register name** in `token-names.ts`
7. **Run validation**: `npm run validate:theme`

## Migration Process

1. Replace hardcoded colors → semantic color utilities (`bg-primary`, `text-on-surface`)
2. Replace arbitrary dimensions → token utilities or pattern classes
3. Replace typography → `type-*` classes or remapped `text-*`
4. Replace shadows → `elevation-*` classes
5. Replace z-index → `z-scrim`, `z-drawer`, or `z-{10-70}` (token-mapped)
6. Replace transitions → `motion-*` classes or `duration-*` (token-mapped)

## Developer Guidelines

### DO

- Import from `@/design-system` for token names
- Use pattern classes (`.settings-card`, `.auth-card`) for domain UI
- Use `type-*` classes for typography composites
- Use semantic spacing (`p-md`) or remapped numeric scale (`p-4`)
- Extend the design system when new visual values are needed

### DO NOT

- Hardcode hex/rgb/hsl colors in components
- Use Tailwind palette colors (`bg-blue-500`, `text-gray-600`)
- Use arbitrary dimensions (`w-[16px]`, `p-[12px]`)
- Define component-level color/spacing systems
- Add visual values outside `src/design-system/`

## Enforcement

| Tool | Command | Detects |
|------|---------|---------|
| Theme validator | `npm run validate:theme` | Colors, dimensions, z-index, durations |
| ESLint | `npm run lint` | Colors, forbidden palette, arbitrary dimensions |
| CI | `npm run ci:enforcement` | Full pipeline including theme validation |
| Pre-build | `npm run prebuild` | Blocks build on violations |

## Validation

```bash
npm run validate:theme   # Phase 2 visual compliance
npm run typecheck        # TypeScript
npm run lint             # ESLint including design tokens
npm run ci:enforcement   # Full CI gate
```
