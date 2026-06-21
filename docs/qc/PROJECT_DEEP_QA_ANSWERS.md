# GoVa Project — Deep QC Answer Key

**Companion to:** [PROJECT_DEEP_QA_QUESTIONS.md](./PROJECT_DEEP_QA_QUESTIONS.md)  
**Purpose:** Detailed answers so a reader gains end-to-end understanding of GoVa’s architecture, UUID system, registry, i18n, CI, Inspector, and MAOL.

---

## Section A — Architecture & Mental Model

### A1 — Four artifacts for a translatable button

When you add a user-visible, translatable button, **four artifacts** must stay aligned:

| # | Artifact | Location |
|---|----------|----------|
| 1 | **Registry identity** | `src/platform/ui/registry/features/<feature>.ts` — `id`, `path`, `uuid`, `feature`, `description`, `category` |
| 2 | **Locale strings** | `src/platform/ui/i18n/locales/<feature>/en.json` and `ar.json` — key derived from `path` |
| 3 | **DOM binding** | JSX intrinsic with `data-ui-uuid={FEATURE.GROUP.ELEMENT.uuid}` in `src/components/<feature>/` |
| 4 | **Generated wiring** | `uuid-manifest.json`, `registry-member-paths.json`, `source-index.ts` (via materialize / generate / audit scripts) |

**What breaks if only three are updated:**

- Registry + locales + JSX, **no materialize** → `registry:validate-uuids` / import-time `validateRegistry()` fails (manifest mismatch or missing UUID).
- Registry + locales + manifest, **no JSX** → `ci:uuid-dom-absolute` / `ci:uuid-dom-parity` fail; button invisible to Inspector/MAOL.
- Registry + JSX + manifest, **no locales** → `i18n:sync` / `i18n:validate` fail; runtime shows fallback or `TODO(ar):` for Arabic.
- Locales + JSX + manifest, **no registry entry** → ESLint `unknownPath`; `getUiIdentityByUuid()` returns undefined; Inspector cannot resolve metadata.

---

### A2 — Two-phase lifecycle (Phase 1 → Phase 2)

**Phase 1 (AGENT_FEATURE_CREATION):** Creates the **container scaffold** — route file, feature registry file, i18n locale stubs, and all `registry.ts` / member-paths / route-manifest wiring. JSX is minimal (often empty shell).

**Phase 2 (AGENT_UI_ELEMENTS):** Adds **concrete UI elements** — registry identity blocks, JSX with `data-ui-uuid`, translations, without re-touching central wiring if the feature already exists.

**Why two phases:**

1. **Wiring is a one-time cost** — import in `registry.ts`, `ALL_UI_IDENTITIES`, `UI_REGISTRY`, member-paths `ROOTS`, `i18n-route-manifest.ts`, `featureScope.ts`, `getDictionary.ts` must be correct before any JSX exists.
2. **CI isolation** — Phase 1 can pass `typecheck` + registry integrity without DOM parity. Phase 2 introduces JSX that must satisfy `ci:uuid-dom-*` and ESLint `require-data-ui-uuid`.
3. **Inventory derivation** — Phase 2 derives UI inventory from registry groups (FORM, GALLERY, etc.) rather than asking the user; Phase 1 guarantees the namespace exists.

If you merged both phases, a single mistake in TASK 9–10 (member-paths `ROOTS`) would surface only after JSX is written, mixing **wiring errors** with **UI placement errors**.

---

### A3 — Feature vs Page vs UI element

| Concept | Registry | Route | i18n namespace |
|---------|----------|-------|----------------|
| **Feature** | `registry/features/<name>.ts` — tree of groups and identities | Usually one primary route prefix (e.g. `/home` → `home`) | `locales/<feature>/` |
| **Page** | Uses identities from one or more features via `FEATURE_SCOPES` | `src/app/(app)/<path>/page.tsx` — thin re-export | Resolved by `I18N_ROUTE_MANIFEST` longest-prefix match |
| **UI element** | Leaf block with `id` + `path` + `uuid` | Bound in `src/components/<feature>/` | Key = `generateTranslationKeyFromUi(path)` |

A **page** is an App Router entry; a **feature** is the registry + locale bundle; a **UI element** is the smallest registered, UUID-addressable DOM unit.

---

### A4 — Why not `src/features/<feature>/page.tsx`?

GoVa standardizes on:

- **Routes:** `src/app/(app)/<route>/page.tsx` (Next.js App Router convention).
- **JSX:** `src/components/<feature>/` (feature content components).

Using `src/features/<feature>/page.tsx` would duplicate routing ownership, confuse generators (`generate-feature.ts` targets `app/` + `components/`), and split “where is the page?” across two trees. The `(app)` route group applies `AppShell` without polluting URLs.

---

### A5 — Text on `/home` → Arabic JSON (full trace)

Example: English language button label.

1. **Registry identity** — e.g. `HOME.LANGUAGE_SWITCHER.ENGLISH` with `path: 'home.language-switcher.english'`, `id: 'UI_HOME_LANG_ENGLISH'`, `uuid: '…'`.
2. **Translation key** — `generateTranslationKeyFromUi('home.language-switcher.english')` → `home.languageSwitch.english` (3-part path: page.section.element; kebab → camelCase on element).
3. **Locale file path** — feature = first segment → `src/platform/ui/i18n/locales/home/ar.json`.
4. **JSON nesting** — key `home.languageSwitch.english` → nested `{ "home": { "languageSwitch": { "english": "…" } } }`.
5. **Runtime resolution** — `I18nProvider` loads dictionary; `useBoundUI(HOME.LANGUAGE_SWITCHER.ENGLISH)` or `t(HOME.…)` calls `resolveTranslationKey` → looks up nested value.
6. **DOM** — `<button data-ui-uuid={HOME.LANGUAGE_SWITCHER.ENGLISH.uuid}>` connects visible text to registry UUID for Inspector/MAOL.

**4-part path note:** For `merchant.form.input.email-input`, the **component segment `input` is dropped** — key becomes `merchant.form.emailInput` (page.section + camelCase element from part 4).

---

## Section B — UUID System

### A6 — UUID seed: `id`, not `path`

`createDeterministicUiUuid(seed)` in `identity-uuid.ts` uses **`id`** as the seed when no manifest history exists:

```typescript
const source = `${UI_UUID_NAMESPACE}:${seed}`; // UI_UUID_NAMESPACE = 'gova.ui-registry'
```

`findManifestUuid(manifest, id, path)` in `registry-materialize-uuids.ts` resolves UUID by searching manifest entries (active + removed) matching `id`, `path`, `previousIds`, `previousPaths`, or `aliases`. Only if no match: `createDeterministicUiUuid(id)`.

**Why `id` not `path`:** `path` can change via `registry:move` (PATH_CHANGED in MAOL diff). **`id` is the stable logical name**; UUID must survive path moves. Path is tracked as metadata; UUID is immutable.

---

### A7 — Algorithm: `UI_HOME_LANG_ENGLISH` → UUID

1. Seed string: `gova.ui-registry:UI_HOME_LANG_ENGLISH`
2. Four FNV-1a 32-bit hashes with seeds 0,1,2,3 → eight hex digits each → 32 hex chars concatenated.
3. Format as UUID groups:
   - Group 1: chars 0–8
   - Group 2: chars 8–12
   - Group 3: `5` + chars 13–16 → **version 5** (name-based UUID convention in this project)
   - Group 4: force RFC variant — `(hex[16] & 0x3) | 0x8` → starts with `8`, `9`, `a`, or `b`
   - Group 5: chars 20–32

This produces a **deterministic, UUID-shaped** identifier — not a random v4 UUID. Same `id` always yields same UUID across machines.

---

### A8 — `uuid-manifest.json` vs inline `uuid:` fields

| | Inline in `registry/features/*.ts` | `uuid-manifest.json` |
|---|-------------------------------------|----------------------|
| **Role** | Source consumed at runtime/import | Generated audit trail + history |
| **Contains** | Current `uuid` on each identity block | All active identities + `removedIdentities` |
| **Authoritative** | **Registry `.ts` files** at runtime | Must **match** registry; validated by `validateRegistry()` |

If they disagree, **`validateRegistry()` throws at import** (`manifest mismatch` or `missing from uuid-manifest`). Fix: run `npm run registry:materialize-uuids`, never hand-edit UUIDs to “match” manifest.

---

### A9 — `removedIdentities`

When you **delete** an identity block from a feature registry file and run `registry:materialize-uuids`:

1. `buildManifest()` compares previous manifest identities to current scan.
2. UUIDs no longer in active registry move to **`removedIdentities`** with `lifecycle: 'removed'`.
3. **`validateRegistry()`** and **`registry:validate-uuids`** reject any active identity whose UUID appears in `removedIdentities`.

**Can that UUID be reused for a different identity?** **No.** Reuse triggers: `Removed UI UUIDs cannot be reused in active registry files`. You must assign a **new `id`** (new deterministic UUID) for genuinely new elements.

**Recovery:** Re-adding an identity with the **same `id`** (or alias/previousId) can recover the old UUID via `findManifestUuid()` searching `removedIdentities`.

---

### A10 — When hand-editing `uuid:` is forbidden

**Forbidden:**
- Changing UUID to “fix” a duplicate or CI error without understanding root cause.
- Copying UUID from another identity.
- Editing to match an old Inspector snapshot after identity was removed and recreated with new `id`.

**Correct fixes:**
- Run `npm run registry:materialize-uuids` for missing UUID injection.
- Use `previousIds` / `aliases` + materialize to preserve history across renames.
- For removed UUID conflicts, use a **new `id`**, not a new UUID on the same slot.

Hand-editing is **never** the correct fix when manifest/registry disagree — regenerate via tooling.

---

### A11 — Recover same UUID vs new UUID

**Same UUID recovered:**
- Delete `UI_MERCHANT_CARD_TITLE`, run materialize → UUID in `removedIdentities`.
- Re-add block with **same `id: 'UI_MERCHANT_CARD_TITLE'`** → `findManifestUuid` finds removed entry → same UUID re-materialized into `.ts`.

**New UUID assigned:**
- Re-add element with **new `id`** (e.g. `UI_MERCHANT_CARD_HEADING`) → no manifest match → `createDeterministicUiUuid(newId)`.
- Re-add with same path but **different id** and no alias linking → new UUID (path alone is not the deterministic seed).

**Alias recovery:** If new block lists old `id` in `aliases: ['UI_MERCHANT_CARD_TITLE']`, manifest lookup still finds the historical UUID.

---

## Section C — UI Registry

### A12 — `flattenObject()` leaf detection

A node is a **leaf identity** if the object has both **`id`** and **`path`** keys. Otherwise, values are recursed.

Intermediate keys like `LANGUAGE_SWITCHER` are **grouping objects** — they hold nested identities but are not leaves themselves. Only leaves enter `ALL_UI_IDENTITIES`.

---

### A13 — `ALL_UI_IDENTITIES` vs `registry-member-paths.json`

| | `ALL_UI_IDENTITIES` | `registry-member-paths.json` |
|---|---------------------|------------------------------|
| **Indexed by** | Flat list of identity objects | Dot paths: `HOME.PROMO_BANNER.TITLE` |
| **Used for** | Runtime lookup, i18n sync, MAOL | ESLint AST validation of `data-ui-uuid={HOME.PROMO_BANNER.TITLE.uuid}` |
| **Why ESLint needs member paths** | Raw paths like `home.promo.title` don’t tell you valid **JSX member expression** | Rule verifies `HOME.PROMO_BANNER.TITLE` is a real export path in the registry tree |

ESLint cannot accept dynamic variables — it must resolve static member chains against `registry-member-paths.json`.

---

### A14 — Import-time validation

Importing `@/platform/ui/registry/registry` runs **`validateRegistry()`** at module load (line 422).

**Fails at import time:**
- Duplicate paths, duplicate stable `id`s, duplicate UUIDs
- Missing or invalid UUID format
- Duplicate/conflicting aliases
- UUID missing from or mismatched with `uuid-manifest.json`
- Reused removed UUIDs
- Invalid lifecycle values
- Invalid path format (must match `page.section[.component].element`)

Any import of registry (including indirect via components) throws **before React renders**.

---

### A15 — `isTranslationRequiredForUiIdentity()` exclusions

Beyond `NO_TRANSLATION_REQUIRED` list:

1. **Unknown identity** — if path not found, returns `true` (safe default).
2. **`.dom.` in path** — structural/DOM-only identities (e.g. layout wrappers tracked for telemetry, not copy).
3. **`category === 'container'`** — containers hold structure; child leaves carry translatable text.

Examples:
- `NO_TRANSLATION_REQUIRED`: `merchant.hero.display.banner` (dynamic content only).
- `.dom.`: paths like `home.section.dom.wrapper`.
- `container`: `HOME.CURATED_OFFERS.CONTAINER` with `category: 'container'`.

---

### A16 — `repeatable: true`

**Registry:** Marks identities that may appear **multiple times** in one file (lists, gallery items).

**ESLint:** `require-data-ui-uuid` normally forbids the same registry path twice in one file; `repeatable: true` (in registry + `registry-member-paths` meta) exempts this.

**DOM:** Repeatable elements use **`data-ui-instance-id`** for disambiguation in Inspector; `getElementIdentityKey()` returns `` `${uuid}:${instanceId}` `` when instance id present.

**Inspector:** Each instance gets distinct `identityKey` for persisted bindings in `data/ui-inspector/elements/by-key/`.

---

### A17 — Banned `COMMON_*` and `DECORATIVE.*`

Category identities live in `registry/categories/` — shared structural vocabulary (layout sections, spacers, decorative shells).

**Why banned in product JSX:**
- They carry **no feature-specific semantics** — Inspector/MAOL cannot attribute telemetry to a product feature.
- Translations would land in `common.*` namespace, breaking feature-scoped locale files.
- Encourages lazy identity creation instead of proper registry entries.

ESLint reports `bannedGeneric` for paths like `COMMON_LAYOUT.MAIN` or `DECORATIVE.*` outside devtools.

---

## Section D — i18n & Translation Binding

### A18 — Path → key → file

`merchant.form.input.email-input`:

1. Split: `[merchant, form, input, email-input]`
2. 4-part rule: drop component segment `input` → element = `email-input`
3. camelCase: `emailInput`
4. Key: **`merchant.form.emailInput`**
5. Files: `locales/merchant/en.json`, `locales/merchant/ar.json`

---

### A19 — Full dictionary vs `FEATURE_SCOPES` / `I18N_ROUTE_MANIFEST`

`I18nProvider` / `getDictionary` loads the **full merged dictionary** for the app (not route-split chunks in current architecture).

**`I18N_ROUTE_MANIFEST`:** Maps URL prefix → **primary feature** (`resolveFeatureFromPathname`). Longest prefix wins. Used by Inspector page registry, route-scoped tooling, and documentation of which feature “owns” a URL.

**`FEATURE_SCOPES`:** Defines **which locale namespaces merge** for a feature (e.g. `merchant: ['common', 'shared-layout', 'merchant']`). Ensures pages that need shared chrome strings include `shared-layout` keys when scopes are resolved for client reload / validation — not for partial SSR dictionary loading in all code paths.

---

### A20 — `npm run i18n:sync`

Scans `ALL_UI_IDENTITIES`, generates required keys via `generateTranslationKeyFromUi`, writes missing keys to per-feature locale JSON files.

**Fallbacks when key missing:**
- **EN:** `description` from registry identity, or the key string itself.
- **AR:** `` `TODO(ar): ${description || key}` ``

---

### A21 — Why `t('merchant.form.emailLabel')` is forbidden

GoVa enforces **UUID-first, registry-bound translations**:

- **`i18n-enforcement/require-ui-i18n-binding`** — user-visible text must bind to a registry identity object.
- **`i18n-enforcement/validate-ui-i18n-alignment`** — translation keys must match `generateTranslationKeyFromUi(identity.path)`.
- **`i18n-enforcement/enforce-ui-translation-coupling`** — warns on decoupled keys.
- **CI:** `i18n:validate-bindings`, `audit:unified-ui-i18n`.

Preferred: `useBoundUI(MERCHANT.FORM.EMAIL_INPUT)` or `t(MERCHANT.FORM.EMAIL_INPUT)`.

---

### A22 — Missing `en.json` key: `ci:i18n` failure order

`ci:i18n` chain:

1. `registry:validate-uuids`
2. `i18n:sync` — **adds** missing keys with fallbacks (may not fail)
3. `i18n:validate` — **fails** if required keys still missing or AR still `TODO(ar):` where policy forbids
4. `i18n:validate-bindings` — registry ↔ locale alignment
5. `i18n:generate-keys` — generated keys file stale check

First hard failure is typically **`i18n:validate`** after sync if validation rules reject TODO placeholders or structure.

---

## Section E — DOM Binding, ESLint & CI

### A23 — `require-data-ui-uuid` requirements

**Every JSX intrinsic** (`<div>`, `<button>`, `<svg>`, `<path>`, etc.) must have:

```jsx
data-ui-uuid={FEATURE.GROUP.ELEMENT.uuid}
```

**Rejected even with attribute present:**
- Dynamic expression: `data-ui-uuid={someVar.uuid}` → `unknownPath`
- Banned generic paths → `bannedGeneric`
- Spread props hiding uuid on intrinsics → `forbiddenSpread`
- Same non-repeatable path twice in file → duplicate path error
- `<html>`, `<body>`, `<option>`, `<path>` inside SVG without own uuid

Member expression must match `registry-member-paths.json` exactly.

---

### A24 — Absolute vs parity

**Parity (`ci:uuid-dom-parity`):** Count of JSX intrinsics === count of elements with **any** `data-ui-uuid` attribute (devtools excluded).

**Absolute (`ci:uuid-dom-absolute`):** Each intrinsic’s uuid must be a **valid static registry member**; validates banned paths, legacy patterns, etc.

**Example passing parity, failing absolute:**

```jsx
<div data-ui-uuid={someVar.uuid} />
```

Parity: 1 intrinsic, 1 uuid attribute ✓  
Absolute: dynamic `someVar` → `unknownPath` ✗

Another example:

```jsx
<div data-ui-uuid="550e8400-e29b-41d4-a716-446655440000" />
```

Parity ✓ (literal attribute counts) — Absolute ✗ (must be `{HOME.X.Y.uuid}` member access, not raw string).

---

### A25 — Extra wrapper `<div>` without UUID

**Parity** counts all intrinsics vs uuid attributes. A wrapper `<div className="grid">` without uuid makes `intrinsics > withUuid` → **CI fail**.

**Inventory rule:** One registry identity maps to one bound intrinsic — layout wrappers should use the **container identity’s** uuid on the grid element itself, not an extra anonymous div.

---

### A26 — `MIGRATION_MODE=true`

In `i18n-enforcement.js`, when `MIGRATION_MODE === 'true'`, i18n rule severities downgrade from **`error` → `warn`**.

**Danger in production CI:** Violations slip through; hardcoded text, orphan keys, and misaligned bindings ship silently. Only use locally during bulk migrations — never in `ci:check`.

---

### A27 — `source-index.ts` from audit

**Problem solved:** MAOL `track-ui-identity-diff.ts` and Inspector need **source file + line + component** for each UUID. Scanning JSX at runtime is insufficient for CI diff tracking.

**Generation:** `audit:unified-ui-i18n` scans codebase, writes `UI_SOURCE_INDEX_BY_UUID` and `UI_SOURCE_INDEX` to `registry/source-index.ts`.

**Stale when:** JSX moves but audit not re-run → `maol:diff` reports wrong `COMPONENT_MOVED` or `--check-source-index` fails in audit.

---

## Section F — App Router, Features & Agent Runbooks

### A28 — Route group `(app)`

Next.js **route groups** `(name)` organize files without affecting URL. `(app)` wraps authenticated/in-app pages with **`AppShell`** via `src/app/(app)/layout.tsx`.

**Outside `(app)`:** Splash at `/` (`src/app/page.tsx`), devtools routes under `/devtools`, API routes — no AppShell chrome.

---

### A29 — New feature wiring (TASK 4–7, 9–10)

**Four `registry.ts` touchpoints (TASK 4–7):**
1. Import feature registry object
2. Re-export from registry index
3. Add to `UI_REGISTRY` map
4. Spread `flattenObject(FEATURE)` into `ALL_UI_IDENTITIES`

**Member paths (TASK 9–10):**
- Import in `generate-registry-member-paths.ts`
- Add feature key to `ROOTS` object

**If TASK 9–10 skipped:** ESLint `require-data-ui-uuid` reports **`unknownPath`** for `FEATURE.GROUP.ELEMENT.uuid` — CI fails even though registry identity exists.

---

### A30 — Inspector route discovery

**Live (preferred):** Client `loadPageRegistry()` fetches **`GET /api/devtools/app-routes`**, which runs server-only `discover-app-routes.ts` (fs scan of `src/app/**/page.tsx`).

**Fallback:** `src/platform/ui/devtools/app-route-manifest.json` (generated by `npm run routes:generate`), then hardcoded `INSPECTOR_ROUTES`.

New page appears in dropdown after API returns updated scan (dev server hot) or after `routes:generate` refreshes manifest for static fallback.

---

### A31 — Phase 2 forbids `registry.ts` edits

For **existing features**, new UI only adds blocks to `registry/features/<feature>.ts` — central `registry.ts` already imports that file.

**Insufficient if new URL prefix:** A **new page route** under an unlisted prefix (e.g. `/merchant/analytics`) needs **`I18N_ROUTE_MANIFEST`** entry so `resolveFeatureFromPathname` and Inspector feature labels resolve correctly. Without it, route falls through to `'common'`.

---

## Section G — UI Inspector & Devtools

### A32 — iframe communication

**Channel:** `UI_INSPECTOR_CHANNEL = 'gova-ui-inspector'` (`UiInspectorFrameBridge.ts`)

**Parent → iframe:** `REQUEST_SCAN`, `HIGHLIGHT`, `SCROLL`, `CLEAR_HIGHLIGHT`, `SET_PICK_MODE`, `CLEAR_BINDING_FRAMES`

**Iframe → parent:** `READY`, `SCAN_RESULT`, `ELEMENT_PICKED`

Transport: `window.postMessage` with same-origin check.

---

### A33 — Inspector persistence

**Primary layout:** `data/ui-inspector/`
- `elements/by-key/<safeFileName>.json`
- `bindings/by-key/`, `attributes/by-key/`
- `index.json`, `relationships/graph.json`, `routes/`, `snapshots/latest.json`

**Legacy mirror:** `data/ui-inspector-data.json`

**`identityKey`:** From `getElementIdentityKey()` — uses explicit `identityKey`, else `` `${uuid}:${instanceId}` ``, else `uuid` alone.

API: `src/app/api/ui-inspector/route.ts` via `inspector-persistence.service.ts`.

---

### A34 — Server/client split for route discovery

`discover-app-routes.ts` uses Node **`fs`** — cannot bundle into client components.

`InspectCollectorLoader` (client) previously imported inspector routes that pulled fs → **`Can't resolve 'fs'`** build error.

**Fix:** `inspector-route-utils.ts` (client-safe labels/exclusions) + server-only `discover-app-routes.ts` + JSON manifest fallback without fs on client.

---

## Section H — MAOL & Observability

### A35 — MAOL DOM summary

`generateDomSummary()` in `dom-summary.ts`:

1. `querySelectorAll('[data-ui-uuid]')`
2. For each element, `getUiIdentityByUuid(uuid)` → `feature`, `id`
3. Groups by **feature** into `MaolComponentNode` list (uiIds, tags)
4. In production, non-interactive tags may be filtered; dev includes all

UUID is the **join key** between DOM and registry metadata.

---

### A36 — `maol:diff` / `track-ui-identity-diff.ts`

Compares current `ALL_UI_IDENTITIES` snapshot (enriched with `UI_SOURCE_INDEX_BY_UUID`) against previous `ui-identity-snapshot.json`.

**Event types:** `ADDED`, `REMOVED`, `ID_CHANGED`, **`PATH_CHANGED`**, `FEATURE_REASSIGNED`, `COMPONENT_MOVED`, `DEPRECATED`, `RESTORED`, `VERSION_BUMPED`

**`PATH_CHANGED`:** Same UUID, `before.path !== after.path` — **allowed** intentional move; UUID preserved.

**Forbidden UUID reuse:** Detected separately by **`validateRegistry()`** / **`registry:validate-uuids`** checking `removedIdentities` — not by maol:diff alone. MAOL logs removal; reuse attempt fails CI at registry validation.

---

## Section I — Pipeline Integration & Failure Diagnosis

### A37 — Minimum command sequence after registry edit

After adding identities to `registry/features/<feature>.ts`:

```bash
npm run registry:materialize-uuids   # inject uuid/lifecycle; refresh uuid-manifest.json
npm run registry:generate            # member-paths, i18n keys, route manifest helpers
npm run i18n:sync                    # add locale keys
npm run audit:unified-ui-i18n        # refresh source-index.ts
npm run ci:check                     # full validation
```

| Step | Regenerates / validates |
|------|-------------------------|
| materialize-uuids | Inline `uuid:`, `uuid-manifest.json` |
| registry:generate | `registry-member-paths.json`, related artifacts |
| i18n:sync | `locales/*/*.json` missing keys |
| audit:unified-ui-i18n | `source-index.ts` |
| ci:check | Entire enforcement stack |

---

### A38 — Five checks for specific failures

| Failure | Catching check |
|---------|----------------|
| (a) Manual UUID edit | `registry:validate-uuids` manifest mismatch; `validateRegistry()` at import; git HEAD comparison in validate script |
| (b) Missing Arabic key | `i18n:validate`; `i18n:sync` then validate for `TODO(ar):` |
| (c) Unregistered `data-ui-uuid` | ESLint `require-data-ui-uuid`; `ci:uuid-dom-absolute` |
| (d) Stale `source-index.ts` | `audit:unified-ui-i18n --check-source-index` |
| (e) Reuse of removed UUID | `registry:validate-uuids`; import-time `reusedRemovedUuids` in `validateRegistry()` |

---

### A39 — “Duplicate UI UUIDs found in registry” — three root causes

1. **Copy-paste identity block** — two blocks manually given same `uuid:` string. Confirm: grep uuid in `registry/features/`. Fix: materialize fresh or restore one block’s unique id.

2. **Materialize not run after merge conflict** — duplicate blocks from bad merge. Confirm: `getDuplicateUiUuids()` lists same UUID twice. Fix: resolve duplicate blocks, re-run materialize.

3. **Alias/history collision** — two identities resolved to same manifest UUID via `findManifestUuid` matching overlapping aliases. Confirm: check `aliases`, `previousIds` fields. Fix: disambiguate aliases, use new `id` for genuinely new element.

---

### A40 — UUID dependency across subsystems

| Subsystem | UUID dependency | If UUID enforcement removed |
|-----------|-----------------|------------------------------|
| Registry import | **Critical** — validateRegistry always runs | App may boot with corrupt identity graph |
| ESLint / CI DOM | **Critical** — absolute + parity | Unmarked DOM; no enforcement |
| i18n binding | **High** — identity objects carry uuid | Text could work via raw keys; binding rules weaken |
| Inspector | **Critical** — scans `data-ui-uuid` | Element selection breaks |
| MAOL | **Critical** — DOM summary by uuid | Telemetry tree empty/wrong |
| Inspector persistence | **High** — keyed by uuid/identityKey | Orphaned config files |
| Translations | **Medium** — keys from path, not uuid | Locales mostly independent |
| App Shell / routing | **Low** — routes don’t need uuid | Unaffected |

**Rough assessment:** ~**75–85%** of platform UI infrastructure depends on UUID as primary key. Product might **partially render** (React + raw text), but **CI would not exist as designed**, Inspector/MAOL would be blind, and registry import validation would lose its anchor for identity lifecycle.

**Fails at import:** Duplicate/missing/invalid UUID, manifest mismatch, removed UUID reuse.

**Fails at CI:** DOM absolute/parity, i18n bindings, stale manifests, source-index.

**Partially works without UUID:** Plain Next.js routing and non-bound hardcoded text (already forbidden by lint).

---

## Quick Reference — Key Files

| Concern | File |
|---------|------|
| UUID algorithm | `src/platform/ui/registry/identity-uuid.ts` |
| Materialize + manifest | `scripts/registry-materialize-uuids.ts` |
| Import validation | `src/platform/ui/registry/registry.ts` → `validateRegistry()` |
| Translation key derivation | `src/platform/ui/i18n/binding/registry-binding.ts` |
| Route → feature | `src/platform/ui/i18n/core/i18n-route-manifest.ts` |
| ESLint UUID rule | `src/platform/ui/enforcement/eslint/require-data-ui-uuid.js` |
| CI DOM scans | `scripts/ci-uuid-dom-absolute.ts`, `scripts/ci-uuid-dom-parity.ts` |
| Inspector bridge | `src/platform/ui/devtools/UiInspectorFrameBridge.ts` |
| Inspector storage | `data/ui-inspector/` |
| MAOL diff | `src/platform/ui/enforcement/scripts/track-ui-identity-diff.ts` |
| Full CI chain | `package.json` → `ci:check` |

---

*Version: 1.0 — aligned with GoVa registry-first architecture (2026-06).*
