# Agent Runbook: Create a Page Inside an Existing Feature (Zero-Error Protocol)

**Status:** Mandatory. Non-negotiable.  
**Audience:** Any AI agent that adds a **new route/page** to a feature that **already exists**.  
**Goal:** Working App Router page — zero registry, i18n, UUID, or lint errors.

> **Wrong runbook?** Creating a **brand-new feature namespace** → stop here. Use **[AGENT_FEATURE_CREATION.md](./AGENT_FEATURE_CREATION.md)** only. **Never mix both runbooks.**

---

## Execution Protocol (Read Before TASK 1)

You are a **weak executor**. You do **not** design, infer, optimize, or choose alternatives. You **only** follow TASKs in order.

### Rules

| # | Rule |
|---|------|
| R1 | Execute **TASK 0 → TASK 22** in order. |
| R2 | **Never** start TASK *N+1* until TASK *N* is **PASS**. |
| R3 | After every TASK, print the **Progress Report** block (template at bottom). |
| R4 | On **FAIL** or **STOP**: halt immediately. Do not skip ahead. |
| R5 | Never run `npm run generate:feature`. |
| R6 | Never type or edit a `uuid` field by hand. |
| R7 | Never use `npm run registry:add` for page identity groups. |
| R8 | Never use `t('string.key')` when a registry identity exists. |
| R9 | Never create files under `src/features/`. |
| R10 | Never modify `registry.ts`, `index.ts`, or `generate-registry-member-paths.ts` (feature already wired). |

### PASS / FAIL / STOP

| Status | Meaning |
|--------|---------|
| **PASS** | Every verification item in the TASK succeeded. Proceed to next TASK. |
| **FAIL** | A verification item failed. Fix only what the TASK allows. Re-run the **same** TASK. |
| **STOP** | Hard blocker. Do **not** continue. Report to user. |

---

## TASK 0 — Select Runbook

**Objective:** Confirm this is a **page-in-existing-feature** task.

| # | Question | Required answer |
|---|----------|-----------------|
| 0.1 | Did the user ask to add a **page/route** (not a new feature)? | YES |
| 0.2 | Did the user name an **existing** feature (`merchant`, `auth`, `settings`, …)? | YES |
| 0.3 | Does `src/platform/ui/registry/features/<feature>.ts` **already exist**? | YES |

If **0.3** is NO → **STOP** — use [AGENT_FEATURE_CREATION.md](./AGENT_FEATURE_CREATION.md).

If **0.1** or **0.2** is NO → **STOP** — ask user for: `<feature>`, `<route>`, `<pageSlug>`, `<PageSection>`, `<PascalPage>`, `<componentFile>`.

**Progress Report:** `TASK 0: PASS — correct runbook selected`

⛔ **Do not start TASK 1 until TASK 0 is PASS.**

---

## TASK 1 — Resolve Inputs

**Objective:** Fill every placeholder before any file edit.

### Required from user (do not invent)

| Placeholder | Meaning | Example |
|-------------|---------|---------|
| `<feature>` | Existing feature slug | `merchant` |
| `<UPPER>` | Registry constant | `MERCHANT` |
| `<route>` | Full URL, no trailing slash | `/merchant/analytics` |
| `<pageSlug>` | kebab-case path segment 2 | `analytics` |
| `<PageSection>` | PascalCase registry group | `ANALYTICS` |
| `<PascalPage>` | Component name | `AnalyticsPage` |
| `<componentFile>` | kebab-case filename | `analytics-page.tsx` |
| `<RouteComponent>` | Route default export name | `MerchantAnalyticsRoute` |

### Derive automatically

| Placeholder | Formula |
|-------------|---------|
| `<today>` | `YYYY-MM-DD` today |
| `<routeFile>` | `src/app/(app)/` + `<route>` without leading `/` + `/page.tsx` |
| `<componentPath>` | `src/components/<feature>/<componentFile>` |
| `<registryFile>` | `src/platform/ui/registry/features/<feature>.ts` |

### Validation

| Field | Regex | On fail |
|-------|-------|---------|
| `<feature>` | `^[a-z][a-z0-9-]*$` | **STOP** |
| `<pageSlug>` | `^[a-z][a-z0-9-]*$` | **STOP** |
| `<route>` | `^/[a-z][a-z0-9/-]*$` | **STOP** |

### Write down (mandatory)

```text
feature=<feature>
UPPER=<UPPER>
route=<route>
pageSlug=<pageSlug>
PageSection=<PageSection>
PascalPage=<PascalPage>
componentFile=<componentFile>
RouteComponent=<RouteComponent>
today=<today>
routeFile=<routeFile>
componentPath=<componentPath>
registryFile=<registryFile>
```

**Verification**

- [ ] Block above is complete
- [ ] All regex checks passed

**Progress Report:** `TASK 1: PASS — inputs resolved`

⛔ **Do not start TASK 2 until TASK 1 is PASS.**

---

## TASK 2 — Verify Feature Exists (5 Checks)

**Objective:** Prove the feature was created correctly before. **Do not fix** — only verify.

| # | Check | How to verify |
|---|-------|---------------|
| 2.1 | Registry file | `registryFile` exists and exports `<UPPER>` |
| 2.2 | Locales | `src/platform/ui/i18n/locales/<feature>/en.json` and `ar.json` exist |
| 2.3 | Aggregated registry | `src/platform/ui/registry/registry.ts` contains `flattenObject(<UPPER>)` |
| 2.4 | Client export | `src/platform/ui/index.ts` exports `<UPPER>` |
| 2.5 | Member paths | `scripts/generate-registry-member-paths.ts` has `<UPPER>` in import **and** `ROOTS` |

If **any** check fails → **STOP** — report: `Feature <feature> is incomplete. Run AGENT_FEATURE_CREATION.md first. Missing: <list>.`

**Progress Report:** `TASK 2: PASS — feature prerequisites verified`

⛔ **Do not start TASK 3 until TASK 2 is PASS.**

---

## TASK 3 — Pre-flight: Target Paths Must Not Exist

| # | Path | Must be |
|---|------|---------|
| 3.1 | `<routeFile>` | **absent** |
| 3.2 | `<componentPath>` | **absent** |

If **any** exists → **STOP** — report: `Page already exists at <path>. Do not overwrite.`

**Progress Report:** `TASK 3: PASS — no target path collision`

⛔ **Do not start TASK 4 until TASK 3 is PASS.**

---

## TASK 4 — Write Identity Plan (No Code Yet)

**Objective:** Fixed plan for **exactly three identities** (minimum scaffold). Do **not** add extra identities unless the user gave an explicit element list in the original request.

### Copy this table filled with your values

| Registry key | Stable ID | Path | Category | Translation key |
|--------------|-----------|------|----------|-----------------|
| `CONTAINER` | `UI_<UPPER>_<PageSection>_CONTAINER` | `<feature>.<pageSlug>.layout.container` | `container` | *(none)* |
| `TITLE` | `UI_<UPPER>_<PageSection>_TITLE` | `<feature>.<pageSlug>.display.title` | `display` | `<feature>.<pageSlug>.title` |
| `DESCRIPTION` | `UI_<UPPER>_<PageSection>_DESCRIPTION` | `<feature>.<pageSlug>.display.description` | `display` | `<feature>.<pageSlug>.description` |

### JSX member paths (for later TASKs)

```text
<UPPER>.<PageSection>.CONTAINER
<UPPER>.<PageSection>.TITLE
<UPPER>.<PageSection>.DESCRIPTION
```

**Verification**

- [ ] Table filled with no empty cells
- [ ] Each path has 3 or 4 segments only
- [ ] First segment equals `<feature>`
- [ ] Second segment equals `<pageSlug>`

**Progress Report:** `TASK 4: PASS — identity plan written`

⛔ **Do not start TASK 5 until TASK 4 is PASS.**

---

## TASK 5 — Add Registry Group to Feature File

**File:** `<registryFile>`

**Action:**

1. Open the file.
2. Find the final `} as const;` of `export const <UPPER> = {`.
3. Insert **immediately before** that closing line the block below (replace placeholders).

**Do not add `uuid` fields.**

```typescript
  <PageSection>: {
    CONTAINER: {
      id: 'UI_<UPPER>_<PageSection>_CONTAINER',
      path: '<feature>.<pageSlug>.layout.container',
      lifecycle: 'active',
      description: 'Page root container',
      category: 'container',
      feature: '<feature>',
      version: '1.0.0',
      createdAt: '<today>',
      updatedAt: '<today>',
    } as const,
    TITLE: {
      id: 'UI_<UPPER>_<PageSection>_TITLE',
      path: '<feature>.<pageSlug>.display.title',
      lifecycle: 'active',
      description: 'Page title',
      category: 'display',
      feature: '<feature>',
      version: '1.0.0',
      createdAt: '<today>',
      updatedAt: '<today>',
    } as const,
    DESCRIPTION: {
      id: 'UI_<UPPER>_<PageSection>_DESCRIPTION',
      path: '<feature>.<pageSlug>.display.description',
      lifecycle: 'active',
      description: 'Page description',
      category: 'display',
      feature: '<feature>',
      version: '1.0.0',
      createdAt: '<today>',
      updatedAt: '<today>',
    } as const,
  },
```

**Verification**

- [ ] File saved
- [ ] New blocks contain **no** `uuid:` lines
- [ ] Group key is exactly `<PageSection>`

**Progress Report:** `TASK 5: PASS — registry group added`

⛔ **Do not start TASK 6 until TASK 5 is PASS.**

---

## TASK 6 — Materialize UUIDs

```powershell
npm run registry:materialize-uuids
```

**Verification**

- [ ] Exit code `0`
- [ ] Open `registryFile` — each of CONTAINER, TITLE, DESCRIPTION now has `uuid:` **injected by tool** (you did not type it)

**Progress Report:** `TASK 6: PASS — UUIDs materialized`

⛔ **Do not start TASK 7 until TASK 6 is PASS.**

---

## TASK 7 — Generate Registry Artifacts

```powershell
npm run registry:generate
```

**Do not hand-edit:** `uuid-manifest.json`, `registry-member-paths.json`, `source-index.ts`.

**Verification**

- [ ] Exit code `0`

**Progress Report:** `TASK 7: PASS — registry artifacts generated`

⛔ **Do not start TASK 8 until TASK 7 is PASS.**

---

## TASK 8 — Update English Locale

**File:** `src/platform/ui/i18n/locales/<feature>/en.json`

**Action:**

1. Open file.
2. Inside the root `"<feature>"` object, add key `"<pageSlug>"` (merge — **do not delete** other keys).
3. Use this structure:

```json
"<pageSlug>": {
  "title": "<English title>",
  "description": "<English description>"
}
```

Use real English text. No `"TODO"`.

**Verification**

- [ ] Valid JSON
- [ ] Keys `title` and `description` present under `<pageSlug>`

**Progress Report:** `TASK 8: PASS — en.json updated`

⛔ **Do not start TASK 9 until TASK 8 is PASS.**

---

## TASK 9 — Update Arabic Locale

**File:** `src/platform/ui/i18n/locales/<feature>/ar.json`

**Action:** Same structure as TASK 8 with Arabic strings. Keys must **match en.json exactly**.

```json
"<pageSlug>": {
  "title": "<Arabic title>",
  "description": "<Arabic description>"
}
```

**Verification**

- [ ] Valid JSON
- [ ] Same keys as en.json under `<pageSlug>`

**Progress Report:** `TASK 9: PASS — ar.json updated`

⛔ **Do not start TASK 10 until TASK 9 is PASS.**

---

## TASK 10 — Sync i18n Bindings

```powershell
npm run i18n:sync
```

**Verification**

- [ ] Exit code `0`

On fail → **FAIL** — fix TASK 8–9, re-run **TASK 10**.

**Progress Report:** `TASK 10: PASS — i18n sync completed`

⛔ **Do not start TASK 11 until TASK 10 is PASS.**

---

## TASK 11 — Route Manifest Decision (No Guesswork)

**Objective:** Decide **only** between two outcomes.

**Action:**

1. Open `src/platform/ui/i18n/core/i18n-route-manifest.ts`.
2. Search for an entry where `prefix === '<route>'` **OR** where `prefix` is a prefix of `<route>` **and** `feature === '<feature>'`.

**Decision table**

| Condition | Next TASK |
|-----------|-----------|
| Entry exists with `prefix: '<route>'` and `feature: '<feature>'` | Skip to **TASK 13** (TASK 12 = SKIP) |
| No such entry | Continue to **TASK 12** |

Write your decision:

```text
routeManifestDecision=ADD | SKIP
```

**Verification**

- [ ] Decision written as `ADD` or `SKIP`

**Progress Report:** `TASK 11: PASS — routeManifestDecision=<ADD|SKIP>`

⛔ **Do not start TASK 12 until TASK 11 is PASS with decision ADD.**  
⛔ **If decision is SKIP, do not start TASK 12 — start TASK 13 instead.**

---

## TASK 12 — Add Route Manifest Entry (Only If TASK 11 = ADD)

**File:** `src/platform/ui/i18n/core/i18n-route-manifest.ts`

**Action:** Add this line to `I18N_ROUTE_MANIFEST`:

```typescript
{ prefix: '<route>', feature: '<feature>' },
```

**Verification**

- [ ] Line added with exact `prefix` and `feature`

**Progress Report:** `TASK 12: PASS — route manifest entry added`

⛔ **Do not start TASK 13 until TASK 12 is PASS (or TASK 11 was SKIP).**

---

## TASK 13 — Verify i18n Scope (Read-Only)

**Objective:** Confirm feature scope already exists. **Do not edit** unless verification fails.

**Action:**

1. Open `src/platform/ui/i18n/core/featureScope.ts` — confirm key `<feature>` exists.
2. Open `src/platform/ui/i18n/core/getDictionary.ts` — confirm `'<feature>'` is in `APP_DICTIONARY_FEATURES`.

If **either** missing → **STOP** — report feature incomplete (use [AGENT_FEATURE_CREATION.md](./AGENT_FEATURE_CREATION.md)).

**Verification**

- [ ] `FEATURE_SCOPES['<feature>']` exists (or quoted key for hyphens)
- [ ] `'<feature>'` in `APP_DICTIONARY_FEATURES`

**Progress Report:** `TASK 13: PASS — i18n scope verified (no edits)`

⛔ **Do not start TASK 14 until TASK 13 is PASS.**

---

## TASK 14 — Create Page Component

**File:** `<componentPath>`

**Copy exactly (replace placeholders only):**

```tsx
'use client';

import { <UPPER>, useTranslation } from '@/platform/ui';

export function <PascalPage>() {
  const { t } = useTranslation();

  return (
    <div
      data-ui-uuid={<UPPER>.<PageSection>.CONTAINER.uuid}
      className="flex flex-col gap-6 bg-background px-4 py-8"
    >
      <h1
        data-ui-uuid={<UPPER>.<PageSection>.TITLE.uuid}
        className="text-3xl font-bold text-on-surface"
      >
        {t(<UPPER>.<PageSection>.TITLE)}
      </h1>
      <p
        data-ui-uuid={<UPPER>.<PageSection>.DESCRIPTION.uuid}
        className="text-lg text-on-surface-variant"
      >
        {t(<UPPER>.<PageSection>.DESCRIPTION)}
      </p>
    </div>
  );
}
```

**Verification**

| Intrinsic | `data-ui-uuid` |
|-----------|----------------|
| outer `div` | `<UPPER>.<PageSection>.CONTAINER.uuid` |
| `h1` | `<UPPER>.<PageSection>.TITLE.uuid` |
| `p` | `<UPPER>.<PageSection>.DESCRIPTION.uuid` |

- [ ] File exists
- [ ] Named export `export function <PascalPage>`
- [ ] No `t('…')` string keys
- [ ] No hardcoded user-visible strings

**Progress Report:** `TASK 14: PASS — component created`

⛔ **Do not start TASK 15 until TASK 14 is PASS.**

---

## TASK 15 — Export Component from Barrel

**File:** `src/components/<feature>/index.ts`

**Action:** Add line:

```typescript
export { <PascalPage> } from './<componentFile-without-.tsx>';
```

**Verification**

- [ ] Export line exists

**Progress Report:** `TASK 15: PASS — barrel export added`

⛔ **Do not start TASK 16 until TASK 15 is PASS.**

---

## TASK 16 — Create Thin App Router Page

**File:** `<routeFile>`

**Copy exactly:**

```tsx
import { <PascalPage> } from '@/components/<feature>';

export default function <RouteComponent>() {
  return <<PascalPage> />;
}
```

**Verification**

- [ ] File exists at `<routeFile>`
- [ ] No `'use client'` in route file
- [ ] No registry imports in route file
- [ ] No inline JSX (component only)

**Progress Report:** `TASK 16: PASS — thin route created`

⛔ **Do not start TASK 17 until TASK 16 is PASS.**

---

## TASK 17 — Full i18n Pipeline

```powershell
npm run i18n
```

**Verification**

- [ ] Exit code `0`

**Progress Report:** `TASK 17: PASS — i18n pipeline passed`

⛔ **Do not start TASK 18 until TASK 17 is PASS.**

---

## TASK 18 — Typecheck

```powershell
npm run typecheck
```

**Verification**

- [ ] Exit code `0`

**Progress Report:** `TASK 18: PASS — typecheck passed`

⛔ **Do not start TASK 19 until TASK 18 is PASS.**

---

## TASK 19 — UUID CI

```powershell
npm run ci:uuid-dom-absolute
npm run ci:uuid-dom-parity
```

**Verification**

- [ ] Both exit code `0`

**Progress Report:** `TASK 19: PASS — UUID CI passed`

⛔ **Do not start TASK 20 until TASK 19 is PASS.**

---

## TASK 20 — Lint

```powershell
npm run lint
```

**Verification**

- [ ] Exit code `0`
- [ ] Did **not** set `MIGRATION_MODE=true`

**Progress Report:** `TASK 20: PASS — lint passed`

⛔ **Do not start TASK 21 until TASK 20 is PASS.**

---

## TASK 21 — Final Audit

Check **every** box:

- [ ] TASK 0–20 all PASS
- [ ] TASK 2: feature prerequisites verified (no `generate:feature`)
- [ ] TASK 5–6: registry group added, UUIDs materialized only by tool
- [ ] TASK 8–9: locales updated under `<pageSlug>`
- [ ] TASK 11: route manifest decision documented
- [ ] TASK 12: done if ADD; skipped if SKIP
- [ ] `<componentPath>` exists
- [ ] `<routeFile>` exists
- [ ] No new files under `src/features/`
- [ ] Did **not** edit `registry.ts`, `index.ts`, `generate-registry-member-paths.ts`

**Only when all checked**, report:

```text
Page <route> created successfully in feature <feature>.
All TASKs 0–21 PASS.
```

**Progress Report:** `TASK 21: PASS — COMPLETE`

---

## Forbidden Actions (Instant STOP)

1. `npm run generate:feature`
2. Manual `uuid` edits
3. `npm run registry:add` for page groups
4. Edit `registry.ts` / `index.ts` / `generate-registry-member-paths.ts`
5. `t('merchant.analytics.title')` instead of `t(MERCHANT.ANALYTICS.TITLE)`
6. Large JSX in route file
7. Files under `src/features/`
8. Mark complete before TASK 21 PASS
9. Skip TASK 6–7 after registry edits
10. Invent `<pageSlug>` or `<PageSection>` without user input

---

## Adding Another Page to Same Feature

Start again from **TASK 0** with **new** values for:

- `<route>`, `<pageSlug>`, `<PageSection>`, `<PascalPage>`, `<componentFile>`, `<RouteComponent>`

Reuse same `<feature>` and `<UPPER>`. TASK 2 will PASS without edits.

---

## Page Outside `(app)` Shell

**Only if user explicitly wrote:** page must NOT use AppShell.

Then change `<routeFile>` to `src/app/<route-without-leading-slash>/page.tsx` (outside `(app)`).

If user did **not** say this → use default `(app)` path from TASK 1. **Do not guess.**

---

## Progress Report Template (Print After Every TASK)

```text
---
RUNBOOK: AGENT_PAGE_CREATION
TASK: <N> — <name>
STATUS: PASS | FAIL | STOP
FEATURE: <feature>
ROUTE: <route>
PAGE_SLUG: <pageSlug>
NEXT: TASK <N+1> | TASK <skip> | HALTED — <reason>
---
```

---

## User Prompt Template

```text
Add a new page to existing feature <feature>.

Route: <route>
Page slug: <pageSlug>
Page section: <PageSection>
Component: <PascalPage> in <componentFile>
Route component: <RouteComponent>

Follow docs/design-system/AGENT_PAGE_CREATION.md.
Execute TASK 0 through TASK 21 in order.
Print Progress Report after every TASK.
Do not start the next TASK until the current TASK is PASS.
Do not mark complete until TASK 21 is PASS.
```

### Example

```text
Add a new page to existing feature merchant.

Route: /merchant/analytics
Page slug: analytics
Page section: ANALYTICS
Component: AnalyticsPage in analytics-page.tsx
Route component: MerchantAnalyticsRoute

Follow docs/design-system/AGENT_PAGE_CREATION.md.
Execute TASK 0 through TASK 21 in order.
Print Progress Report after every TASK.
Do not start the next TASK until the current TASK is PASS.
Do not mark complete until TASK 21 is PASS.
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
| New feature namespace | [AGENT_FEATURE_CREATION.md](./AGENT_FEATURE_CREATION.md) |
| General UI rules | [UI_CREATION_RULES.md](./UI_CREATION_RULES.md) |
| i18n | [i18n.md](./i18n.md) |
| Theme | [THEME_RULES.md](./THEME_RULES.md) |
