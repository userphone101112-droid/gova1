# Strict Theme & Design System Rules

Mandatory rules for colors, spacing, typography, motion, and theme preferences in GoVa. Violations fail ESLint, `validate:theme`, CI, or build.

> **Language & RTL direction:** Copy and locale switching are in **[i18n.md](./i18n.md)**. This document covers visual tokens, theme modes, and layout-direction CSS (logical properties).

---

## Core Principle: Token-Only Visuals

All visual values must originate from the design system CSS token files. Components consume tokens through Tailwind utilities mapped in `globals.css` — never through raw colors, palette classes, or arbitrary pixel values.

**Single source of truth:**

```
primitive-tokens.css  →  visual-tokens.css  →  semantic-tokens.css  →  component-tokens.css
                                                              ↓
                                                    component-patterns.css
                                                              ↓
                                                    globals.css (@theme inline)
                                                              ↓
                                                    Tailwind utilities in components
```

---

## 1. Token File Layout

| File | Role | May define raw values? |
|------|------|----------------------|
| `src/design-system/primitive-tokens.css` | Raw palette, spacing, radius, shadows, motion | **Yes** — only place for hex/rgb primitives |
| `src/design-system/visual-tokens.css` | Visual scales (elevation, motion curves) | References primitives |
| `src/design-system/semantic-tokens.css` | Meaningful tokens (`--gova-primary`, `--gova-surface`, …) | References primitives/visual; includes `html.dark` overrides |
| `src/design-system/component-tokens.css` | Component-specific tokens (`--gova-component-button-primary-bg`, …) | References semantic tokens |
| `src/design-system/component-patterns.css` | Reusable CSS classes (`.type-headline-md`, `.surface-card`, …) | References tokens only |
| `src/app/globals.css` | Tailwind `@theme inline` bridge + SSOT preference hooks | Maps `--color-*`, `--spacing-*`, etc. to `--gova-*` tokens |

**Forbidden:** Defining colors, spacing, shadows, or durations anywhere else in `src/` except the files above.

TypeScript name registry (names only, no values):

- `src/design-system/token-names.ts` — `GOVA_TOKENS`, `cssVar()`
- `src/design-system/tokens.ts` — runtime token helpers
- `src/design-system/index.ts` — public export surface

Import design system utilities from `@/design-system` when TypeScript access is needed.

---

## 2. Using Tokens in Components

### Preferred: Tailwind semantic utilities

`globals.css` maps design tokens to Tailwind theme keys. Use these in `className`:

```tsx
<div className="bg-surface text-on-surface border-border rounded-lg shadow-md p-4">
```

Common semantic color utilities (non-exhaustive):

| Utility prefix | Token meaning |
|----------------|---------------|
| `bg-background`, `text-foreground` | Page background / text |
| `bg-primary`, `text-on-primary` | Primary brand actions |
| `bg-surface`, `text-on-surface` | Surface containers |
| `bg-surface-container`, `bg-surface-container-high` | Elevated surfaces |
| `bg-card`, `text-card-foreground` | Card surfaces (shadcn alias) |
| `bg-muted`, `text-muted-foreground` | Muted/subtle areas |
| `border-border`, `border-outline` | Borders |
| `bg-error`, `text-on-error` | Error states |
| `bg-success`, `bg-warning`, `bg-info` | Status colors |
| `ring-ring`, `ring-focus-ring` | Focus rings |

Use the standard Tailwind spacing scale (`p-4`, `gap-6`, `m-2`) — it is remapped to `--gova-primitive-spacing-*` in `@theme`.

Use standard radius utilities (`rounded-md`, `rounded-xl`, `rounded-full`) — remapped to `--gova-radius-*`.

### Allowed: CSS variable in inline style

When Tailwind is insufficient, use **registered** `--gova-*` variables only:

```tsx
<div style={{ background: 'var(--gova-background)' }} />
<div style={{ color: cssVar(GOVA_TOKENS.onSurface) }} />
```

Every `var(--…)` in inline styles must resolve to a token defined in `primitive-tokens.css`, `semantic-tokens.css`, or `component-tokens.css`. ESLint validates this at lint time.

### Allowed: Component pattern classes

Use pre-built pattern classes from `component-patterns.css`:

```tsx
<h1 className="type-headline-lg">...</h1>
<div className="surface-card">...</div>
```

### Forbidden in components

```tsx
// ❌ Raw color literals
<div className="text-[#333]" style={{ color: '#333' }} />
<div style={{ backgroundColor: 'rgb(0,0,0)' }} />

// ❌ Tailwind palette classes
<div className="bg-blue-500 text-gray-700 border-red-300" />

// ❌ Arbitrary dimensions
<div className="w-[13px] h-[42px] z-[999]" />

// ❌ Undefined CSS variables
<div style={{ color: 'var(--my-custom-color)' }} />

// ❌ Google-specific vars outside token files
<div style={{ font: 'var(--gova-google-...)' }} />

// ❌ Hardcoded durations in globals.css (without var(--gova-*))
transition: 300ms;
```

---

## 3. Theme Runtime (SSOT)

Theme preferences are managed by the **unified store** (`src/store/unified.store.ts`) and synced to the DOM.

### `<html>` attributes set by `syncDOMFromStore()`

| Attribute / class | Source | Values |
|-------------------|--------|--------|
| `class="light"` / `class="dark"` | `themeMode` | Effective theme after resolving `system` |
| `data-theme` | `themeMode` | `light` or `dark` (effective) |
| `data-density` | `density` | `compact`, `comfortable`, `spacious` |
| `class="high-contrast"` | `highContrast` | toggled |
| `class="reduce-motion"` | `reducedMotion` | toggled |
| `style="font-size: …px"` | `fontSize` | `12`–`24` |
| `lang`, `dir` | `language` | See [i18n.md](./i18n.md) |

### Providers

| Component | Role |
|-----------|------|
| `SSOTProvider` (`src/providers/SSOTProvider.tsx`) | Hydrates store from server cookie snapshot |
| `ThemePreferencesSync` (`src/providers/ThemePreferencesSync.tsx`) | Keeps `<html>` in sync when preferences change |
| `ThemeProvider` | **Deprecated** — no-op wrapper; do not use for new code |

### Server-side initial state

`src/app/layout.tsx` reads preferences via `@/platform/ui/server`:

- `getThemeMode()` — `light` | `dark` | `system`
- `getEffectiveTheme()` — resolved theme for SSR class
- `getSSOTPreferences()` — `fontSize`, `density`, `highContrast`, `reducedMotion`

Initial `<html>` class/attributes are set at SSR; client `ThemePreferencesSync` updates on change.

### Theme modes

| Mode | Behavior |
|------|----------|
| `light` | Forces `html.light`; light semantic tokens |
| `dark` | Forces `html.dark`; dark overrides in `semantic-tokens.css` |
| `system` | Follows `prefers-color-scheme`; re-syncs on OS change |

User controls live on `/settings` (Appearance section) via `setThemeMode()`, `setDensity()`, `setHighContrast()`, `setReducedMotion()`, `setFontSize()`.

### Density scale

Defined in `globals.css`:

| `data-density` | `--gova-density-scale` |
|--------------|------------------------|
| `compact` | `0.85` |
| `comfortable` | `1` (default) |
| `spacious` | `1.15` |

Affects spacing on `#main-content-container` and any CSS using `--gova-density-scale`.

### Accessibility overrides

- **`html.high-contrast`** — stronger outline tokens (light and dark variants)
- **`html.reduce-motion`** — forces minimal animation/transition duration via `--gova-motion-duration-accessibility`
- **`@media (prefers-reduced-motion: reduce)`** — disables marquee animations in globals

---

## 4. Dark Mode Rules

Dark mode is token-driven, not component-driven.

1. **Never** hardcode dark-specific colors in components.
2. Add light values under `:root` in `semantic-tokens.css`.
3. Add dark overrides under `html.dark { … }` in the same file.
4. Components keep the same class names (`bg-surface`, `text-on-surface`) — tokens swap automatically.

System dark preference is handled via `@media (prefers-color-scheme: dark)` in semantic tokens for users without an explicit `light` class.

---

## 5. RTL & Logical Properties

Theme layout must work in both LTR and RTL. Use **logical** CSS properties enforced by ESLint rule `i18n-enforcement/no-directional-violations`:

| Forbidden | Use instead |
|-----------|-------------|
| `ml-`, `mr-` | `ms-`, `me-` |
| `pl-`, `pr-` | `ps-`, `pe-` |
| `text-left`, `text-right` | `text-start`, `text-end` |
| `left-`, `right-` | `start-`, `end-` |
| `marginLeft`, `marginRight` in inline style | logical equivalents |

Language direction (`dir="rtl"`) is set by `LocaleProvider` / unified store. See [i18n.md § Language switching](./i18n.md#language-switching).

Global RTL icon flip is applied in `globals.css` for `svg` and `.icon` under `[dir="rtl"]`.

---

## 6. Adding or Changing Tokens

### Workflow

1. Add primitive value in `primitive-tokens.css` (if truly new raw value).
2. Map to semantic name in `semantic-tokens.css` (include `html.dark` override if color).
3. Add component token in `component-tokens.css` if component-specific.
4. Expose to Tailwind via `@theme inline` block in `globals.css` (if new utility needed).
5. Optionally add pattern class in `component-patterns.css`.
6. Add name to `GOVA_TOKENS` in `token-names.ts` for TypeScript access.
7. Run validation commands (§8).

### Rules when adding tokens

- Prefix all CSS variables with `--gova-`.
- Semantic tokens must reference primitives — no raw hex in semantic/component layers.
- Every new color token needs both light and dark definitions.
- Do not add tokens directly in component TSX files.

---

## 7. ESLint Enforcement

Plugin: `design-token-enforcement` (`.eslint-rules/design-token-enforcement.js`), configured in `eslint.config.mjs`.

| Rule | Severity | What it blocks |
|------|----------|----------------|
| `no-hardcoded-design-tokens` | **error** | Hex/rgb/hsl colors, forbidden Tailwind palette classes, undefined `var(--*)`, arbitrary color arbitrary values, hardcoded spacing in style objects |

### Exemptions

- `src/platform/ui/devtools/**`
- `scripts/**`
- `<Image>` / `<img>` inline styles (Next.js image sizing)
- Dev-prefixed component names in inline style checks

### Related ESLint (i18n plugin)

| Rule | Relevance to theme |
|------|-------------------|
| `no-directional-violations` | RTL-safe logical CSS |
| `no-hardcoded-text` | Not theme, but often co-located in JSX |

Run lint:

```powershell
npm run lint
```

---

## 8. Testing & Validation Commands

There is no dedicated Jest suite for theme compliance. Enforcement is via ESLint + the CI validator script.

### Primary theme validator

```powershell
npm run validate:theme
```

Script: `scripts/validate-theme-compliance.ts`

Scans all `src/**/*.{ts,tsx,js,jsx,css}` except `src/platform/ui/devtools/`.

| Violation type | Detected in |
|----------------|-------------|
| `hardcoded-color` | Hex, rgb, hsl outside allowed token CSS files |
| `hardcoded-duration` | Raw `ms`/`s` in `globals.css` without `var(--gova-*)` |
| `forbidden-tailwind-color` | Palette classes (`bg-blue-500`, `text-gray-700`, …) |
| `invalid-css-variable` | `--gova-google-*` outside token files |
| `hardcoded-dimension` | Arbitrary Tailwind dimensions (`w-[13px]`, `gap-[2rem]`) |
| `hardcoded-z-index` | Arbitrary z-index (`z-[999]`) |

**Allowed CSS files** (may contain raw values):

- `src/design-system/primitive-tokens.css`
- `src/design-system/semantic-tokens.css`
- `src/design-system/visual-tokens.css`
- `src/design-system/component-tokens.css`
- `src/design-system/component-patterns.css`

`src/app/globals.css` may contain token references and SSOT hooks but is scanned for hardcoded colors and durations.

**Exits 1** on any violation.

### Lint (includes design-token ESLint rule)

```powershell
npm run lint
npm run lint:fix   # auto-fix where supported
```

### CI integration

| Pipeline | Includes `validate:theme`? |
|----------|---------------------------|
| `npm run ci:check` | Yes — full pre-merge gate |
| `npm run ci:enforcement` | Yes |
| `npm run prebuild` | Yes (via script hook before build) |
| `npm run build` | Yes (via `ci:check`) |

Full enforcement subset:

```powershell
npm run ci:enforcement
```

Runs: `typecheck` → `lint` → `ci:i18n` → `validate:theme` → `audit:unified-ui-i18n` → `audit:orphans`

---

## 9. Manual Verification Checklist

After styling a page or component:

- [ ] `npm run lint` — zero `design-token-enforcement` errors
- [ ] `npm run validate:theme` — zero violations
- [ ] Light mode: colors, contrast, surfaces render correctly
- [ ] Dark mode: toggle in Settings → Appearance → Dark
- [ ] System mode: matches OS preference
- [ ] High contrast: toggle in Settings → Accessibility
- [ ] Density: test compact / comfortable / spacious
- [ ] Reduced motion: animations respect toggle
- [ ] Font size slider: `12px`–`24px` scales root text
- [ ] Arabic RTL: logical properties (`ms-`, `text-start`) layout correctly
- [ ] No Tailwind palette classes (`bg-gray-*`, `text-blue-*`) in changed files

---

## 10. Common Patterns

### Surface card

```tsx
<div className="bg-surface-container rounded-xl border border-border shadow-sm p-6">
```

### Primary button

```tsx
<button className="bg-primary text-on-primary rounded-lg px-4 py-2 font-medium">
```

### Muted helper text

```tsx
<p className="text-sm text-muted-foreground">
```

### Token-only inline background

```tsx
<div style={{ background: 'var(--gova-background)' }} className="min-h-screen">
```

### Typography composite

```tsx
<h2 className="type-headline-md text-on-surface">
```

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| ESLint `forbiddenTailwindColor` | Used `bg-blue-500` etc. | Replace with semantic utility (`bg-primary`, `bg-surface-container`) |
| ESLint `invalidCssVariable` | `var(--unknown)` in style | Use token from `GOVA_TOKENS` or add to design-system CSS |
| `validate:theme` hardcoded-color | Hex/rgb in TSX or wrong CSS file | Move value to `primitive-tokens.css`, reference via semantic token |
| `validate:theme` hardcoded-dimension | `w-[42px]` | Use Tailwind scale (`w-10`, `w-12`) or add spacing token |
| Dark mode looks wrong | Missing `html.dark` override | Add override in `semantic-tokens.css` |
| Theme not persisting | SSOT cookie missing | Check Settings save; verify `gova-global-ssot` cookie |
| SSR/client theme mismatch | Store not hydrated | Ensure `SSOTProvider` snapshot matches server `getThemeMode()` |

---

## 12. Quick Reference

```powershell
# Theme compliance only
npm run validate:theme

# ESLint including design tokens
npm run lint

# Full pre-merge (includes theme + everything else)
npm run ci:check
```

**Token cascade:**

```
primitives → semantics (+ html.dark) → components → @theme → Tailwind classes
```

**Never in components:** raw colors, palette Tailwind, arbitrary `[Npx]`, undefined CSS vars.

**Always:** semantic utilities (`bg-surface`, `text-on-surface`, `border-border`, …).

---

## Related Documentation

| Document | Contents |
|----------|----------|
| **[UI_CREATION_RULES.md](./UI_CREATION_RULES.md)** | Pages, registry UUIDs, routes, CI for UI elements |
| **[i18n.md](./i18n.md)** | Translations, locale switching, RTL language direction |
| `src/design-system/index.ts` | TypeScript design system exports |
| `src/app/globals.css` | Tailwind `@theme` bridge and SSOT hooks |
