# Agent Runbook: Create a New Feature (Zero-Error Protocol)

**Status:** Mandatory. Non-negotiable.  
**Audience:** Any AI agent or automation that adds a GoVa feature.  
**Goal:** Create a working App Router feature that passes all required checks with **zero** registry, i18n, UUID, or lint errors.

---

## Agent Contract (Read First)

You **MUST** obey every rule below. There is **no** room for interpretation, shortcuts, or alternative designs.

| Rule | Requirement |
|------|-------------|
| **No guessing** | Do not invent file paths, registry shapes, UUIDs, translation keys, or commands not listed here. |
| **No skipping** | Execute steps **in order**. Do not jump ahead. |
| **No manual UUID edits** | Never type, change, copy, or delete a `uuid` field by hand in any file. |
| **No legacy patterns** | No `Ui*` components, no `data-ui-id`, no `data-ui-path`, no string keys in `t('...')` when a registry identity exists. |
| **No wrong route location** | Pages live in `src/app/(app)/<route>/page.tsx` only. Never create `src/features/<feature>/page.tsx`. |
| **Stop on failure** | If any command exits non-zero, fix the cause, re-run **that** command, then continue. Do not mark the task complete. |
| **Completion gate** | The task is **incomplete** until **Step 12** passes with exit code `0` for every command. |

**Supporting references (read-only context, do not replace this runbook):**

- [UI_CREATION_RULES.md](./UI_CREATION_RULES.md) — UUID-first DOM rules
- [i18n.md](./i18n.md) — translation binding details
- [THEME_RULES.md](./THEME_RULES.md) — semantic tokens only

---

## Inputs (Provided by User)

Replace placeholders **exactly** everywhere they appear:

| Placeholder | Meaning | Example |
|-------------|---------|---------|
| `<feature>` | Lowercase feature slug | `test1`, `my-feature` |
| `<UPPER>` | Uppercase slug, hyphens → underscores | `TEST1`, `MY_FEATURE` |
| `<route>` | URL path segment (usually equals `<feature>`) | `test1` → `/test1` |
| `<PascalPage>` | PascalCase page component name | `test1` → `Test1Page`, `my-feature` → `MyFeaturePage` |

**Feature name validation (mandatory before Step 1):**

```text
^[a-z][a-z0-9-]*$
```

If the name fails validation, **stop** and report the error. Do not proceed.

---

## Step 0 — Pre-flight (Mandatory)

Run these checks from the repository root. **All must pass** before Step 1.

```powershell
# 0a. Feature must not already exist
```

Confirm **none** of these exist:

- `src/platform/ui/registry/features/<feature>.ts`
- `src/platform/ui/i18n/locales/<feature>/`
- `src/app/(app)/<route>/page.tsx`
- `src/features/<feature>/`

If any exist, **stop**. Do not overwrite. Report that the feature already exists.

```powershell
# 0b. Confirm clean enough state to proceed
git status
```

Note unrelated dirty files but **do not revert** user work outside this feature.

---

## Step 1 — Scaffold Registry + Locales (Generator Only)

Run **exactly** this command (flags are mandatory):

```powershell
npm run generate:feature -- <feature> --no-layout --no-page
```

**What the generator creates (allowed):**

- `src/platform/ui/registry/features/<feature>.ts`
- Patches `src/platform/ui/registry/registry.ts` (partial — verified in Step 2)
- `src/platform/ui/i18n/locales/<feature>/en.json`
- `src/platform/ui/i18n/locales/<feature>/ar.json`
- `src/features/<feature>/bindings.ts` (legacy — deleted in Step 3)

**What the generator must NOT create for this runbook:**

- `src/features/<feature>/page.tsx` ← forbidden
- `src/features/<feature>/layout.tsx` ← forbidden

If the command exits non-zero, **stop**, read the error, fix the cause (usually name collision), and retry Step 1.

**Forbidden after Step 1:**

- Do **not** edit any `uuid` value inside `src/platform/ui/registry/features/<feature>.ts`.
- Do **not** add extra identities manually unless the user explicitly asked for custom UI beyond the default scaffold.

---

## Step 2 — Verify and Complete `registry.ts` (Mandatory)

Open `src/platform/ui/registry/registry.ts`.  
Search for `<UPPER>`. It **must** appear in **all four** locations below.

If **any** location is missing, add it **exactly** as shown (do not reorder unrelated entries):

### 2a. Import block

```typescript
import { <UPPER> } from './features/<feature>';
```

Place alphabetically among other feature imports.

### 2b. Re-export block

```typescript
export { <UPPER> } from './features/<feature>';
```

### 2c. `UI_REGISTRY` object

```typescript
export const UI_REGISTRY = {
  // ...existing entries...
  <UPPER>,
  // ...existing entries...
} as const;
```

> **Known generator gap:** The scaffold script may fail to insert into `UI_REGISTRY` when `DEVTOOLS` follows `ONBOARDING`. If `<UPPER>` is missing here, add it manually. **Do not** skip this check.

### 2d. `ALL_UI_IDENTITIES` array

```typescript
export const ALL_UI_IDENTITIES = [
  // ...existing flattenObject(...) entries...
  ...flattenObject(<UPPER>),
  // ...existing entries...
] as readonly UiIdentity[];
```

**Gate:** Save the file. If TypeScript cannot resolve `<UPPER>`, fix imports before continuing.

---

## Step 3 — Delete Legacy `src/features/` Scaffold

The project uses **App Router**, not `src/features/` pages.

```powershell
Remove-Item -Recurse -Force "src/features/<feature>"
```

**Gate:** Confirm `src/features/<feature>` no longer exists.

---

## Step 4 — Wire `generate-registry-member-paths.ts` (Mandatory)

File: `scripts/generate-registry-member-paths.ts`

### 4a. Add import

In the import block from `../src/platform/ui/registry/registry`, add `<UPPER>`:

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

Keep imports alphabetically sorted.

### 4b. Add to `ROOTS`

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
  // ...COMMON_* and DECORATIVE entries unchanged...
};
```

**Gate:** `<UPPER>` must appear in both import and `ROOTS`.  
**Failure to add `ROOTS` causes `unknownPath` ESLint/CI errors — this was a root cause of past agent failures.**

---

## Step 5 — Export from Client Platform Entry (Mandatory)

File: `src/platform/ui/index.ts`

Add `<UPPER>` to the registry export list:

```typescript
export {
  // ...existing exports...
  MERCHANT,
  ONBOARDING,
  <UPPER>,
  getUiIdentityByUuid,
  // ...
} from './registry/registry';
```

**Gate:** `import { <UPPER>, useTranslation } from '@/platform/ui'` must typecheck later.

---

## Step 6 — Wire i18n Route + Scopes (Mandatory)

The generator **does not** do this. You **must** edit all three files.

### 6a. Route manifest

File: `src/platform/ui/i18n/core/i18n-route-manifest.ts`

Add **before** shorter catch-all prefixes (e.g. before `{ prefix: '/', ... }`):

```typescript
{ prefix: '/<route>', feature: '<feature>' },
```

Example for `test1`:

```typescript
{ prefix: '/test1', feature: 'test1' },
```

### 6b. Feature scope (in-app page under `(app)`)

File: `src/platform/ui/i18n/core/featureScope.ts`

Add:

```typescript
<feature>: ['common', 'shared-layout', '<feature>'],
```

Use the literal key `<feature>` (with quotes if it contains hyphens):

```typescript
'my-feature': ['common', 'shared-layout', 'my-feature'],
```

### 6c. App dictionary features

File: `src/platform/ui/i18n/core/getDictionary.ts`

Add `'<feature>'` to `APP_DICTIONARY_FEATURES`:

```typescript
export const APP_DICTIONARY_FEATURES: readonly Feature[] = [
  'common',
  // ...existing entries...
  '<feature>',
] as const;
```

**Gate:** All three files saved. No typos in feature name across files.

---

## Step 7 — Create App Router Page (Mandatory)

Create: `src/app/(app)/<route>/page.tsx`

Use **this exact template**. Replace placeholders only:

```tsx
'use client';

import { <UPPER>, useTranslation } from '@/platform/ui';

export default function <PascalPage>() {
  const { t } = useTranslation();

  return (
    <div
      data-ui-uuid={<UPPER>.PAGE.CONTAINER.uuid}
      className="flex flex-col items-center justify-center gap-8 bg-background px-4 py-8"
    >
      <h1
        data-ui-uuid={<UPPER>.PAGE.TITLE.uuid}
        className="text-4xl font-bold text-on-surface"
      >
        {t(<UPPER>.PAGE.TITLE)}
      </h1>
      <p
        data-ui-uuid={<UPPER>.PAGE.DESCRIPTION.uuid}
        className="text-xl text-on-surface-variant"
      >
        {t(<UPPER>.PAGE.DESCRIPTION)}
      </p>
      <div
        data-ui-uuid={<UPPER>.ACTIONS.ROW.uuid}
        className="flex gap-4"
      >
        <button
          type="button"
          data-ui-uuid={<UPPER>.ACTIONS.CREATE_BUTTON.uuid}
          className="rounded-md bg-primary px-4 py-2 text-on-primary"
        >
          {t(<UPPER>.ACTIONS.CREATE_BUTTON)}
        </button>
        <button
          type="button"
          data-ui-uuid={<UPPER>.ACTIONS.SAVE_BUTTON.uuid}
          className="rounded-md bg-secondary px-4 py-2 text-on-secondary"
        >
          {t(<UPPER>.ACTIONS.SAVE_BUTTON)}
        </button>
      </div>
    </div>
  );
}
```

**Mandatory DOM/i18n rules for this file:**

| Element | Requirement |
|---------|-------------|
| Every intrinsic JSX node | Must have `data-ui-uuid={<UPPER>.….uuid}` — static member access only |
| User-visible text | Must use `{t(<UPPER>.IDENTITY)}` — **never** `t('string.key')` |
| Styling | Semantic tokens only (`bg-background`, `text-on-surface`, `bg-primary`, …) |
| Forbidden | Hardcoded English/Arabic strings, `#hex`, `bg-blue-500`, `Ui*` components |

**Gate:** Count intrinsics (`div`, `h1`, `p`, `button`) — each must have exactly one `data-ui-uuid`.

---

## Step 8 — Registry Pipeline (Mandatory, Exact Order)

Run from repository root:

```powershell
npm run registry:materialize-uuids
npm run registry:generate
```

**Do not:**

- Edit `uuid-manifest.json` by hand
- Edit `registry-member-paths.json` by hand
- Edit `source-index.ts` by hand

These files are **generated outputs**.

**Gate:** Both commands exit `0`.

---

## Step 9 — i18n Pipeline (Mandatory)

```powershell
npm run i18n
```

This runs: UUID validation, sync, validate locales, validate bindings, generate translation key types.

**Gate:** Exit code `0`. If validation fails for missing `en.json`/`ar.json`, return to Step 1.

---

## Step 10 — Typecheck (Mandatory)

```powershell
npm run typecheck
```

**Gate:** Exit code `0`. Common fixes:

- Missing `<UPPER>` export in `index.ts` → Step 5
- Missing `UI_REGISTRY` entry → Step 2c
- Wrong identity path in page → use only identities from `registry/features/<feature>.ts`

---

## Step 11 — UUID CI (Mandatory)

```powershell
npm run ci:uuid-dom-absolute
npm run ci:uuid-dom-parity
```

**Gate:** Both exit `0`.

| Failure | Fix |
|---------|-----|
| Missing `data-ui-uuid` | Step 7 — add to every intrinsic |
| Invalid / unknown UUID path | Step 4 — `ROOTS` missing; re-run Step 8 |
| Parity mismatch | Extra JSX element without UUID, or UUID on non-intrinsic |

---

## Step 12 — Lint (Mandatory)

```powershell
npm run lint
```

**Gate:** Exit code `0` for the feature work. Do not set `MIGRATION_MODE=true` for new features.

---

## Step 13 — Final Self-Audit (Mandatory Checklist)

Before reporting success, confirm **every** item:

- [ ] `src/platform/ui/registry/features/<feature>.ts` exists
- [ ] `<UPPER>` in `registry.ts` — import, export, `UI_REGISTRY`, `ALL_UI_IDENTITIES`
- [ ] `<UPPER>` in `scripts/generate-registry-member-paths.ts` — import + `ROOTS`
- [ ] `<UPPER>` exported from `src/platform/ui/index.ts`
- [ ] i18n wired in `i18n-route-manifest.ts`, `featureScope.ts`, `getDictionary.ts`
- [ ] `src/app/(app)/<route>/page.tsx` exists
- [ ] `src/features/<feature>/` **does not** exist
- [ ] No manual UUID edits were made
- [ ] Steps 8–12 all passed with exit code `0`

**Only after all boxes are checked** may the agent report: **Feature `<feature>` created successfully.**

---

## Forbidden Actions (Instant Failure)

Do **not** do any of the following:

1. Manually set or change `uuid:` in registry feature files
2. Create identities with 5+ path segments or paths outside the generator scaffold unless using `npm run registry:add`
3. Skip `generate-registry-member-paths.ts` `ROOTS` update
4. Skip i18n route/scope/dictionary wiring
5. Create `src/features/<feature>/page.tsx` or `layout.tsx`
6. Use `t('<feature>.page.title')` instead of `t(<UPPER>.PAGE.TITLE)`
7. Leave empty `src/platform/ui/i18n/locales/<feature>/` directory without JSON files
8. Mark the task done before Step 12 passes
9. Run `git commit` or `git push` unless the user explicitly asked
10. Delete or modify unrelated features, docs, or CI config

---

## Quick Reference — Default Generator Identities

After Step 1, these registry members **must** exist and **must** be used in Step 7:

| Registry member | Category | Translation required |
|-----------------|----------|----------------------|
| `<UPPER>.PAGE.CONTAINER` | container | No |
| `<UPPER>.PAGE.TITLE` | display | Yes |
| `<UPPER>.PAGE.DESCRIPTION` | display | Yes |
| `<UPPER>.ACTIONS.ROW` | container | No |
| `<UPPER>.ACTIONS.CREATE_BUTTON` | action | Yes |
| `<UPPER>.ACTIONS.SAVE_BUTTON` | action | Yes |

Matching locale structure (already created by generator):

```json
{
  "<feature>": {
    "page": { "title": "...", "description": "..." },
    "actions": { "create": "...", "save": "..." }
  }
}
```

---

## Agent Prompt Template (Copy to User Task)

When assigning work to an agent, include:

```text
Create feature <feature> (route /<route>).

Follow docs/design-system/AGENT_FEATURE_CREATION.md exactly.
Execute every step in order. No shortcuts. No guessing.
Do not mark complete until Steps 8–12 all pass.
```

---

## Optional — Full CI Gate

If the user asks for maximum verification (beyond the default runbook gate):

```powershell
npm run ci:check
```

Use only when explicitly requested — it is slower and may surface unrelated repo issues.
