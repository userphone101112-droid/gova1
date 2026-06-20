# Agent Runbook: Remove UI Elements (Zero-Error Protocol)

**Status:** Mandatory. Non-negotiable.  
**Audience:** AI agents (primary).  
**Goal:** Remove **any** UI elements from an existing feature or page — zero registry, i18n, UUID, or lint errors.

> **New agent?** Read **[AGENT_PROJECT_PHILOSOPHY.md](./AGENT_PROJECT_PHILOSOPHY.md)** first for project design and runbook selection.

> **Zero-Question Policy.** The user gives **one plain-language sentence** (what to remove, where).  
> The agent **must never ask the user anything** — not for identity paths, Group/Key names, file paths,  
> or confirmation. **Derive everything** from the prompt plus the codebase.

> **Scope:** Works on:
> - **Feature** — root route page or any route under the feature namespace
> - **Page** — component under `src/components/<feature>/`

> **Companion runbook:** Adding elements → [AGENT_UI_ELEMENTS.md](./AGENT_UI_ELEMENTS.md)

---

## Part A — How to Remove Any Element (Read First)

### A.0 — Zero-Question Policy (mandatory)

Same rules as [AGENT_UI_ELEMENTS.md §A.0](./AGENT_UI_ELEMENTS.md#a0--zero-question-policy-mandatory).

Additional rule for removal: **never delete Phase 1 scaffold container** (`*.PAGE.CONTAINER` or page-section `*.CONTAINER` that is the only root wrapper) unless the user explicitly says «remove the page» / «delete entire page».

---

### A.1 — Universal removal pipeline

Every removed element follows the **same 5 steps**:

```text
1. Derive removal list   →  match user text to registry members + JSX nodes
2. Remove JSX            →  delete DOM nodes from <targetFile> / <implementationFile>
3. Remove registry       →  delete identity blocks from registry/features/<feature>.ts
4. Remove locales        →  delete bound keys from en.json + ar.json (if translatable)
5. Regenerate            →  materialize-uuids → registry:generate → i18n → typecheck → uuid CI → lint
```

**Never edit by hand:** `uuid-manifest.json`, `registry-member-paths.json`, `source-index.ts`, `registry.ts`, `index.ts`, `generate-registry-member-paths.ts`.

**Preferred registry removal:** delete the identity block from the feature registry file, then run `npm run registry:materialize-uuids` (moves UUID to `removedIdentities` in manifest).  
**Alternative (single identity):** `npm run registry:remove -- <path|id|uuid>` — then skip manual block delete for that row.

---

### A.2 — Derive removal list from plain language

**Apply in TASK 1.** Do not ask the user for a table.

1. Extract `removalDescription` from prompt («what to remove»).
2. Resolve context via [AGENT_UI_ELEMENTS.md §A.14](./AGENT_UI_ELEMENTS.md#a14--autonomous-context-resolution-feature-or-page) (feature, targetFile, UPPER).
3. Grep `<targetFile>` and registry file for matching elements.
4. Map user phrases → registry members (A.3).
5. Include **all** identities whose JSX will be deleted (labels + inputs come in pairs when user says «remove field X»).
6. Print full **Removal Inventory** table in TASK 1 Progress Report.

**Ambiguity → safe defaults (never ask):**

| User phrase | Remove these rows |
|-------------|-------------------|
| «field N» / «input N» | `FIELDN_LABEL` + `FIELDN_INPUT` (both) |
| «gallery» / «image upload» / «image picker» | All **GALLERY** group rows in target JSX |
| «submit» / «save button» | `ACTIONS.SUBMIT_BUTTON` or `ACTIONS.SAVE_BUTTON` (whichever exists) |
| «cancel button» | `ACTIONS.CANCEL_BUTTON` |
| «header» / «title section» | All **HEADER** group rows |
| «all form fields» | All **FORM** group rows (not container) |
| «everything except container» | All identities in targetFile except `<containerMember>` |

**If zero matches after search** → **STOP** — fixed message: «No matching elements found.» (do not ask which element).

---

### A.3 — Phrase → removal mapping

| Phrase in user text | Match strategy |
|---------------------|----------------|
| «remove submit button» | Grep registry + JSX for `SUBMIT_BUTTON`, `SAVE_BUTTON`, or button text matching submit/save |
| «remove gallery» / «remove image preview» | All `GALLERY.*` members used in `<targetFile>` |
| «remove field 2» | `FORM.FIELD2_LABEL` + `FORM.FIELD2_INPUT` |
| «remove text inputs» | All `*_INPUT` with Kind text-input in **FORM** |
| «remove list» / «remove cards» | All **LIST** group members + repeatable JSX |
| Element named in registry description | Match `description` column in registry file |

---

### A.4 — Protected elements (do not remove unless explicit)

| Member pattern | Rule |
|----------------|------|
| `<UPPER>.PAGE.CONTAINER` | Keep unless user says delete entire page/feature |
| Page section root `CONTAINER` | Keep if it is the only wrapper for the page |
| Identities not in `<targetFile>` grep | Do not remove (may belong to another page) |
| `.dom.` / `SHELL` structural identities | Remove only if user targets that structure explicitly |

---

### A.5 — Locale key removal

For each removed identity with `translationKey` = `feature.section.leaf`:

1. Delete `leaf` from `en.json` and `ar.json` under `"<feature>" → "<section>"`.
2. If section object becomes empty, delete the section key.
3. Run `npm run i18n:sync` then `npm run i18n`.
4. Optional cleanup: `npm run i18n:prune-orphans -- --apply` **only after** i18n passes.

---

### A.6 — Repeatable elements

When removing `PREVIEW_IMAGE`, `LIST.CARD`, or any `repeatable: true` identity:

1. Remove the single `.map()` block (or all instances) from JSX.
2. Remove **one** registry block (the repeatable identity).
3. Do not leave orphan `data-ui-instance-id` nodes.

---

## Part B — Agent Execution Protocol

| # | Rule |
|---|------|
| R1 | Execute **TASK 0 → TASK 15** in order. |
| R2 | **Never** start TASK *N+1* until TASK *N* is **PASS**. |
| R3 | Print **Progress Report** after every TASK; TASK 1 must include the **full removal table**. |
| R4 | Never ask the user any question — use A.0, A.2, A.14 (from AGENT_UI_ELEMENTS). |
| R5 | Never remove identities still referenced in JSX (TASK 8 verifies). |
| R6 | Never remove identities not listed in TASK 1 removal inventory. |
| R7 | Never hand-edit `uuid` fields — delete registry blocks; let materialize update manifest. |
| R8 | Do not modify Phase 1 wiring files (`registry.ts`, `index.ts`, i18n route manifest). |

---

## TASK 0 — Resolve Context + Capture Removal Description

Same as [AGENT_UI_ELEMENTS.md TASK 0](./AGENT_UI_ELEMENTS.md#task-0--resolve-context--capture-ui-description), except:

```text
removalDescription=<extracted «what to remove» text>
```

**Progress Report:** `TASK 0: PASS — context resolved, removalDescription captured`

---

## TASK 1 — Derive Removal Inventory (Mandatory)

**Objective:** Convert `removalDescription` → table of registry members to delete.

```text
Feature: <feature>
Context: <feature|page>
Target file: <targetFile>
Container (protected): <containerMember>

| # | registryMember | path | jsxTag | translationKey | reason |
|---|----------------|------|--------|----------------|--------|
| 1 | UPPER.FORM.FIELD2_LABEL | feature.form.display.field2-label | label | feature.form.field2Label | user: remove field 2 |
| 2 | UPPER.FORM.FIELD2_INPUT | feature.form.input.field2 | input | feature.form.field2 | user: remove field 2 |
```

**Verification**

- [ ] ≥ 1 row
- [ ] No protected container rows unless user explicitly requested full page delete
- [ ] Every row exists in registry file (grep `path` or `id`)
- [ ] Every row has JSX in `<targetFile>` (or implementation file)
- [ ] Full table printed; user was **not** asked

**Progress Report:** `TASK 1: PASS — removal inventory derived (N rows)` + **include full table**

---

## TASK 2 — Resolve Paths

```text
feature=<feature>
UPPER=<UPPER>
registryFile=src/platform/ui/registry/features/<feature>.ts
localesEn=src/platform/ui/i18n/locales/<feature>/en.json
localesAr=src/platform/ui/i18n/locales/<feature>/ar.json
targetFile=<from TASK 0>
implementationFile=<same as targetFile or imported component path>
removalRowCount=<N>
```

**Progress Report:** `TASK 2: PASS — paths resolved`

---

## TASK 3 — Write Removal Plan

One block per inventory row:

```text
=== REMOVAL PLAN ===
#1 UPPER.FORM.FIELD2_LABEL
  path: feature.form.display.field2-label
  registryFile: delete block FORM.FIELD2_LABEL
  locale: delete form.field2Label from en + ar
  jsx: remove <label data-ui-uuid={…FIELD2_LABEL…}>
#2 UPPER.FORM.FIELD2_INPUT
  ...
=== END PLAN ===
```

**Progress Report:** `TASK 3: PASS — removal plan complete`

---

## TASK 4 — Remove JSX

**File:** `<implementationFile>`

1. Delete DOM nodes for every inventory row.
2. Remove empty wrapper `div`s only if they have **no** `data-ui-uuid` and no children.
3. Do not remove `<containerMember>` unless in removal inventory.
4. Fix imports/hooks if now unused.

**Verification**

- [ ] No `data-ui-uuid` in file for removed members
- [ ] Container still renders valid tree

**Progress Report:** `TASK 4: PASS — JSX cleaned`

---

## TASK 5 — Remove Registry Identities

**File:** `<registryFile>`

Delete each identity block from TASK 1 (entire `KEY: { … } as const,` entry).

- [ ] No hand-edited `uuid`
- [ ] Empty groups removed (optional cleanup)

**Progress Report:** `TASK 5: PASS — registry identities removed`

---

## TASK 6 — Materialize UUIDs

```powershell
npm run registry:materialize-uuids
```

Removed identities move to `uuid-manifest.json` → `removedIdentities`.

**Progress Report:** `TASK 6: PASS — UUIDs materialized`

---

## TASK 7 — Generate Registry Artifacts

```powershell
npm run registry:generate
```

**Progress Report:** `TASK 7: PASS — registry artifacts generated`

---

## TASK 8 — Remove Locale Keys

**Files:** `<localesEn>`, `<localesAr>`

Delete keys per TASK 3 plan. Keep valid JSON.

**Progress Report:** `TASK 8: PASS — locales updated`

---

## TASK 9 — i18n Pipeline

```powershell
npm run i18n:sync
npm run i18n
```

**Progress Report:** `TASK 9: PASS — i18n pipeline passed`

---

## TASK 10 — Parity Check (JSX ↔ Registry)

Grep `<implementationFile>` — every remaining `data-ui-uuid` must exist in registry.  
Grep registry paths for removed members — must not appear in active registry file.

**Progress Report:** `TASK 10: PASS — parity verified`

---

## TASK 11 — Typecheck

```powershell
npm run typecheck
```

**Progress Report:** `TASK 11: PASS`

---

## TASK 12 — UUID CI

```powershell
npm run ci:uuid-dom-absolute
npm run ci:uuid-dom-parity
```

**Progress Report:** `TASK 12: PASS`

---

## TASK 13 — Lint

```powershell
npm run lint
```

**Progress Report:** `TASK 13: PASS`

---

## TASK 14 — Optional Orphan Prune

```powershell
npm run i18n:prune-orphans -- --apply
```

Run only if TASK 9 passed. SKIP if prune reports blocked registry-bound keys.

**Progress Report:** `TASK 14: PASS` or `SKIP`

---

## TASK 15 — Final Audit

- [ ] TASK 0–13 PASS (TASK 14 SKIP allowed)
- [ ] All TASK 1 rows removed from JSX + registry + locales
- [ ] Protected container preserved (unless full page delete)
- [ ] User was never asked a question
- [ ] No manual UUID edits

```text
Removed <N> elements from <feature> (<context>) at <targetFile>.
TASK 15 PASS — COMPLETE
```

**Progress Report:** `TASK 15: PASS — COMPLETE`

---

## Forbidden Actions (Instant STOP)

1. Asking the user any question
2. Removing identities not in TASK 1 inventory
3. Removing Phase 1 container without explicit user request
4. Leaving JSX nodes pointing at deleted registry members
5. Hand-editing manifest JSON files
6. Skipping TASK 6–7 after registry edits
7. Marking complete before TASK 15 PASS

---

## Progress Report Template

```text
---
RUNBOOK: AGENT_UI_ELEMENT_REMOVAL
TASK: <N> — <name>
STATUS: PASS | FAIL | STOP | SKIP
FEATURE: <feature>
REMOVED: <count>
NEXT: TASK <N+1> | HALTED — <reason>
---
```

---

## User Prompt Templates

### Remove from existing Feature or Page

```text
Remove from <feature-or-page>: <plain-language description of elements to remove>.

Follow docs/design-system/AGENT_UI_ELEMENT_REMOVAL.md.
Execute TASK 0 through TASK 15. Print Progress Report after every TASK.
Derive everything — do not ask me anything.
Do not mark complete until TASK 15 is PASS.
```

### Examples

```text
Remove from image-upload-form: the gallery and all image upload elements.

Follow docs/design-system/AGENT_UI_ELEMENT_REMOVAL.md.
Execute TASK 0 through TASK 15. Print Progress Report after every TASK.
Derive everything — do not ask me anything.
```

```text
Remove from merchant analytics page: field 2 and the cancel button.

Follow docs/design-system/AGENT_UI_ELEMENT_REMOVAL.md.
Execute TASK 0 through TASK 15. Print Progress Report after every TASK.
Derive everything — do not ask me anything.
```

---

## Related Runbooks

| Task | Document |
|------|----------|
| Add UI elements | [AGENT_UI_ELEMENTS.md](./AGENT_UI_ELEMENTS.md) |
| New feature scaffold | [AGENT_FEATURE_CREATION.md](./AGENT_FEATURE_CREATION.md) |
| New page scaffold | [AGENT_PAGE_CREATION.md](./AGENT_PAGE_CREATION.md) |
| Registry commands | [UI_CREATION_RULES.md](./UI_CREATION_RULES.md) |
