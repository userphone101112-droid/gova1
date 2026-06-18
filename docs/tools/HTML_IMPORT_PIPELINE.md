# HTML → React Conversion Pipeline

**Mandatory reference** for converting imported HTML (`note/*.html`) into the Gova platform.

This is an **architectural enforcement layer**, not a guideline. Skipping steps causes registry crashes, empty translations, or CI/build failure.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Conversion Scenarios](#2-conversion-scenarios)
3. [End-to-End Checklist](#3-end-to-end-checklist)
4. [Phase A — Parse the HTML](#4-phase-a--parse-the-html)
5. [Phase B — UI Registry](#5-phase-b--ui-registry)
6. [Phase C — Translations (i18n)](#6-phase-c--translations-i18n)
7. [Phase D — React Page & Components](#7-phase-d--react-page--components)
8. [Phase E — Styling & SSOT](#8-phase-e--styling--ssot)
9. [Phase F — State & Interactivity](#9-phase-f--state--interactivity)
10. [Phase G — Validation & CI](#10-phase-g--validation--ci)
11. [Scenario Playbooks](#11-scenario-playbooks)
12. [Troubleshooting Matrix](#12-troubleshooting-matrix)
13. [Reference Implementations](#13-reference-implementations)
14. [Appendix — File Map & Commands](#14-appendix--file-map--commands)

---

## 1. System Overview

Every converted page must integrate **four coupled systems**:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  UI Registry    │────▶│  i18n Binding    │────▶│  Locale JSON    │
│  (identities)   │     │  (key mapping)   │     │  (ar + en)      │
└────────┬────────┘     └──────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Ui* Runtime    │────▶│  SSOT Design     │
│  Components     │     │  Tokens          │
└─────────────────┘     └──────────────────┘
```

| System | Location | Role |
|--------|----------|------|
| UI Registry | `src/platform/ui/registry/` | Stable IDs + paths for every UI element |
| i18n | `src/platform/ui/i18n/` | Translations bound to registry paths |
| Runtime Ui* | `src/platform/ui/runtime/` | React components with `data-ui-*` attributes |
| Design SSOT | `src/design-system/` | Only allowed source of colors/spacing/type |
| Unified Store | `src/store/unified.store.ts` | SSOT for language, theme, density, a11y prefs |

### Public APIs

| Import | Use for |
|--------|---------|
| `@/platform/ui` | Client: registry, `Ui*`, `useTranslation`, hooks |
| `@/platform/ui/server` | Server: dictionaries, locale cookies, `createFeatureLayout` |

### Architecture docs

- `docs/PROJECT_ARCHITECTURE_EN.md` — full platform architecture

---

## 2. Conversion Scenarios

Choose the playbook that matches your HTML source:

| Scenario | Example | Key decisions |
|----------|---------|---------------|
| **A. Static content page** | Info page | Registry + locales + `page.tsx`; minimal state |
| **B. App shell page** | `/settings`, `/home` | Add `layout.tsx` with `AppShell` |
| **C. Interactive preferences** | Settings toggles | `'use client'` + `useUnifiedStore` |
| **D. Form page** | Login | `UiInput`/`UiButton` + React Hook Form + Zod |
| **E. Decomposed feature** | Home | Split into `src/components/<feature>/` |
| **F. Extend existing feature** | New home section | Add identities to existing `features/<feature>.ts` |
| **G. Brand-new feature route** | `/dashboard` | Full checklist + register in 4 central files |

### Decision tree

```
Is this a new route?
├─ YES → Create features/<name>.ts + locales/<name>/ + app/<name>/
│         Register in: registry.ts, i18n-route-manifest.ts,
│         APP_DICTIONARY_FEATURES, FEATURE_SCOPES
└─ NO  → Add identities to existing feature file only

Does the page need sidebar/header nav?
├─ YES → layout.tsx with <AppShell>{children}</AppShell>
└─ NO  → layout.tsx with createFeatureLayout() or no layout

Does the page have toggles / theme / language?
├─ YES → 'use client' + useUnifiedStore()
└─ NO  → Server component OK if no hooks needed

Is the HTML large (>300 lines)?
├─ YES → Decompose into src/components/<feature>/*.tsx
└─ NO  → Single page.tsx acceptable
```

---

## 3. End-to-End Checklist

Copy and complete for every conversion:

```
[ ] 1. Parse HTML — extract text, sections, interactive elements
[ ] 2. Plan UI identities — list all paths before writing code
[ ] 3. Verify path uniqueness — no camelCase, no key collisions (§5.4)
[ ] 4. Create/update features/<feature>.ts
[ ] 5. Wire feature in registry.ts (if new feature)
[ ] 6. Create locales/<feature>/ar.json + en.json (mirrored keys)
[ ] 7. Add route: app/<feature>/page.tsx
[ ] 8. Add layout.tsx if AppShell needed
[ ] 9. Add i18n-route-manifest.ts entry
[ ] 10. Add APP_DICTIONARY_FEATURES entry (getDictionary.ts)
[ ] 11. Add FEATURE_SCOPES entry (featureScope.ts) if route needs extra namespaces
[ ] 12. Replace native HTML with Ui* components
[ ] 13. Replace hardcoded colors with semantic tokens
[ ] 14. Wire state to useUnifiedStore where applicable
[ ] 15. Run: npm run ci:i18n && npm run typecheck && npm run lint
[ ] 16. Run: npm run platform:doctor (optional but recommended)
[ ] 17. Manual test: /route in ar + en, check browser console for SSOT/i18n warnings
```

### Files touched for a **new feature** (scenario G)

| # | File | Action |
|---|------|--------|
| 1 | `src/platform/ui/registry/features/<feature>.ts` | Create identities |
| 2 | `src/platform/ui/registry/registry.ts` | Export + add to `UI_REGISTRY` + flatten list |
| 3 | `src/platform/ui/i18n/locales/<feature>/ar.json` | Arabic strings |
| 4 | `src/platform/ui/i18n/locales/<feature>/en.json` | English strings |
| 5 | `src/app/<route>/page.tsx` | Page component |
| 6 | `src/app/<route>/layout.tsx` | Optional AppShell |
| 7 | `src/platform/ui/i18n/core/i18n-route-manifest.ts` | Route → feature mapping |
| 8 | `src/platform/ui/i18n/core/getDictionary.ts` | Add to `APP_DICTIONARY_FEATURES` |
| 9 | `src/platform/ui/i18n/core/featureScope.ts` | Add to `FEATURE_SCOPES` |
| 10 | `src/components/<feature>/` | Optional decomposition |

> **Do NOT use** `scripts/generate-feature.ts` as-is — it scaffolds outdated patterns (string paths, wrong directories, missing registry wiring). Use it for inspiration only; follow this pipeline manually.

---

## 4. Phase A — Parse the HTML

### Extract

- Page title + description
- Section headings (h1–h4)
- All visible labels, button text, placeholders, aria-labels
- Layout regions: header, sections, cards, footer actions
- Interactive elements: buttons, toggles, selects, inputs, links
- Repeated patterns → candidate sub-components
- Images (src + alt) and icons (map to Lucide equivalents)

### Ignore / strip

- `<script>` blocks and inline event handlers (`onclick`, etc.)
- CDN Tailwind (`cdn.tailwindcss.com`)
- Google Fonts / Material Icons CDN links
- Inline `<style>` blocks with hardcoded hex colors
- Tailwind config from the HTML source

### Output before coding

Maintain a mapping table:

| HTML element | Registry constant | Translation key (expected) | Ui component |
|-------------|-------------------|---------------------------|--------------|
| `<h1>الإعدادات</h1>` | `SETTINGS.TITLE` | `settings.page.title` | `UiHeader` |
| Save button | `SETTINGS.ACTIONS.SAVE` | `settings.actions.saveButton` | `UiButton` |

---

## 5. Phase B — UI Registry

### 5.1 Identity schema

Each entry in `features/<feature>.ts`:

```typescript
{
  id: 'UI_SETTINGS_TITLE',           // Unique stable ID (SCREAMING_SNAKE)
  path: 'settings.page.display.title', // 3 or 4 segments, kebab-case only
  description: 'Settings page title',
  category: 'display',                 // action | input | navigation | display | container
  feature: 'settings',                 // Must match feature name
  version: '1.0.0',
  createdAt: '2026-06-18',
  updatedAt: '2026-06-18',
  deprecated?: boolean,                // Optional
}
```

### 5.2 Path naming rules (CRITICAL)

Validated at **module load** by `validateRegistry()` — invalid paths **crash the entire app**.

```
Pattern:  page.section.component.element   (4 parts — preferred)
          page.section.element             (3 parts — allowed)

Regex:    /^[a-z0-9-]+(\.[a-z0-9-]+){2,3}$/
```

| Rule | ✅ Good | ❌ Bad |
|------|---------|--------|
| kebab-case segments | `app-settings` | `appSettings` |
| lowercase only | `feature-flags` | `featureFlags` |
| 3–4 segments | `home.promo-banner.display.title` | `home.title` (2 segments) |
| hyphens in compound words | `high-contrast` | `highContrast` |

### 5.3 Recommended path templates

Follow patterns from `features/home.ts`:

```typescript
// Page title/description (3-part)
path: 'settings.page.display.title'       // → key: settings.page.title
path: 'settings.page.display.description' // → key: settings.page.description

// Section heading (4-part, unique element)
path: 'settings.app-settings.display.section-title'  // → settings.app-settings.sectionTitle

// Card/item title (unique element — NOT bare ".title" if another .title exists in same section)
path: 'settings.app-settings.status.status-title'    // → settings.app-settings.statusTitle

// Action button
path: 'settings.actions.save.save-button'              // → settings.actions.saveButton

// Toggle / option label
path: 'settings.appearance.theme.light'                // → settings.appearance.light
```

### 5.4 Translation key binding (CRITICAL)

Keys are derived by `generateTranslationKeyFromUi()` — **the `component` tier is dropped**:

```
4-part: page.section.component.element → page.section.camelCase(element)
3-part: page.section.element           → page.section.camelCase(element)
```

#### Collision example

```
settings.app-settings.status.title
settings.app-settings.maintenance.title
→ BOTH produce: settings.app-settings.title  ❌
```

#### Fix

Use **unique final element segments**:

```
settings.app-settings.status.status-title        → settings.app-settings.statusTitle
settings.app-settings.maintenance.maintenance-title → settings.app-settings.maintenanceTitle
```

#### Pre-flight key check

Before committing registry entries, mentally compute every key. Two paths with the same `(page, section, last-segment)` **will collide**.

### 5.5 Structural vs translatable identities

| Path prefix | Translation required? | Usage |
|-------------|----------------------|-------|
| `common.*` | No | `COMMON_LAYOUT.SECTION`, `.WRAPPER`, `.CONTAINER` |
| `<feature>.*` | Yes | All user-visible text and actions |

```typescript
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';

// Structural — no translation
<UiSection ui={COMMON_LAYOUT.SECTION}>
  <UiDiv ui={COMMON_LAYOUT.WRAPPER}>

// Translatable — always pair with t()
<UiHeader ui={SETTINGS.TITLE}>{t(SETTINGS.TITLE)}</UiHeader>
```

**Never** use `COMMON_LAYOUT` for buttons or interactive controls — always use feature-specific identities.

### 5.6 Register a new feature in `registry.ts`

```typescript
// 1. Add exports (top and import block)
export { MY_FEATURE } from './features/my-feature';
import { MY_FEATURE } from './features/my-feature';

// 2. Add to UI_REGISTRY
export const UI_REGISTRY = {
  // ...existing
  MY_FEATURE,
} as const;

// 3. Add to ALL_UI_IDENTITIES flatten
...flattenObject(MY_FEATURE),
```

### 5.7 Category identities

Shared structural identities live in `src/platform/ui/registry/categories/`:

- `layout.ts` — `COMMON_LAYOUT` (CONTAINER, WRAPPER, SECTION, …)
- `typography.ts`, `forms.ts`, `media.ts`, `interactive.ts`, etc.

Do not duplicate these — import from `@/platform/ui/registry/categories`.

---

## 6. Phase C — Translations (i18n)

### 6.1 Locale files

```
src/platform/ui/i18n/locales/<feature>/ar.json
src/platform/ui/i18n/locales/<feature>/en.json
```

**Both files must have identical key sets** — validated by `npm run i18n:validate`.

### 6.2 JSON structure

Nested JSON mirrors dot-notation keys:

Registry path: `settings.app-settings.display.section-title`
Translation key: `settings.app-settings.sectionTitle`

```json
{
  "settings": {
    "page": {
      "title": "الإعدادات",
      "description": "…"
    },
    "app-settings": {
      "sectionTitle": "إعدادات التطبيق",
      "statusTitle": "حالة النظام"
    }
  }
}
```

### 6.3 Usage in components

```tsx
const { t, locale, setLocale } = useTranslation();

// Preferred — UI identity auto-resolves to key
{t(SETTINGS.TITLE)}

// Explicit key — also valid
{t('settings.page.title')}

// Dynamic keys — use TranslationKey type
{t(cat.nameKey)}
```

### 6.4 Route manifest

`src/platform/ui/i18n/core/i18n-route-manifest.ts` — longest prefix wins:

```typescript
{ prefix: '/settings', feature: 'settings' },
```

Without this entry, `useTranslation().feature` resolves incorrectly and boundary warnings appear.

### 6.5 Dictionary loading

Root layout loads the full dictionary via `getAppDictionaryCached()`.

For a **new feature**, add to both:

**`getDictionary.ts` — `APP_DICTIONARY_FEATURES`:**
```typescript
export const APP_DICTIONARY_FEATURES = [
  'common', 'splash', 'home', 'auth', 'shared-layout', 'error-boundary', 'settings',
  'my-feature',  // ← add here
] as const;
```

**`featureScope.ts` — `FEATURE_SCOPES`:**
```typescript
'my-feature': ['common', 'shared-layout', 'my-feature'],
```

This controls which namespaces merge when the route is active.

### 6.6 Localization boundary

Features may only access their own namespace + common/shared namespaces.

Cross-feature keys (e.g. using `home.categories.fashion` on the settings page) trigger dev warnings from `validateTranslationKey()`.

Put shared strings in `locales/common/` or duplicate under the feature if intentional.

### 6.7 Regenerate type definitions

After locale changes:

```bash
npm run i18n:generate-keys
```

Updates `src/platform/ui/i18n/translation-keys.d.ts` — required for ESLint i18n rules.

---

## 7. Phase D — React Page & Components

### 7.1 Directory structure

```
src/app/<route>/
  page.tsx              ← route entry
  layout.tsx            ← optional: AppShell or createFeatureLayout

src/components/<feature>/   ← optional decomposition
  SectionName.tsx

src/platform/ui/registry/features/<feature>.ts
src/platform/ui/i18n/locales/<feature>/{ar,en}.json
```

### 7.2 Layout patterns

**With app navigation (sidebar/header):**
```tsx
// app/settings/layout.tsx
import { AppShell } from '@/components/layouts/AppShell';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

**Minimal passthrough:**
```tsx
import { createFeatureLayout } from '@/platform/ui/server';

export default function MyLayout({ children }: { children: React.ReactNode }) {
  return createFeatureLayout({ children });
}
```

### 7.3 Client vs server

| Needs | Directive |
|-------|-----------|
| `useTranslation`, `useUnifiedStore`, event handlers | `'use client'` |
| Static rendering only | Server component (default) |

Root layout already provides `I18nProvider` — no per-page provider needed.

### 7.4 Ui* component mapping

Import from `@/platform/ui` only — **never** from `runtime/primitives/`.

| HTML | React |
|------|-------|
| `<button>` | `<UiButton ui={…}>` |
| `<input>` | `<UiInput ui={…}>` |
| `<select>` | `<UiSelect ui={…}>` |
| `<textarea>` | `<UiTextarea ui={…}>` |
| `<a href>` | `<UiLink ui={…}>` or Next.js `<Link>` |
| `<h1>`–`<h6>` | `<UiHeader ui={…} level={n}>` |
| `<section>` | `<UiSection ui={COMMON_LAYOUT.SECTION}>` |
| `<div>` (structural) | `<UiDiv ui={COMMON_LAYOUT.WRAPPER}>` |
| `<img>` | `<UiImage ui={…}>` |
| `<label>` | `<UiLabel ui={…}>` |

ESLint rule `noDirectNativeInteractiveElements` flags raw `<button>`, `<input>`, `<select>`, `<textarea>`, `<a>` in app code.

### 7.5 Component decomposition (scenario E)

Home page pattern — thin `page.tsx`, fat components:

```
src/app/home/page.tsx          → imports from components/home/
src/components/home/
  PromoBanner.tsx
  CategoriesGrid.tsx
  …
```

Each component: own imports of `SETTINGS`/`HOME` identities, `useTranslation`, `Ui*`.

### 7.6 Data attributes (automatic)

Every `Ui*` element receives:

```
data-ui-id="UI_SETTINGS_TITLE"
data-ui-path="settings.page.display.title"
data-ui-feature="settings"
data-ui-component="UiHeader"
```

Used by DevUiOverlay (dev only) and telemetry.

---

## 8. Phase E — Styling & SSOT

### 8.1 Non-negotiable rules

- Design System SSOT is the **only** styling source
- No inline `style={{ … }}` except `var(--gova-*)` CSS variables
- No Tailwind arbitrary values: `text-[14px]`, `bg-[#fff]`, `w-[45%]`
- No raw Tailwind palette: `bg-red-500`, `text-blue-600`
- No physical RTL classes: `ml-`, `mr-`, `pl-`, `pr-`, `text-left`, `text-right`, `left-`, `right-`

### 8.2 Allowed semantic token classes

From `src/app/globals.css` → use Tailwind utilities mapped to tokens:

| Purpose | Examples |
|---------|----------|
| Text | `text-primary`, `text-on-surface`, `text-on-surface-variant`, `text-error` |
| Background | `bg-surface`, `bg-surface-container`, `bg-primary`, `bg-white` |
| Border | `border-outline-variant`, `border-primary` |
| Surface levels | `bg-surface-container-low`, `bg-surface-container-high` |

### 8.3 SSOT Guard (development)

`SSOTGuard` in root layout scans DOM when `ssotGuardEnabled` is true in unified store.

Watch browser console for `[SSOT Guard]` warnings during development.

### 8.4 Icons & assets

| Asset | Rule |
|-------|------|
| Icons | Lucide React (`import { Settings } from 'lucide-react'`) |
| Images | `UiImage` wrapping Next.js Image |
| Fonts | Already loaded via `next/font` in root layout — do not add CDN fonts |

---

## 9. Phase F — State & Interactivity

### 9.1 Unified Store (SSOT)

`src/store/unified.store.ts` — use for:

| Preference | Store field | Setter |
|------------|-------------|--------|
| Language | `language` | `setLanguage` |
| Theme | `themeMode` | `setThemeMode` |
| Font size | `fontSize` | `setFontSize` |
| Density | `density` | `setDensity` |
| High contrast | `highContrast` | `setHighContrast` |
| Reduced motion | `reducedMotion` | `setReducedMotion` |
| SSOT Guard | `ssotGuardEnabled` | `setSSOTGuardEnabled` |

```tsx
'use client';
import { useUnifiedStore } from '@/store/unified.store';

const { themeMode, setThemeMode } = useUnifiedStore();
```

Root layout syncs store → HTML `lang`/`dir`/theme via `SSOTProvider` + `LocaleProvider`.

### 9.2 Scenario-specific patterns

| Pattern | Implementation |
|---------|----------------|
| Theme toggle buttons | `UiButton` + `setThemeMode('light' \| 'dark' \| 'system')` |
| Language switch | `setLanguage` or navigate to `/language` |
| Boolean toggle | `UiButton` styled as switch + `onClick={() => setX(!x)}` |
| Select / dropdown | `UiSelect` or native `<select>` only if no UiSelect fit (prefer UiSelect) |
| Forms | React Hook Form + Zod schema |
| Navigation | `window.location.href` or Next.js `useRouter().push()` |

### 9.3 Forbidden

- DOM manipulation from HTML `<script>` logic
- `document.querySelector` for UI state
- Hardcoded locale strings — always `t(identity)`

---

## 10. Phase G — Validation & CI

### 10.1 Required commands (in order)

```bash
npm run ci:i18n       # translations + bindings + regenerate key types
npm run typecheck     # TypeScript
npm run lint          # ESLint including ui-identification + i18n-enforcement
```

Build runs `ci:i18n` automatically: `npm run build` → `npm run ci:i18n && next build`.

### 10.2 What each script validates

| Script | Checks |
|--------|--------|
| `i18n:validate` | ar.json and en.json have identical key sets per feature |
| `i18n:validate-bindings` | Every registry identity has a matching translation key |
| `i18n:generate-keys` | Regenerates `translation-keys.d.ts` |
| `audit:unified-ui-i18n` | Full cross-system audit + source index |
| `audit:orphans` | Orphan registry entries / unused translations |
| `platform:doctor` | Runs typecheck + ci:i18n + audits |

### 10.3 ESLint enforcement

| Rule file | Enforces |
|-----------|----------|
| `enforcement/eslint/ui-identification.js` | No native `<button>`/`<input>`; requires `ui` prop |
| `enforcement/eslint/i18n-enforcement.js` | Valid `t()` keys; no hardcoded user strings |

Set `MIGRATION_MODE=true` to downgrade i18n lint errors to warnings during bulk migration.

---

## 11. Scenario Playbooks

### 11.1 Static page (scenario A)

1. Registry entries for every text element
2. Locale files with all keys
3. `page.tsx` with `UiHeader`, `UiSection`, `UiDiv`
4. No `'use client'` unless hooks needed

### 11.2 App shell page (scenario B)

1. All of scenario A
2. `layout.tsx`:
   ```tsx
   import { AppShell } from '@/components/layouts/AppShell';
   export default function Layout({ children }) {
     return <AppShell>{children}</AppShell>;
   }
   ```

### 11.3 Settings-style interactive page (scenario C)

Reference: `note/setting.html` → `/settings`

1. Full registry with section groups (`APP_SETTINGS`, `APPEARANCE`, …)
2. `'use client'` on page
3. Wire toggles to `useUnifiedStore`
4. Language buttons → `t(SETTINGS.LANGUAGE_REGION.ARABIC)` etc.
5. `AppShell` layout

### 11.4 Form page (scenario D)

1. Registry for every input, label, submit button, validation message
2. React Hook Form + Zod
3. `UiInput ui={FEATURE.FORM.EMAIL}`, `UiButton ui={FEATURE.FORM.SUBMIT}`
4. Error messages via `t(FEATURE.FORM.ERROR_REQUIRED)`

### 11.5 Extend existing feature (scenario F)

Example: add section to home page

1. Add identities to `features/home.ts` only
2. Add keys to `locales/home/ar.json` + `en.json`
3. Create `src/components/home/NewSection.tsx`
4. Import in `app/home/page.tsx`
5. Run `ci:i18n` — no manifest changes needed

### 11.6 Brand-new feature (scenario G)

Complete checklist from §3 — all 10 files.

---

## 12. Troubleshooting Matrix

| Symptom | Cause | Fix |
|---------|-------|-----|
| App crashes on start with `Invalid UI paths found` | camelCase in registry path | Use kebab-case segments |
| App crashes with `Duplicate UI paths` | Same path registered twice | Remove duplicate identity |
| Empty text on page | Missing locale key | Add key; run `i18n:validate-bindings` |
| `[i18n] Missing translation for key` | Key mismatch between registry and JSON | Recompute key with `generateTranslationKeyFromUi` |
| `[i18n] No translation key for source` | Used `COMMON_LAYOUT` identity with `t()` | Use feature identity or explicit key |
| `Localization boundary violation` | Cross-feature `t()` call | Move string to feature locale or common |
| `[UI Registry Error] Unknown UI Identity` | Invalid/missing `ui` prop | Register identity; pass `FEATURE.CONST` object |
| `[UI Registry Deprecation] Legacy string-based` | Passed path string instead of object | Use `HOME.X.Y` object, not string path |
| `[SSOT Guard] Forbidden class pattern` | `ml-`, arbitrary value, etc. | Use semantic tokens + logical properties |
| `Translation key does not exist` (ESLint) | Key not in generated types | Run `i18n:generate-keys` after locale update |
| Page missing sidebar | No AppShell layout | Add `layout.tsx` with AppShell |
| Theme/language change has no effect | Not wired to unified store | Use `useUnifiedStore` setters |
| CI build fails on i18n | Any of above | Run `npm run ci:i18n` locally first |

### Key collision debug workflow

```bash
# 1. List all registry paths
npm run i18n:validate-bindings

# 2. If bindings pass but text wrong — trace one identity:
#    path → generateTranslationKeyFromUi(path) → find in ar.json

# 3. Full audit
npm run audit:unified-ui-i18n
```

---

## 13. Reference Implementations

### Settings (canonical full conversion)

| Artifact | Path |
|----------|------|
| Source HTML | `note/setting.html` |
| Registry | `src/platform/ui/registry/features/settings.ts` |
| Locales | `src/platform/ui/i18n/locales/settings/` |
| Page | `src/app/settings/page.tsx` |
| Layout | `src/app/settings/layout.tsx` |

Demonstrates: AppShell, unified store, section groups, kebab-case paths, unique key suffixes.

### Home (decomposed feature)

| Artifact | Path |
|----------|------|
| Registry | `src/platform/ui/registry/features/home.ts` |
| Components | `src/components/home/` |
| Page | `src/app/home/page.tsx` |

Demonstrates: component decomposition, `COMMON_LAYOUT` + feature identities, dynamic `TranslationKey`s.

### Auth / Login

| Artifact | Path |
|----------|------|
| Registry | `src/platform/ui/registry/features/auth.ts` |
| Route | `src/app/login/page.tsx` |

---

## 14. Appendix — File Map & Commands

### Key files

| File | Purpose |
|------|---------|
| `src/platform/ui/registry/registry.ts` | Central registry + auto-validation |
| `src/platform/ui/registry/features/*.ts` | Per-feature identities |
| `src/platform/ui/registry/categories/` | Shared structural identities |
| `src/platform/ui/i18n/binding/registry-binding.ts` | Path → key mapping |
| `src/platform/ui/i18n/core/i18n-route-manifest.ts` | Route → feature |
| `src/platform/ui/i18n/core/getDictionary.ts` | Dictionary loading |
| `src/platform/ui/i18n/core/featureScope.ts` | Feature namespace scopes |
| `src/platform/ui/i18n/translation-keys.d.ts` | Generated key types |
| `src/design-system/*.css` | Design tokens |
| `src/app/globals.css` | Tailwind ↔ token bridge |
| `src/components/shared/SSOTGuard.tsx` | Dev styling enforcement |
| `src/store/unified.store.ts` | Preferences SSOT |

### Commands cheat sheet

```bash
# Minimum before PR
npm run ci:i18n && npm run typecheck && npm run lint

# Full health check
npm run platform:doctor

# Individual steps
npm run i18n:validate
npm run i18n:validate-bindings
npm run i18n:generate-keys
npm run audit:unified-ui-i18n
npm run audit:orphans
npm run ci:enforcement     # full CI gate
```

### Top 5 mistakes (must avoid)

1. **camelCase UI paths** — crashes registry at import time
2. **Translation key collisions** — duplicate `(page.section.element)` after binding drops component tier
3. **Missing locale entries** — empty UI + CI failure
4. **`COMMON_LAYOUT` on buttons** — missing translation + wrong semantic identity
5. **Forgetting `APP_DICTIONARY_FEATURES`** — new feature page shows untranslated keys at runtime

---

## Final Goal

Transform any HTML into:

> A fully modular, strongly typed, UI-identity tracked, SSOT-compliant Next.js page with zero styling fragmentation and full i18n support — passing all CI gates on first submission.

This is **not** HTML conversion. It is a **full architectural migration** into the Gova platform.
