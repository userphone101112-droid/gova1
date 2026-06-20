# Strict UI & Page Creation Rules

Mandatory rules for adding pages, UI elements, and routes in GoVa. Violations fail ESLint, CI, or build.

> **Language & translations:** All copy, locale files, i18n commands, and translation binding rules are documented in **[i18n.md](./i18n.md)**. Read that file before adding any user-visible text.

> **Theme & design system:** Colors, spacing, typography, dark mode, density, and all visual validation commands are documented in **[THEME_RULES.md](./THEME_RULES.md)**. Read that file before styling any element.

---

## Core Principle: UUID-First Registry

Every DOM element in application UI must be:

1. **Registered** in the UI registry (`src/platform/ui/registry/`)
2. **Bound** to the DOM via `data-ui-uuid={REGISTRY.PATH.uuid}`
3. **Translated** via `t(REGISTRY.IDENTITY)` when it carries user-facing copy (see [i18n.md](./i18n.md))

There is no alternative pattern. Legacy `Ui*` components, runtime factories, and `data-ui-id` / `data-ui-path` are **forbidden**.

---

## 1. App Router Structure

### Layout hierarchy

| File | Role |
|------|------|
| `src/app/layout.tsx` | Root: fonts, `I18nProvider`, `SSOTProvider`, `LocaleProvider`, conditional `MaolProvider` |
| `src/app/page.tsx` | Splash screen at `/` — **outside** the app shell |
| `src/app/(app)/layout.tsx` | Wraps in-app pages with `AppShell` (header, sidebar, bottom nav) |
| `src/app/(app)/*/page.tsx` | Application pages (`/home`, `/login`, `/settings`, …) |
| `src/app/(app)/error.tsx` | Route error boundary |
| `src/app/(app)/not-found.tsx` | 404 inside app shell |
| `src/app/devtools/` | Developer tools (UI Inspector) |
| `src/app/api/` | API routes |

### Route conventions

- Route group `(app)` does **not** appear in the URL.
- `/` is splash only. All authenticated/in-app experiences live under `(app)`.
- Pages should stay **thin**: import composed components from `src/components/<feature>/`, not inline large JSX trees.
- Root `html` and `body` already carry registry UUIDs from `SHARED_LAYOUT` in `layout.tsx`.

### Adding a new page — required steps

1. Create `src/app/(app)/<route>/page.tsx` (or outside `(app)` if the page must not use `AppShell`).
2. Register all UI identities in `src/platform/ui/registry/features/<feature>.ts`.
3. Run registry pipeline (see §5).
4. Wire i18n route + dictionary scope (see [i18n.md § Route → Feature Mapping](./i18n.md#route--feature-mapping)):
   - `src/platform/ui/i18n/core/i18n-route-manifest.ts` — add `{ prefix, feature }`
   - `src/platform/ui/i18n/core/featureScope.ts` — add merge scope
   - `src/platform/ui/i18n/core/getDictionary.ts` — add to `APP_DICTIONARY_FEATURES`
5. Sync translations: `npm run i18n` (details in [i18n.md](./i18n.md)).
6. Pass full CI before merge: `npm run ci:check`.

---

## 2. UI Registry Rules

### Source of truth

| Location | Purpose |
|----------|---------|
| `src/platform/ui/registry/features/*.ts` | Feature-specific identities |
| `src/platform/ui/registry/categories/*.ts` | Shared structural categories (`COMMON_*`, `DECORATIVE`) |
| `src/platform/ui/registry/registry.ts` | Aggregated registry, runtime lookup, validation |
| `src/platform/ui/registry/uuid-manifest.json` | Generated UUID manifest |
| `src/platform/ui/registry/registry-member-paths.json` | Generated paths for ESLint/CI validation |

### Identity fields (all required)

| Field | Rule |
|-------|------|
| `id` | Stable ID: `UI_<FEATURE>_<SECTION>_<ELEMENT>` |
| `path` | Dot path: `feature.section.element` or `feature.section.role.element` (3–4 segments, kebab-case segments) |
| `uuid` | Deterministic from `id` via `createDeterministicUiUuid()` — **never edit manually** |
| `category` | One of: `action`, `input`, `navigation`, `display`, `container` |
| `feature` | Feature namespace (usually first path segment) |
| `lifecycle` | `active`, `deprecated`, or `removed` |
| `description` | Human-readable; used as EN fallback by `i18n:sync` |

### Path format

```
feature.section.role.element   ← preferred for semantic elements
feature.section.element        ← 3-part paths also supported
feature.dom.<component>.<name> ← structural containers (no translation)
```

Role segments (`display`, `actions`, `form`, `layout`) describe UI identity and are **dropped** when generating translation keys. See [i18n.md § UI Path → Translation Key](./i18n.md#ui-path--translation-key).

### Categories and translation

| Category | Translation required? |
|----------|----------------------|
| `display`, `action`, `input`, `navigation` | Yes (unless in `NO_TRANSLATION_REQUIRED`) |
| `container` | No — structural only |
| Paths containing `.dom.` | No — auto-generated layout wrappers |
| `common.*` category paths | No — shared non-text primitives |
| `DECORATIVE.*` | No — spacers/dividers only, **no visible text** |

---

## 3. DOM Binding: `data-ui-uuid`

### Mandatory pattern

Every **intrinsic JSX element** (`div`, `button`, `span`, `svg`, `path`, `h1`, …) must carry:

```tsx
<div data-ui-uuid={HOME.HERO.TITLE.uuid}>
  {t(HOME.HERO.TITLE)}
</div>
```

### Strict rules (ESLint + CI)

| Rule | Detail |
|------|--------|
| **Absolute binding only** | Must be `data-ui-uuid={REGISTRY.PATH.uuid}` — a static member expression ending in `.uuid` |
| **No variables** | No string literals, no computed values, no `{uuidVar}` |
| **No spread props** | `{...props}` forbidden on intrinsics |
| **No inheritance** | Parent UUID does not cover children — every intrinsic gets its own |
| **Known path** | Path must exist in `registry-member-paths.json`; unknown → `registry:add` |
| **No duplicates** | Same path twice in one file forbidden unless identity has `repeatable: true` |
| **Repeatable identities** | Must also set `data-ui-instance-id` on each instance |

### Banned registry paths in app code

Do **not** use these in `src/components/` or `src/app/`:

- `COMMON_*` generic categories
- `DECORATIVE.*`
- `*.STRUCTURE.*`
- `DEVTOOLS.*` (except inside `src/app/devtools/` and `src/platform/ui/devtools/`)

Use dedicated feature-scoped identities instead.

### Exemptions

- Test files (`.test.`, `.spec.`), Storybook files
- Provider wrappers: `Suspense`, `I18nProvider`, `LocaleProvider`, `QueryClientProvider`, `ThemeProvider`, `FormProvider`, `ErrorBoundary`
- `Fragment`
- `src/platform/ui/devtools/ui-inspector/**` — ESLint UUID rule disabled
- `src/platform/ui/enforcement/**`, devtools enforcement paths in CI scans

---

## 4. Component Authoring Pattern

### Required imports

```tsx
'use client'; // when using hooks
import { FEATURE_NAME, useTranslation } from '@/platform/ui';
// or: import { FEATURE_NAME } from '@/platform/ui/registry/features/<feature>';
```

### Checklist per visible element

- [ ] Identity registered in `registry/features/<feature>.ts`
- [ ] `data-ui-uuid={FEATURE.SECTION.ELEMENT.uuid}` on the native element
- [ ] `{t(FEATURE.SECTION.ELEMENT)}` for all user-visible strings (see [i18n.md](./i18n.md))
- [ ] Semantic design tokens only — see [THEME_RULES.md](./THEME_RULES.md)
- [ ] No hardcoded English/Arabic literals in JSX, attributes, or user-facing object props

### Forbidden patterns

```tsx
// ❌ Legacy components
<UiButton ui={...}>Save</UiButton>

// ❌ Hardcoded text
<button>Save</button>

// ❌ String translation key when identity exists
{t('home.hero.title')}

// ❌ Hardcoded visuals (see THEME_RULES.md)
<div className="bg-blue-500" style={{ color: '#333' }}>

// ❌ Legacy attributes
<div data-ui-id="..." data-ui-path="...">
```

### Allowed pattern

```tsx
// ✅ Registry identity + UUID + translation + semantic tokens
<button data-ui-uuid={HOME.HERO.CTA_BUTTON.uuid} className="bg-primary text-on-primary ms-4 text-start">
  {t(HOME.HERO.CTA_BUTTON)}
</button>
```

---

## 5. Registry CLI Workflow

After **any** registry change:

```powershell
npm run registry:materialize-uuids
npm run registry:generate
npm run i18n
```

### Commands

| Command | Purpose |
|---------|---------|
| `registry:add` | Add identity: `--file --id --path --description --category [--feature]` |
| `registry:move` | Move/rename identity by uuid/id/path — UUID stays immutable |
| `registry:remove` | Remove identity; preserved in manifest `removedIdentities` |
| `registry:materialize-uuids` | Inject deterministic UUIDs; write `uuid-manifest.json` |
| `registry:generate` | Regenerate member paths + source index via unified audit |
| `registry:validate-uuids` | CI: manifest integrity, no duplicate/reused UUIDs, immutability vs git HEAD |

### Example: add identity

```powershell
npm run registry:add -- `
  --file src/platform/ui/registry/features/home.ts `
  --id UI_HOME_PROMO_BANNER_TITLE `
  --path home.promo.display.title `
  --description "Promo banner title" `
  --category display
```

Then materialize, generate, and sync i18n.

---

## 6. Route Design

### URL → i18n feature mapping

Every route prefix must map to an i18n feature in `I18N_ROUTE_MANIFEST`. Longest prefix wins.

Current mappings (extend when adding routes):

| Prefix | Feature |
|--------|---------|
| `/devtools` | `devtools` |
| `/settings` | `settings` |
| `/onboarding` | `onboarding` |
| `/merchant` | `merchant` |
| `/notifications`, `/favorites`, `/orders`, `/profile` | `shared-layout` |
| `/home` | `home` |
| `/registration`, `/login` | `auth` |
| `/` | `splash` |

Full details: [i18n.md § Route → Feature Mapping](./i18n.md#route--feature-mapping).

### Dictionary scopes

`FEATURE_SCOPES` controls which locale namespaces merge per route. When a page needs layout strings + feature strings, include both in scope (e.g. `merchant` merges `common`, `shared-layout`, `merchant`).

### Localization boundaries

Components may only call `t()` with keys from their current route feature or shared namespaces (`common`, `shared-layout`, `error-boundary`, etc.). Cross-feature keys fail boundary validation. See [i18n.md § Localization Boundaries](./i18n.md#localization-boundaries).

---

## 7. Feature Scaffolding

```powershell
npx tsx scripts/generate-feature.ts <feature-name> [--no-layout] [--no-page]
```

**Feature name:** `^[a-z][a-z0-9-]*$` (lowercase, hyphens allowed).

**Creates:**

- `src/platform/ui/registry/features/<name>.ts`
- `src/platform/ui/i18n/locales/<name>/{en,ar}.json`
- `src/features/<name>/` scaffolds (layout, page, bindings)

**Does NOT create automatically:**

- App Router page under `src/app/(app)/`
- Entries in `I18N_ROUTE_MANIFEST`, `FEATURE_SCOPES`, `APP_DICTIONARY_FEATURES`

After generation, complete all manual wiring from §1 and §6, then run the full registry + i18n pipeline.

> **Note:** Live pages today live in `src/app/(app)/` + `src/components/`. The generator scaffolds `src/features/` — you must connect the route yourself.

---

## 8. Testing & Verification

There is no separate Jest suite for every page. Compliance is enforced by ESLint RuleTester + CI AST scans. **Every new page/element must pass these before merge.**

### ESLint UI tests

```powershell
npm run test:eslint-ui
```

Runs:

1. `require-data-ui-uuid.test.js` — validates UUID rule behavior (valid/invalid patterns)
2. `ui-uuid-ban.test.js` — ensures `registry/ui-uuid.ts` and its imports do not exist

### Lint (includes all enforcement plugins)

```powershell
npm run lint
```

Active plugins for UI work:

| Plugin | Key rules |
|--------|-----------|
| `ui-registry` | `require-data-ui-uuid`, `no-legacy-ui-imports`, `validate-registry-uniqueness` |
| `i18n-enforcement` | `no-hardcoded-text`, `validate-translation-keys`, … |

Full i18n rule list: [i18n.md § ESLint Enforcement](./i18n.md#eslint-enforcement). Theme/design-token rules: [THEME_RULES.md § ESLint Enforcement](./THEME_RULES.md#7-eslint-enforcement).

Set `MIGRATION_MODE=true` to downgrade i18n ESLint errors to warnings during migration only — not for new code.

### CI scans (must pass)

| Script | What it verifies |
|--------|------------------|
| `ci:uuid-dom-absolute` | AST scan: every intrinsic has valid absolute UUID; no legacy patterns |
| `ci:uuid-dom-parity` | `count(intrinsics) === count(data-ui-uuid)` across `src/` |
| `ci:registry-integrity` | Materialized UUIDs, member paths, source index in sync |
| `ci:ui-legacy-guard` | No `Ui*`, runtime imports, legacy data attributes |
| `ci:project-legacy-scan` | Extended legacy pattern scan including generators |
| `ci:i18n` | Registry UUIDs + translation sync/validate/bindings/types |
| `audit:unified-ui-i18n` | Full UI ↔ i18n coupling audit; updates source index |
| `audit:orphans` | Unused translations, orphan identities, missing locale pairs |
| `maol:diff` | UUID snapshot/changelog (informational, does not fail CI on changes) |

Theme validation (`validate:theme`) is documented in [THEME_RULES.md § Testing & Validation Commands](./THEME_RULES.md#8-testing--validation-commands).

### Full pre-merge gate

```powershell
npm run ci:check
```

Also runs automatically on `npm run build` (via `prebuild` for i18n subset).

### Manual verification checklist

After implementing a page or element:

- [ ] `npm run lint` — zero errors in touched files
- [ ] `npm run test:eslint-ui` — passes
- [ ] `npm run ci:uuid-dom-absolute` — no missing/invalid UUIDs
- [ ] `npm run i18n` — translations synced and validated
- [ ] `npm run validate:theme` — no token violations ([THEME_RULES.md](./THEME_RULES.md))
- [ ] Browser: switch `en` ↔ `ar`, confirm RTL layout and translated copy
- [ ] Browser: no `[missing:key]` markers in development

---

## 9. MAOL & Inspector Integration

Elements registered with `data-ui-uuid` are discoverable by:

- **MAOL** — DOM scan via `querySelectorAll('[data-ui-uuid]')`; requires `NEXT_PUBLIC_MAOL_ENABLED=true`
- **UI Inspector** — devtools at `/devtools/ui-inspector`

If an element is not in the registry, it will not appear in telemetry or inspector source mapping. See `docs/tools/MAOL_GUIDE.md` for observability setup.

`npm run registry:generate` and `audit:unified-ui-i18n` maintain `source-index.ts` mapping identities to source files/lines.

---

## 10. Legacy & Migration (Do Not Use)

These patterns are **blocked** by ESLint and CI:

| Forbidden | Replacement |
|-----------|-------------|
| `UiButton`, `UiDiv`, … | Native HTML + `data-ui-uuid` |
| `createUiComponent`, `createUiStyledComponent` | Native HTML + registry identity |
| `@/platform/ui/runtime` | `@/platform/ui` |
| `data-ui-id`, `data-ui-path`, `data-ui-feature` | `data-ui-uuid={REGISTRY.PATH.uuid}` |
| `uiUuid()` helper | Registry `.uuid` member |
| `registry/ui-uuid.ts` | Removed — must not exist |

UUIDs are **immutable**. To rename or move an element, use `registry:move` — never change `uuid` manually.

---

## 11. Quick Reference: New Page End-to-End

```
1. Plan route URL and i18n feature name
2. registry:add (or edit registry/features/<feature>.ts)
3. npm run registry:materialize-uuids && npm run registry:generate
4. Create src/app/(app)/<route>/page.tsx (thin wrapper)
5. Create src/components/<feature>/*.tsx with UUID + t()
6. Update i18n-route-manifest.ts, featureScope.ts, APP_DICTIONARY_FEATURES
7. npm run i18n
8. npm run ci:check
9. Manual test: en/ar, RTL, no missing keys
```

---

## Related Documentation

| Document | Contents |
|----------|----------|
| **[i18n.md](./i18n.md)** | Translation keys, locale files, `useTranslation()`, i18n CI, ESLint i18n rules |
| **[THEME_RULES.md](./THEME_RULES.md)** | Design tokens, theme modes, dark mode, `validate:theme`, ESLint design-token rules |
| [MAOL_GUIDE.md](./MAOL_GUIDE.md) | Observability and session ingest |
| [SERVER_ARCHITECTURE.md](./SERVER_ARCHITECTURE.md) | API routes and server layout |
| `docs/audits/unified-ui-i18n-audit.md` | Generated audit report (after `audit:unified-ui-i18n`) |
| `docs/audits/identity-audit.md` | Generated identity usage report |
