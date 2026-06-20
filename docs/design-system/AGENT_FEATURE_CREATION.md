# Agent Runbook: Create a New Feature (Zero-Error Protocol)

**Status:** Mandatory. Non-negotiable.  
**Audience:** Any AI agent that creates a **brand-new feature namespace** in GoVa.  
**Goal:** Working App Router feature — zero registry, i18n, UUID, or lint errors.

> **New agent?** Read **[AGENT_PROJECT_PHILOSOPHY.md](./AGENT_PROJECT_PHILOSOPHY.md)** first for project design and runbook selection.

> **Wrong runbook?** Adding a page to a feature that **already exists** → stop here. Use **[AGENT_PAGE_CREATION.md](./AGENT_PAGE_CREATION.md)** only.

---

## Execution Protocol (Read Before TASK 1)

You are a **weak executor**. You do **not** design, infer, optimize, or choose alternatives. You **only** follow TASKs in order.

### Rules

| # | Rule |
|---|------|
| R1 | Execute **TASK 0 → TASK 21** in order. |
| R2 | **Never** start TASK *N+1* until TASK *N* is **PASS**. |
| R3 | After every TASK, print the **Progress Report** block (template at bottom). |
| R4 | On **FAIL** or **STOP**: halt immediately. Do not skip ahead. |
| R5 | Never type or edit a `uuid` field by hand. |
| R6 | Never use `t('string.key')` when a registry identity exists. |
| R7 | Never create `src/features/<feature>/page.tsx` or `layout.tsx`. |
| R8 | Never run `git commit` / `git push` unless the user explicitly asked. |

### PASS / FAIL / STOP

| Status | Meaning |
|--------|---------|
| **PASS** | Every verification item in the TASK succeeded. Proceed to next TASK. |
| **FAIL** | A verification item failed. Fix only what the TASK allows. Re-run the **same** TASK. |
| **STOP** | Hard blocker (invalid input, feature exists, user must decide). Do **not** continue. Report to user. |

---

## TASK 0 — Select Runbook

**Objective:** Confirm this is a **new feature** task.

Answer these questions. **All must be YES** to continue with this file.

| # | Question | Required answer |
|---|----------|-----------------|
| 0.1 | Did the user ask to create a **new feature** (new namespace)? | YES |
| 0.2 | Does `src/platform/ui/registry/features/<feature>.ts` **not** exist yet? | YES |
| 0.3 | Is the user **not** asking to add a page to `merchant`, `auth`, `settings`, etc.? | YES |

If **any** answer is NO → **STOP**. Use [AGENT_PAGE_CREATION.md](./AGENT_PAGE_CREATION.md) or ask the user.

**Progress Report:** `TASK 0: PASS — correct runbook selected`

⛔ **Do not start TASK 1 until TASK 0 is PASS.**

---

## TASK 1 — Resolve Inputs

**Objective:** Fill every placeholder. No code until this TASK passes.

### User must provide (or you derive exactly as shown)

| Placeholder | Rule | Example |
|-------------|------|---------|
| `<feature>` | User value or route name | `test1` |
| `<UPPER>` | `<feature>` → uppercase, `-` → `_` | `TEST1` |
| `<route>` | Default: `/<feature>` unless user gave another | `/test1` |
| `<PascalPage>` | `<feature>` → PascalCase + `Page` | `Test1Page` |

### Validation commands (run mentally or with regex)

| Field | Regex | On fail |
|-------|-------|---------|
| `<feature>` | `^[a-z][a-z0-9-]*$` | **STOP** — report invalid name |
| `<route>` | `^/[a-z][a-z0-9/-]*$` | **STOP** |

### Write down (mandatory)

```text
feature=<feature>
UPPER=<UPPER>
route=<route>
PascalPage=<PascalPage>
registryFile=src/platform/ui/registry/features/<feature>.ts
routeFile=src/app/(app)/<route-without-leading-slash>/page.tsx
localesDir=src/platform/ui/i18n/locales/<feature>/
```

**Verification**

- [ ] All placeholders written in the block above
- [ ] Regex validation passed

**Progress Report:** `TASK 1: PASS — inputs resolved: feature=<feature>, route=<route>`

⛔ **Do not start TASK 2 until TASK 1 is PASS.**

---

## TASK 2 — Pre-flight: Feature Must Not Exist

**Objective:** Prove you will not overwrite existing work.

### Check these paths — **none** may exist

| # | Path |
|---|------|
| 2.1 | `src/platform/ui/registry/features/<feature>.ts` |
| 2.2 | `src/platform/ui/i18n/locales/<feature>/` |
| 2.3 | `src/app/(app)/<route-without-leading-slash>/page.tsx` |
| 2.4 | `src/features/<feature>/` |

### PowerShell (optional)

```powershell
Test-Path "src/platform/ui/registry/features/<feature>.ts"
Test-Path "src/platform/ui/i18n/locales/<feature>"
Test-Path "src/app/(app)/<route-without-leading-slash>/page.tsx"
Test-Path "src/features/<feature>"
```

All must return **False**.

If **any** exists → **STOP** — report: `Feature <feature> already exists. Use AGENT_PAGE_CREATION.md to add a page instead.`

**Progress Report:** `TASK 2: PASS — no collision paths found`

⛔ **Do not start TASK 3 until TASK 2 is PASS.**

---

## TASK 3 — Run Feature Generator

**Objective:** Scaffold registry + locales only.

### Command (copy exactly — flags mandatory)

```powershell
npm run generate:feature -- <feature> --no-layout --no-page
```

### Allowed outputs

- `src/platform/ui/registry/features/<feature>.ts`
- Patches to `src/platform/ui/registry/registry.ts` (partial)
- `src/platform/ui/i18n/locales/<feature>/en.json`
- `src/platform/ui/i18n/locales/<feature>/ar.json`
- `src/features/<feature>/bindings.ts` (deleted in TASK 5)

### Forbidden outputs

- `src/features/<feature>/page.tsx`
- `src/features/<feature>/layout.tsx`

**Verification**

- [ ] Command exit code `0`
- [ ] `registryFile` exists
- [ ] `localesDir/en.json` exists
- [ ] `localesDir/ar.json` exists
- [ ] `page.tsx` under `src/features/<feature>/` does **not** exist

On non-zero exit → **FAIL** — read error, fix cause (usually name collision), re-run **TASK 3**.

**Progress Report:** `TASK 3: PASS — generator completed`

⛔ **Do not start TASK 4 until TASK 3 is PASS.**

---

## TASK 4 — Verify `registry.ts` Import

**Objective:** First of four mandatory `registry.ts` touchpoints.

**File:** `src/platform/ui/registry/registry.ts`

**Action:** Search for this exact line:

```typescript
import { <UPPER> } from './features/<feature>';
```

If **missing** → add it alphabetically among feature imports.

**Verification**

- [ ] Line exists exactly (with your `<UPPER>` and `<feature>`)

**Progress Report:** `TASK 4: PASS — registry.ts import verified`

⛔ **Do not start TASK 5 until TASK 4 is PASS.**

---

## TASK 5 — Verify `registry.ts` Re-export

**File:** `src/platform/ui/registry/registry.ts`

**Action:** Search for:

```typescript
export { <UPPER> } from './features/<feature>';
```

If **missing** → add it alphabetically among feature re-exports.

**Verification**

- [ ] Line exists

**Progress Report:** `TASK 5: PASS — registry.ts re-export verified`

⛔ **Do not start TASK 6 until TASK 5 is PASS.**

---

## TASK 6 — Verify `registry.ts` UI_REGISTRY

**File:** `src/platform/ui/registry/registry.ts`

**Action:** Search inside `export const UI_REGISTRY = {` for `<UPPER>,`

If **missing** → add `<UPPER>,` inside the object (known generator gap when `DEVTOOLS` follows `ONBOARDING`).

**Verification**

- [ ] `<UPPER>` appears as a member of `UI_REGISTRY`

**Progress Report:** `TASK 6: PASS — UI_REGISTRY contains <UPPER>`

⛔ **Do not start TASK 7 until TASK 6 is PASS.**

---

## TASK 7 — Verify `registry.ts` ALL_UI_IDENTITIES

**File:** `src/platform/ui/registry/registry.ts`

**Action:** Search for:

```typescript
...flattenObject(<UPPER>),
```

inside `ALL_UI_IDENTITIES`.

If **missing** → add before `...ALL_CATEGORY_IDENTITIES,`.

**Verification**

- [ ] `flattenObject(<UPPER>)` present

**Progress Report:** `TASK 7: PASS — ALL_UI_IDENTITIES flattens <UPPER>`

⛔ **Do not start TASK 8 until TASK 7 is PASS.**

---

## TASK 8 — Delete Legacy `src/features/` Folder

**Objective:** Remove generator leftovers.

### Command

```powershell
Remove-Item -Recurse -Force "src/features/<feature>"
```

**Verification**

- [ ] `Test-Path "src/features/<feature>"` → **False**

**Progress Report:** `TASK 8: PASS — src/features/<feature> removed`

⛔ **Do not start TASK 9 until TASK 8 is PASS.**

---

## TASK 9 — Wire `generate-registry-member-paths.ts` Import

**File:** `scripts/generate-registry-member-paths.ts`

**Action:** In the import from `../src/platform/ui/registry/registry`, add `<UPPER>` alphabetically:

```typescript
import {
  AUTH,
  DEVTOOLS,
  ERROR_BOUNDARY,
  HOME,
  <UPPER>,
  MERCHANT,
  ONBOARDING,
  SETTINGS,
  SHARED_LAYOUT,
  SPLASH,
} from '../src/platform/ui/registry/registry';
```

**Verification**

- [ ] `<UPPER>` in import list

**Progress Report:** `TASK 9: PASS — member-paths import wired`

⛔ **Do not start TASK 10 until TASK 9 is PASS.**

---

## TASK 10 — Wire `generate-registry-member-paths.ts` ROOTS

**File:** `scripts/generate-registry-member-paths.ts`

**Action:** Add `<UPPER>,` to `ROOTS` (before `DEVTOOLS,`):

```typescript
const ROOTS = {
  HOME,
  ERROR_BOUNDARY,
  SPLASH,
  SHARED_LAYOUT,
  AUTH,
  SETTINGS,
  MERCHANT,
  ONBOARDING,
  <UPPER>,
  DEVTOOLS,
  // COMMON_* and DECORATIVE unchanged
};
```

**Verification**

- [ ] `<UPPER>` in `ROOTS`

**Progress Report:** `TASK 10: PASS — ROOTS contains <UPPER>`

⛔ **Do not start TASK 11 until TASK 10 is PASS.**

---

## TASK 11 — Export `<UPPER>` from `index.ts`

**File:** `src/platform/ui/index.ts`

**Action:** Add `<UPPER>,` to the registry export list from `./registry/registry`.

**Verification**

- [ ] `export { … <UPPER>, … } from './registry/registry'`

**Progress Report:** `TASK 11: PASS — index.ts exports <UPPER>`

⛔ **Do not start TASK 12 until TASK 11 is PASS.**

---

## TASK 12 — Wire `i18n-route-manifest.ts`

**File:** `src/platform/ui/i18n/core/i18n-route-manifest.ts`

**Action:** Add this entry (before `{ prefix: '/', …}`):

```typescript
{ prefix: '<route>', feature: '<feature>' },
```

Example: `{ prefix: '/test1', feature: 'test1' },`

**Verification**

- [ ] Entry exists with exact `prefix` and `feature`

**Progress Report:** `TASK 12: PASS — route manifest wired`

⛔ **Do not start TASK 13 until TASK 12 is PASS.**

---

## TASK 13 — Wire `featureScope.ts`

**File:** `src/platform/ui/i18n/core/featureScope.ts`

**Action:** Add to `FEATURE_SCOPES`:

```typescript
<feature>: ['common', 'shared-layout', '<feature>'],
```

If `<feature>` contains hyphens, quote the key:

```typescript
'my-feature': ['common', 'shared-layout', 'my-feature'],
```

**Verification**

- [ ] Key `<feature>` exists with exactly three scope entries

**Progress Report:** `TASK 13: PASS — featureScope wired`

⛔ **Do not start TASK 14 until TASK 13 is PASS.**

---

## TASK 14 — Wire `getDictionary.ts`

**File:** `src/platform/ui/i18n/core/getDictionary.ts`

**Action:** Add `'<feature>'` to `APP_DICTIONARY_FEATURES` array.

**Verification**

- [ ] `'<feature>'` in `APP_DICTIONARY_FEATURES`

**Progress Report:** `TASK 14: PASS — APP_DICTIONARY_FEATURES wired`

⛔ **Do not start TASK 15 until TASK 14 is PASS.**

---

## TASK 15 — Create Container-Only App Router Page

**Objective:** Create `routeFile` with **one empty container** only.  
**All other UI** (title, inputs, buttons, images, …) is added later via **[AGENT_UI_ELEMENTS.md](./AGENT_UI_ELEMENTS.md)**.

**File:** `src/app/(app)/<route-without-leading-slash>/page.tsx`

**Copy this template. Replace placeholders only. Do not add JSX.**

```tsx
import { <UPPER> } from '@/platform/ui';

export default function <PascalPage>() {
  return (
    <div
      data-ui-uuid={<UPPER>.PAGE.CONTAINER.uuid}
      className="min-h-[200px] bg-background px-4 py-8"
    />
  );
}
```

**Verification**

| Rule | Required |
|------|----------|
| Intrinsics in file | **Exactly 1** — the outer `div` |
| `data-ui-uuid` | `<UPPER>.PAGE.CONTAINER.uuid` only |
| `'use client'` | **Not present** (no hooks in scaffold) |
| `useTranslation` / `t()` | **Not present** |
| User-visible text | **None** |
| Extra elements | **None** — no `h1`, `button`, `input`, `img`, … |

- [ ] File exists at `routeFile`

**Progress Report:** `TASK 15: PASS — container-only route page created`

⛔ **Do not start TASK 16 until TASK 15 is PASS.**

---

## TASK 16 — Materialize UUIDs

```powershell
npm run registry:materialize-uuids
```

**Verification**

- [ ] Exit code `0`
- [ ] You did **not** hand-edit any `uuid` in `registryFile`

**Progress Report:** `TASK 16: PASS — UUIDs materialized`

⛔ **Do not start TASK 17 until TASK 16 is PASS.**

---

## TASK 17 — Generate Registry Artifacts

```powershell
npm run registry:generate
```

**Do not hand-edit:** `uuid-manifest.json`, `registry-member-paths.json`, `source-index.ts`.

**Verification**

- [ ] Exit code `0`

**Progress Report:** `TASK 17: PASS — registry generated`

⛔ **Do not start TASK 18 until TASK 17 is PASS.**

---

## TASK 18 — Full i18n Pipeline

```powershell
npm run i18n
```

**Verification**

- [ ] Exit code `0`

On fail → **FAIL** — fix locales or bindings, re-run **TASK 18**.

**Progress Report:** `TASK 18: PASS — i18n pipeline passed`

⛔ **Do not start TASK 19 until TASK 18 is PASS.**

---

## TASK 19 — Typecheck

```powershell
npm run typecheck
```

**Verification**

- [ ] Exit code `0`

**Progress Report:** `TASK 19: PASS — typecheck passed`

⛔ **Do not start TASK 20 until TASK 19 is PASS.**

---

## TASK 20 — UUID CI

```powershell
npm run ci:uuid-dom-absolute
npm run ci:uuid-dom-parity
```

**Verification**

- [ ] Both exit code `0`

**Progress Report:** `TASK 20: PASS — UUID CI passed`

⛔ **Do not start TASK 21 until TASK 20 is PASS.**

---

## TASK 21 — Lint + Final Audit

### 21a. Lint

```powershell
npm run lint
```

- [ ] Exit code `0`
- [ ] Did **not** set `MIGRATION_MODE=true`

### 21b. Final checklist (all must be checked)

- [ ] TASK 3–20 all PASS
- [ ] `registryFile` exists
- [ ] TASK 4–7: `<UPPER>` in all four `registry.ts` locations
- [ ] TASK 9–10: `<UPPER>` in member-paths import + `ROOTS`
- [ ] TASK 11: `<UPPER>` in `index.ts`
- [ ] TASK 12–14: i18n wired (manifest, scope, dictionary)
- [ ] `routeFile` exists
- [ ] `src/features/<feature>/` does **not** exist
- [ ] No manual UUID edits

**Only when 21a and 21b pass**, report to user:

```text
Feature <feature> scaffold complete at route <route> (container-only).
All TASKs 0–21 PASS.

If the same prompt includes a UI description, continue immediately with
docs/design-system/AGENT_UI_ELEMENTS.md TASK 0–17 (derive inventory in TASK 1).
```

**Progress Report:** `TASK 21: PASS — SCAFFOLD COMPLETE (not final UI)`

### Phase 2 — Custom UI (Separate Runbook)

Do **not** add custom UI in this runbook.  
When the user provides an element inventory → **[AGENT_UI_ELEMENTS.md](./AGENT_UI_ELEMENTS.md)** TASK 0 onward.  
Start Phase 2 **only after** this TASK 21 is PASS.

---

## Forbidden Actions (Instant STOP)

1. Manual `uuid` edits
2. Skip TASK 9–10 (`ROOTS` — causes `unknownPath` CI failures)
3. Skip TASK 12–14 (i18n wiring)
4. `src/features/<feature>/page.tsx`
5. `t('<feature>.page.title')` instead of `t(<UPPER>.PAGE.TITLE)`
6. Mark complete before TASK 21 PASS
7. Use [AGENT_PAGE_CREATION.md](./AGENT_PAGE_CREATION.md) steps for a new feature

---

## Default Generator Identities (Reference)

The generator creates identities below. **TASK 15 uses only `PAGE.CONTAINER` in JSX.**  
Wire the rest in **[AGENT_UI_ELEMENTS.md](./AGENT_UI_ELEMENTS.md)** when the user requests them.

| Registry member | Used in TASK 15? | Translation? |
|-----------------|------------------|--------------|
| `<UPPER>.PAGE.CONTAINER` | **Yes** | No |
| `<UPPER>.PAGE.TITLE` | No — Phase 2 | Yes |
| `<UPPER>.PAGE.DESCRIPTION` | No — Phase 2 | Yes |
| `<UPPER>.ACTIONS.ROW` | No — Phase 2 | No |
| `<UPPER>.ACTIONS.CREATE_BUTTON` | No — Phase 2 | Yes |
| `<UPPER>.ACTIONS.SAVE_BUTTON` | No — Phase 2 | Yes |

---

## Progress Report Template (Print After Every TASK)

```text
---
RUNBOOK: AGENT_FEATURE_CREATION
TASK: <N> — <name>
STATUS: PASS | FAIL | STOP
FEATURE: <feature>
ROUTE: <route>
NEXT: TASK <N+1> | HALTED — <reason>
---
```

---

## User Prompt Template (single message — Phase 1 + Phase 2)

```text
Create feature <feature> (route /<route>).

UI: <plain-language description of all elements>

Phase 1 — Follow docs/design-system/AGENT_FEATURE_CREATION.md.
Execute TASK 0 through TASK 21. Print Progress Report after every TASK.

Phase 2 — Follow docs/design-system/AGENT_UI_ELEMENTS.md.
Execute TASK 0 through TASK 17. Print Progress Report after every TASK.
Derive Element Inventory in TASK 1 from the UI description — do not ask me for a table.
Do not mark complete until Phase 2 TASK 17 is PASS.
```

---

## Optional — Full CI (User Must Ask Explicitly)

```powershell
npm run ci:check
```

---

## Related Runbooks

| Task | Document |
|------|----------|
| **Phase 2 — add UI elements** | [AGENT_UI_ELEMENTS.md](./AGENT_UI_ELEMENTS.md) |
| **Remove UI elements** | [AGENT_UI_ELEMENT_REMOVAL.md](./AGENT_UI_ELEMENT_REMOVAL.md) |
| Page inside existing feature | [AGENT_PAGE_CREATION.md](./AGENT_PAGE_CREATION.md) |
| General UI rules | [UI_CREATION_RULES.md](./UI_CREATION_RULES.md) |
| i18n | [i18n.md](./i18n.md) |
| Theme | [THEME_RULES.md](./THEME_RULES.md) |
