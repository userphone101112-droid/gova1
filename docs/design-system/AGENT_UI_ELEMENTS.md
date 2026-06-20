# Agent Runbook: Add UI Elements (Phase 2 — Zero-Error Protocol)

**Status:** Mandatory. Non-negotiable.  
**Audience:** AI agents (primary). Humans may read Part A for understanding.  
**Goal:** Add **any** UI elements to an existing feature/page — zero registry, i18n, UUID, or lint errors.

> **New agent?** Read **[AGENT_PROJECT_PHILOSOPHY.md](./AGENT_PROJECT_PHILOSOPHY.md)** first for project design and runbook selection.

> **Zero-Question Policy.** The user gives **one plain-language sentence** (what to add, where).  
> The agent **must never ask the user anything** — not for inventory tables, Group, Key, Kind,  
> target files, routes, component names, or confirmation. **Derive everything** from the prompt  
> plus the codebase (Part A.0, A.12, A.14). If a detail is missing, pick the **safe default** — do not STOP to ask.

> **Scope:** Works on:
> - **Feature** — route `src/app/(app)/<feature>/page.tsx` (after [AGENT_FEATURE_CREATION.md](./AGENT_FEATURE_CREATION.md) TASK 21), or
> - **Page** — component under `src/components/<feature>/` (after [AGENT_PAGE_CREATION.md](./AGENT_PAGE_CREATION.md) TASK 21).
>
> Phase 1 does **not** need to be in the same prompt. If the feature/page already exists, start at TASK 0 here.

> **Prerequisite:** Target feature registry + route/component must exist. If not → run Phase 1 runbook first, **without asking the user** which runbook (derive from whether `registry/features/<feature>.ts` exists).

---

## Part A — How to Add Any Element (Read First)

This section teaches **how to describe any UI** so Phase 2 always succeeds.  
Element **type does not change the pipeline** — only `Kind`, `Group`, and `Key` change.

### A.0 — Zero-Question Policy (mandatory)

The agent is a **silent executor**. The user must never be interrupted.

| User may provide (optional) | Agent must derive (never ask) |
|-----------------------------|-------------------------------|
| Feature or page name | `<feature>`, `<UPPER>`, `<route>` |
| Plain-language UI text | Full Element Inventory (TASK 1) |
| — | `<targetFile>`, `<implementationFile>`, `<containerMember>` |
| — | Group, Key, Kind, Repeatable for every row |
| — | EN + AR translation strings |
| — | Whether context is Feature vs Page |

**Forbidden agent behaviors:**

- Asking «Which feature?», «Which file?», «What Group/Key?», «Please fill this table»
- STOPping because the prompt omitted technical placeholders
- Waiting for confirmation before editing files
- Inventing UI **beyond** what the user described (still forbidden)

**Only allowed STOP (no question — execute autonomously or halt with a fixed message):**

| Condition | Agent action |
|-----------|--------------|
| Feature registry file missing | Run [AGENT_FEATURE_CREATION.md](./AGENT_FEATURE_CREATION.md) or [AGENT_PAGE_CREATION.md](./AGENT_PAGE_CREATION.md) first — derive which from codebase |
| Zero UI intent in prompt | STOP — message: «Include what to add in plain language.» (do not ask follow-ups) |
| Target route/component not found after A.14 search | STOP — message: «Target not found; create Phase 1 scaffold first.» |

---

### A.1 — Universal rule (every element, no exceptions)

Every visible or interactive DOM node follows the **same 4 steps**:

```text
1. Inventory row   →  one intrinsic DOM node = one table row
2. Registry        →  identity in registry/features/<feature>.ts (no uuid)
3. Locales         →  en.json + ar.json key (if translatable)
4. JSX             →  data-ui-uuid={UPPER.Group.Key.uuid} + t(IDENTITY) for text
```

Then run: `materialize-uuids` → `registry:generate` → `i18n` → `typecheck` → `uuid CI` → `lint`.

**The pipeline never changes.** Only the inventory rows change.

---

### A.2 — Decompose any screen into inventory rows

**Algorithm (apply to any design):**

1. List every **intrinsic** HTML node you will render: `div`, `h1`, `label`, `input`, `button`, `img`, `a`, `select`, `textarea`, `span`, `svg`, …
2. **One node = one row** in the inventory. Never merge label + input into one row.
3. Assign each row to a **Group** (logical section): `PAGE`, `FORM`, `HEADER`, `GALLERY`, `LIST`, `ACTIONS`, …
4. Pick a **Key** (unique within Group): `TITLE`, `EMAIL_INPUT`, `SUBMIT_BUTTON`, …
5. Pick a **Kind** from the table in §A.4 (closest match — do not invent new Kind values).
6. Set **Repeatable** = `yes` only if the **same identity** appears in a `.map()` loop (lists, cards, gallery thumbnails).

**Do not include** the Phase 1 scaffold container in the inventory unless you are replacing it.

---

### A.3 — Element Inventory (agent-generated — not user input)

The inventory table is **written by the agent in TASK 1** from the user's UI description.  
The user **must not** be asked to fill Group, Key, Kind, or Repeatable columns.

#### What the user provides (only — everything else is derived)

```text
<where> + <what to add in plain language>
```

Examples (complete prompts — copy any pattern):

```text
Add to image-upload-form: a submit button and a cancel button.
```

```text
On merchant analytics page: add a page title and two text inputs for date range.
```

```text
UI for settings: a toggle row with label and description for dark mode.
```

The agent extracts `uiDescription` = the «what to add» clause. Never request a separate UI block.

#### What the agent produces in TASK 1 (mandatory output)

```text
Feature: <feature>
UPPER: <UPPER>
Target file: src/app/(app)/<feature>/page.tsx
Container: <UPPER>.PAGE.CONTAINER

| # | Description | Group | Key | Kind | Repeatable |
|---|-------------|-------|-----|------|------------|
| … | (one row per DOM node) | … | … | … | no/yes |
```

| Column | Who fills | Rules |
|--------|-----------|-------|
| **#** | Agent | Sequential 1, 2, 3… |
| **Description** | Agent | Short label — becomes registry `description` |
| **Group** | Agent | `FORM`, `GALLERY`, `HEADER`, `ACTIONS`, … — see §A.8 |
| **Key** | Agent | `UPPER_SNAKE`, unique per Group |
| **Kind** | Agent | **Only** values from §A.4 |
| **Repeatable** | Agent | `yes` only for `.map()` loops — see §A.12 |

---

### A.4 — Kind reference (complete)

Use **exactly one** Kind per row. If unsure, use §A.6 decision tree.

| Kind | HTML / usage | category | Path role | Translation? |
|------|--------------|----------|-----------|--------------|
| `heading` | `h1`–`h6` | `display` | `display` | Yes |
| `paragraph` | `p` | `display` | `display` | Yes |
| `label` | `label`, visible `span` as caption | `display` | `display` | Yes |
| `text` | static `span` text | `display` | `display` | Yes |
| `text-input` | `input` text/email/tel/number/password | `input` | `input` | Yes (placeholder via `t()`) |
| `textarea` | `textarea` | `input` | `input` | Yes |
| `file-input` | `input type="file"` (often hidden) | `input` | `input` | Yes |
| `select` | `select` | `input` | `input` | Yes |
| `checkbox` | `input type="checkbox"` | `input` | `input` | Yes |
| `button` | `button` | `action` | `actions` | Yes |
| `link-button` | `a` styled as button | `action` | `actions` | Yes |
| `nav-link` | `a` navigation | `navigation` | `navigation` | Yes |
| `tab` | tab trigger | `navigation` | `navigation` | Yes |
| `container` | layout `div` / `section` / `main` wrapper | `container` | `layout` | No |
| `section` | semantic section wrapper | `container` | `layout` | No |
| `row` | flex/grid row wrapper | `container` | `layout` | No |
| `gallery` | image grid wrapper | `container` | `layout` | No |
| `img` | static `img` | `display` | `display` | Yes (`alt` via `t()`) |
| `preview-image` | dynamic thumbnail in gallery | `display` | `display` | Yes + `repeatable: yes` |
| `icon` | decorative `svg` with accessible name | `display` | `display` | Yes if named; else container sibling handles text |
| `img-alt` | alt text only (rare — prefer `img` row) | `display` | `display` | Yes |

---

### A.5 — What Agent derives from each row (do not fill manually)

Given: `feature=merchant`, `Group=FORM`, `Key=EMAIL_LABEL`, `Kind=label`

| Derived field | Value |
|---------------|-------|
| **sectionSlug** | `form` (Group → kebab-case) |
| **elementSlug** | `email-label` (Key → kebab-case) |
| **path role** | `display` (from Kind table) |
| **path** | `merchant.form.display.email-label` |
| **id** | `UI_MERCHANT_FORM_EMAIL_LABEL` |
| **registryMember** | `MERCHANT.FORM.EMAIL_LABEL` |
| **translationKey** | `merchant.form.emailLabel` (drop role, camelCase leaf) |
| **en.json path** | `"form": { "emailLabel": "Email" }` |

**Formulas (memorize once):**

```text
path      = <feature>.<sectionSlug>.<role>.<elementSlug>
id        = UI_<UPPER>_<Group>_<Key>
jsx       = <UPPER>.<Group>.<Key>
json leaf = camelCase(elementSlug) under sectionSlug object
```

---

### A.6 — Kind decision tree (when unsure)

```text
Is it a wrapper div/section with no user-visible text?
  YES → Kind = container | section | row | gallery
  NO ↓
Does it accept user typing or file selection?
  YES → Kind = text-input | textarea | file-input | select | checkbox
  NO ↓
Is it clickable and performs an action?
  YES → Kind = button | link-button
  NO ↓
Is it navigation (tabs, menu links)?
  YES → Kind = nav-link | tab
  NO ↓
Is it an image?
  YES → Same identity repeated in .map()? → preview-image + Repeatable yes
        Otherwise → img
  NO ↓
Is it a heading or title?
  YES → heading
  NO ↓
Is it body copy or a label?
  YES → paragraph | label | text
```

---

### A.7 — Common UI patterns → inventory rows

Use these recipes **every time** — they work for any feature/page.

#### Pattern 1: Single text field

```text
| # | Description | Group | Key | Kind | Repeatable |
| 1 | Email label | FORM | EMAIL_LABEL | label | no |
| 2 | Email input | FORM | EMAIL_INPUT | text-input | no |
```

#### Pattern 2: Field with heading section

```text
| 1 | Section title | FORM | SECTION_TITLE | heading | no |
| 2 | Name label | FORM | NAME_LABEL | label | no |
| 3 | Name input | FORM | NAME_INPUT | text-input | no |
```

#### Pattern 3: Submit / cancel actions

```text
| 1 | Actions row | ACTIONS | ROW | row | no |
| 2 | Submit button | ACTIONS | SUBMIT_BUTTON | button | no |
| 3 | Cancel button | ACTIONS | CANCEL_BUTTON | button | no |
```

#### Pattern 4: Image picker + gallery

```text
| 1 | Gallery wrapper | GALLERY | CONTAINER | gallery | no |
| 2 | Select files button | GALLERY | SELECT_BUTTON | button | no |
| 3 | Hidden file input | GALLERY | FILE_INPUT | file-input | no |
| 4 | Preview thumbnail | GALLERY | PREVIEW_IMAGE | preview-image | yes |
```

#### Pattern 5: List of cards (repeatable)

```text
| 1 | List container | LIST | CONTAINER | container | no |
| 2 | Card wrapper | LIST | CARD | container | yes |
| 3 | Card title | LIST | CARD_TITLE | heading | yes |
| 4 | Card body | LIST | CARD_BODY | paragraph | yes |
```

#### Pattern 6: Page header block

```text
| 1 | Header wrapper | HEADER | CONTAINER | container | no |
| 2 | Page title | HEADER | TITLE | heading | no |
| 3 | Page subtitle | HEADER | SUBTITLE | paragraph | no |
```

#### Pattern 7: Settings toggle row (display + button)

```text
| 1 | Row container | SETTINGS | ROW | row | no |
| 2 | Setting label | SETTINGS | LABEL | label | no |
| 3 | Setting description | SETTINGS | DESCRIPTION | paragraph | no |
| 4 | Toggle button | SETTINGS | TOGGLE | button | no |
```

---

### A.8 — Group naming conventions

| Group name | Use when |
|------------|----------|
| `PAGE` | Page-level chrome (title, subtitle) — not the Phase 1 CONTAINER |
| `HEADER` | Top header block |
| `FORM` | Input fields, labels, validation area |
| `ACTIONS` | Primary/secondary buttons |
| `GALLERY` | Images, uploads, previews |
| `LIST` | Repeatable lists, cards, tables |
| `SIDEBAR` | Side navigation or filters |
| `FOOTER` | Bottom actions or legal text |
| `MODAL` | Dialog content (if inline on page) |

Rule: **Group = PascalCase in registry**, **sectionSlug = kebab-case in path** (`FORM` → `form`).

---

### A.9 — Full worked example (inventory → derived plan)

**User request:** «Three text inputs + gallery with image picker»

```text
Feature: image-upload-form
Target file: src/app/(app)/image-upload-form/page.tsx
Container: IMAGE_UPLOAD_FORM.PAGE.CONTAINER

| # | Description | Group | Key | Kind | Repeatable |
| 1 | Field 1 label | FORM | FIELD1_LABEL | label | no |
| 2 | Field 1 input | FORM | FIELD1_INPUT | text-input | no |
| 3 | Field 2 label | FORM | FIELD2_LABEL | label | no |
| 4 | Field 2 input | FORM | FIELD2_INPUT | text-input | no |
| 5 | Field 3 label | FORM | FIELD3_LABEL | label | no |
| 6 | Field 3 input | FORM | FIELD3_INPUT | text-input | no |
| 7 | Gallery wrapper | GALLERY | CONTAINER | gallery | no |
| 8 | Select images button | GALLERY | SELECT_BUTTON | button | no |
| 9 | Hidden file input | GALLERY | FILE_INPUT | file-input | no |
| 10 | Preview thumbnail | GALLERY | PREVIEW_IMAGE | preview-image | yes |
```

**Agent derives (sample rows):**

| # | registryMember | path |
|---|----------------|------|
| 1 | `IMAGE_UPLOAD_FORM.FORM.FIELD1_LABEL` | `image-upload-form.form.display.field1-label` |
| 2 | `IMAGE_UPLOAD_FORM.FORM.FIELD1_INPUT` | `image-upload-form.form.input.field1` |
| 10 | `IMAGE_UPLOAD_FORM.GALLERY.PREVIEW_IMAGE` | `image-upload-form.gallery.display.preview-image` |

---

### A.10 — Where files are edited (any element type)

| Step | File | What changes |
|------|------|--------------|
| Registry | `src/platform/ui/registry/features/<feature>.ts` | Add `Group.Key` identity blocks |
| English | `src/platform/ui/i18n/locales/<feature>/en.json` | Merge keys under `"<sectionSlug>"` |
| Arabic | `src/platform/ui/i18n/locales/<feature>/ar.json` | Same keys as EN |
| UI | `<targetFile>` or `src/components/<feature>/*.tsx` | JSX with `data-ui-uuid` |

**Never edit:** `uuid` fields, `uuid-manifest.json`, `registry-member-paths.json`, `registry.ts`, `index.ts`, `generate-registry-member-paths.ts`.

---

### A.11 — JSX binding reference (any Kind)

| Kind | Minimal JSX |
|------|-------------|
| `heading` | `<h1 data-ui-uuid={U.GRP.TITLE.uuid} className="text-3xl font-bold text-on-surface">{t(U.GRP.TITLE)}</h1>` |
| `label` | `<label data-ui-uuid={U.GRP.LBL.uuid} …>{t(U.GRP.LBL)}</label>` |
| `text-input` | `<input data-ui-uuid={U.GRP.INP.uuid} type="text" placeholder={t(U.GRP.INP)} … />` |
| `button` | `<button type="button" data-ui-uuid={U.GRP.BTN.uuid} …>{t(U.GRP.BTN)}</button>` |
| `container` | `<div data-ui-uuid={U.GRP.CONTAINER.uuid} className="…" />` |
| `file-input` | `<input ref={ref} type="file" data-ui-uuid={U.GRP.FILE.uuid} className="hidden" … />` |
| `preview-image` + repeatable | `<img data-ui-uuid={U.GRP.IMG.uuid} data-ui-instance-id={id} alt={t(U.GRP.IMG)} src={url} />` |

Replace `U.GRP.*` with `<UPPER>.<Group>.<Key>` from inventory.

Styling: semantic tokens only — [THEME_RULES.md](./THEME_RULES.md).

---

### A.12 — Derive inventory from plain-language UI (agent algorithm)

**Apply in TASK 1 for every request.** Do not ask the user for a table.

1. Read the **UI description** from the user prompt (A.0 — extract «what to add»).
2. Split into capabilities (inputs, buttons, containers, lists, images, navigation, …).
3. For each capability, apply matching **Part A.7 pattern** rows.
4. For counts (`three inputs`, `5 fields`), expand to N numbered rows (`FIELD1`, `FIELD2`, …).
5. Assign **Kind** via Part A.4 or decision tree A.6.
6. Set **Repeatable = yes** when the same DOM identity appears inside `.map()` (previews, list cards, table rows).
7. **Never** include Phase 1 scaffold `PAGE.CONTAINER` in the inventory.
8. Print the full table in the TASK 1 Progress Report.

**Ambiguity → safe defaults (never ask the user):**

| Ambiguous phrase | Default expansion |
|------------------|-------------------|
| «a form» / «input fields» with no count | **1** text field (`FIELD1_LABEL` + `FIELD1_INPUT`) |
| «buttons» with no labels | **1** primary button in **ACTIONS** (`SUBMIT_BUTTON`) |
| «gallery» / «images» without picker detail | Pattern 4 from A.7 (full gallery block) |
| «title» / «heading» without level | `HEADER.TITLE`, Kind `heading` |
| Field names not specified | `FIELD1`, `FIELD2`, … numbered in order |

**If the prompt has zero UI intent** → **STOP** with fixed message (A.0). Do not ask a clarifying question.

---

### A.14 — Autonomous context resolution (Feature or Page)

**Run in TASK 0 before any file edit.** Resolve all context from prompt + codebase.

#### Step 1 — Resolve `<feature>`

1. Scan prompt for a kebab-case token matching `src/platform/ui/registry/features/<token>.ts`.
2. Else scan prompt for route segment (`/merchant/analytics` → feature `merchant`).
3. Else if user has a file open under `src/components/<feature>/` or `src/app/(app)/…`, use that feature.
4. First match wins.

#### Step 2 — Resolve Feature vs Page context

| Signal | Context | Default `<targetFile>` |
|--------|---------|------------------------|
| Route is `/<feature>` only | **Feature** (root page) | `src/app/(app)/<feature>/page.tsx` |
| Route has extra segments OR prompt names a page slug | **Page** in feature | `src/components/<feature>/<pageSlug>-page.tsx` or grep route → import |
| Prompt says «on \<feature\> page» / route path | **Page** | Grep `src/app/(app)/<route>/page.tsx` for default export import path |

**Page targetFile algorithm:**

```text
1. Read src/app/(app)/<route-without-leading-slash>/page.tsx
2. Follow import of main content component → that file is <targetFile>
3. If JSX lives inline in route file → <targetFile> = route file
```

#### Step 3 — Resolve `<containerMember>`

1. Grep `<targetFile>` for `data-ui-uuid={<UPPER>…CONTAINER…}` or `PAGE.CONTAINER`.
2. Use that registry member as scaffold root. Default: `<UPPER>.PAGE.CONTAINER`.
3. For Page context, container may be `<UPPER>.<PageSection>.CONTAINER` — use what exists in file.

#### Step 4 — Write resolution block (TASK 0 output)

```text
context=feature | page
feature=<feature>
UPPER=<UPPER>
route=<derived route>
targetFile=<resolved path>
containerMember=<UPPER>.….CONTAINER
uiDescription=<extracted plain text>
```

### A.13 — Phrase → inventory expansions (mandatory mapping)

When the UI description contains these phrases, expand **exactly** as shown (adjust N):

| Phrase in user text | Expansion (add these rows) |
|---------------------|----------------------------|
| «N text input field(s)» / «N input fields» | For i = 1..N: `FIELD{i}_LABEL` label + `FIELD{i}_INPUT` text-input in **FORM** |
| «textarea» / «multiline input» | `DESCRIPTION_LABEL` label + `DESCRIPTION_INPUT` textarea in **FORM** |
| «submit» / «save button» | `SUBMIT_BUTTON` button in **ACTIONS** |
| «cancel button» | `CANCEL_BUTTON` button in **ACTIONS** |
| «container» + «gallery» / «images» / «upload» | `GALLERY.CONTAINER` Kind `gallery` |
| «button» + «select/pick/choose images/files» | `GALLERY.SELECT_BUTTON` button + `GALLERY.FILE_INPUT` file-input |
| «display/show/preview selected images» | `GALLERY.PREVIEW_IMAGE` preview-image, **Repeatable yes** |
| «page title» / «heading» | `HEADER.TITLE` heading in **HEADER** (optional wrapper `HEADER.CONTAINER` container) |
| «list of items» / «cards» | `LIST.CONTAINER` container + `LIST.CARD` container Repeatable yes + child rows Repeatable yes |

#### Canonical example (do not ask user to retype this)

**UI description:**

```text
three text input fields and a container with a button that allows users to
select images from their device files and display the selected images inside the container
```

**Agent must produce exactly these 10 rows** (for `feature=image-upload-form`):

| # | Description | Group | Key | Kind | Repeatable |
|---|-------------|-------|-----|------|------------|
| 1 | Field 1 label | FORM | FIELD1_LABEL | label | no |
| 2 | Field 1 input | FORM | FIELD1_INPUT | text-input | no |
| 3 | Field 2 label | FORM | FIELD2_LABEL | label | no |
| 4 | Field 2 input | FORM | FIELD2_INPUT | text-input | no |
| 5 | Field 3 label | FORM | FIELD3_LABEL | label | no |
| 6 | Field 3 input | FORM | FIELD3_INPUT | text-input | no |
| 7 | Gallery container | GALLERY | CONTAINER | gallery | no |
| 8 | Select images button | GALLERY | SELECT_BUTTON | button | no |
| 9 | Hidden file input | GALLERY | FILE_INPUT | file-input | no |
| 10 | Preview image | GALLERY | PREVIEW_IMAGE | preview-image | yes |

---

## Part B — Agent Execution Protocol

You are a **weak executor**. You derive the inventory in **TASK 1**, then implement **only** those rows. You do **not** invent extra UI beyond the user's description.

### Rules

| # | Rule |
|---|------|
| R1 | Execute **TASK 0 → TASK 17** in order. |
| R2 | **Never** start TASK *N+1* until TASK *N* is **PASS**. |
| R3 | Print **Progress Report** after every TASK; TASK 1 must include the **full inventory table**. |
| R4 | Never type or edit a `uuid` field by hand. |
| R5 | Never use `npm run registry:add` for nested groups — edit `registry/features/<feature>.ts` manually (no `uuid`). |
| R6 | Never use `t('string.key')` when a registry identity exists. |
| R7 | One intrinsic DOM node = one `data-ui-uuid` (unless `repeatable` — see TASK 13). |
| R8 | Do not modify `registry.ts`, `index.ts`, `generate-registry-member-paths.ts`, or i18n route wiring. |
| R9 | Derive inventory in **TASK 1** using **Part A.12–A.13** — **never** ask the user for Group/Key/Kind. |
| R10 | Classify every row using **Part A.4–A.5** in TASK 3. |
| R11 | Use **Part A.7** patterns; one row per DOM node. |
| R12 | **Never STOP** for «missing inventory table» — derive it from UI description instead. |
| R13 | **Never ask the user any question** — use A.0, A.12 defaults, A.14 resolution. |
| R14 | Resolve Feature **or** Page context in TASK 0 via A.14 — do not assume root page only. |
| R15 | When adding to an **existing** page with UI already present, append inventory rows only — do not rebuild unrelated elements. |

### PASS / FAIL / STOP

| Status | Meaning |
|--------|---------|
| **PASS** | All verification items succeeded. Proceed. |
| **FAIL** | Fix and re-run the **same** TASK. |
| **STOP** | Halt only per **A.0** (missing UI intent, target not found, Phase 1 missing). **Never STOP to ask a question.** |

---

## TASK 0 — Resolve Context + Capture UI Description

**Objective:** Autonomously resolve Feature/Page context (A.14) and extract `uiDescription`. **Ask the user nothing.**

| # | Check | How |
|---|-------|-----|
| 0.1 | Registry feature file exists | `src/platform/ui/registry/features/<feature>.ts` — derive `<feature>` via A.14 |
| 0.2 | Locales exist | `en.json` + `ar.json` under `locales/<feature>/` |
| 0.3 | Target file exists | `<targetFile>` from A.14 (route or component) |
| 0.4 | UI intent in prompt | Non-empty «what to add» — extract via A.0 |
| 0.5 | Container in target file | Grep `data-ui-uuid` for `<containerMember>` |

If 0.1–0.3 fail → **STOP** — run Phase 1 runbook (derive which from codebase). **Do not ask.**  
If 0.4 fails → **STOP** — fixed message: «Include what to add in plain language.» **Do not ask.**  
If 0.5 fails → **STOP** — fixed message: «Phase 1 container missing; run scaffold first.»

Write resolution block (A.14 Step 4):

```text
context=feature|page
feature=<feature>
UPPER=<UPPER>
route=<route>
targetFile=<path>
containerMember=<UPPER>.….CONTAINER
uiDescription=<extracted text>
```

**Progress Report:** `TASK 0: PASS — context=<feature|page>, targetFile=<path>, uiDescription captured`

⛔ **Do not start TASK 1 until TASK 0 is PASS.**

---

## TASK 1 — Derive Element Inventory (Mandatory)

**Objective:** Convert `uiDescription` → full inventory table using **Part A.12–A.13**.

**Action (in order):**

1. Apply phrase mappings from **Part A.13**.
2. Apply decomposition rules from **Part A.2** (one DOM node = one row).
3. Apply patterns from **Part A.7** where relevant.
4. Assign **Group**, **Key**, **Kind**, **Repeatable** for every row.
5. Set header from TASK 0 resolution (not hardcoded):

```text
Feature: <feature>
Context: <feature|page>
UPPER: <UPPER>
Target file: <targetFile from TASK 0>
Container: <containerMember from TASK 0>
```

6. **Print the complete inventory table** inside the Progress Report body.

**Verification**

- [ ] ≥ 1 inventory row (excluding Phase 1 container)
- [ ] Every row has Group, Key, Kind from allowed sets
- [ ] No duplicate `Group.Key` pairs
- [ ] Full table printed in Progress Report
- [ ] User was **not** asked to supply the table

**Progress Report:** `TASK 1: PASS — inventory derived (N rows)` + **include full table**

⛔ **Do not start TASK 2 until TASK 1 is PASS.**

---

## TASK 2 — Resolve Target Paths

```text
feature=<feature>
UPPER=<UPPER>
uiDescription=<from TASK 0>
registryFile=src/platform/ui/registry/features/<feature>.ts
localesEn=src/platform/ui/i18n/locales/<feature>/en.json
localesAr=src/platform/ui/i18n/locales/<feature>/ar.json
targetFile=<from TASK 1 header>
containerMember=<from TASK 1 header, e.g. IMAGE_UPLOAD_FORM.PAGE.CONTAINER>
today=YYYY-MM-DD
inventoryRowCount=<N>
```

**Default `<targetFile>`** after AGENT_FEATURE_CREATION: `src/app/(app)/<feature>/page.tsx`  
**Default `<targetFile>`** after AGENT_PAGE_CREATION: `src/components/<feature>/<componentFile>` from Phase 1

- [ ] All paths written
- [ ] `targetFile` exists

**Progress Report:** `TASK 2: PASS — paths resolved`

⛔ **Do not start TASK 3 until TASK 2 is PASS.**

---

## TASK 3 — Classify Every Inventory Row

**Objective:** Apply **Part A.4–A.5** to every row. Extend inventory with derived columns.

**Required derived columns (write in TASK 4 plan):**

`category`, `path`, `id`, `translationKey`, `registryMember`, `repeatable`, `jsxTag`

**Verification**

- [ ] Every row classified per Part A.4
- [ ] Paths have 3 or 4 segments; first segment = `<feature>`
- [ ] No duplicate `id` or `path`
- [ ] Unknown UI mapped via Part A.6 (document choice)

**Progress Report:** `TASK 3: PASS — N elements classified`

⛔ **Do not start TASK 4 until TASK 3 is PASS.**

---

## TASK 4 — Write Full Identity Plan

```text
=== IDENTITY PLAN ===
Feature: <feature>
Target: <targetFile>
Container: <containerMember>
Elements: <N>

#1 FORM.FIELD1_LABEL
  id: UI_...
  path: ...
  category: display
  registryMember: UPPER.FORM.FIELD1_LABEL
  translationKey: feature.form.field1Label
  repeatable: no
  jsxTag: label

(... one block per inventory row ...)
=== END PLAN ===
```

- [ ] Every inventory row has a plan block
- [ ] Scaffold container not duplicated unless user requested

**Progress Report:** `TASK 4: PASS — identity plan complete`

⛔ **Do not start TASK 5 until TASK 4 is PASS.**

---

## TASK 5 — Add Identities to Registry File

**File:** `<registryFile>`

1. Group rows by **Group** column.
2. Add or extend top-level keys under `export const <UPPER> = {`.
3. Insert blocks **without `uuid`**:

```typescript
    <Key>: {
      id: 'UI_<UPPER>_<Group>_<Key>',
      path: '<feature>.<sectionSlug>.<role>.<elementSlug>',
      lifecycle: 'active',
      description: '<Description column>',
      category: '<category>',
      feature: '<feature>',
      version: '1.0.0',
      createdAt: '<today>',
      updatedAt: '<today>',
    } as const,
```

4. If **Repeatable** = `yes`:

```typescript
      repeatable: true,
```

- [ ] All plan elements in registry file
- [ ] No hand-written `uuid:`

**Progress Report:** `TASK 5: PASS — registry identities added`

⛔ **Do not start TASK 6 until TASK 5 is PASS.**

---

## TASK 6 — Materialize UUIDs

```powershell
npm run registry:materialize-uuids
```

- [ ] Exit code `0`
- [ ] Tool injected `uuid:` on new blocks

**Progress Report:** `TASK 6: PASS — UUIDs materialized`

⛔ **Do not start TASK 7 until TASK 6 is PASS.**

---

## TASK 7 — Generate Registry Artifacts

```powershell
npm run registry:generate
```

- [ ] Exit code `0`

**Progress Report:** `TASK 7: PASS — registry artifacts generated`

⛔ **Do not start TASK 8 until TASK 7 is PASS.**

---

## TASK 8 — Update English Locale

**File:** `<localesEn>`

Merge under `"<feature>"` → `"<sectionSlug>"` objects. camelCase leaf keys per Part A.5.

- [ ] Valid JSON; all translatable rows have EN strings

**Progress Report:** `TASK 8: PASS — en.json updated`

⛔ **Do not start TASK 9 until TASK 8 is PASS.**

---

## TASK 9 — Update Arabic Locale

**File:** `<localesAr>`

Same keys as TASK 8 with Arabic strings.

- [ ] Valid JSON; keys match EN

**Progress Report:** `TASK 9: PASS — ar.json updated`

⛔ **Do not start TASK 10 until TASK 9 is PASS.**

---

## TASK 10 — i18n Pipeline

```powershell
npm run i18n:sync
npm run i18n
```

- [ ] Exit code `0` for both

**Progress Report:** `TASK 10: PASS — i18n pipeline passed`

⛔ **Do not start TASK 11 until TASK 10 is PASS.**

---

## TASK 11 — Choose Implementation Location

| Condition | Action |
|-----------|--------|
| ≤ 8 intrinsics total | Edit `<targetFile>` directly |
| > 8 intrinsics | Create `src/components/<feature>/<feature>-content.tsx`, export from `index.ts`, import in route/page |

```text
implementationFile=<chosen path>
```

**Progress Report:** `TASK 11: PASS — implementationFile=<path>`

⛔ **Do not start TASK 12 until TASK 11 is PASS.**

---

## TASK 12 — Implement JSX

**File:** `<implementationFile>`

1. Keep **container** from Phase 1 as root; nest new elements inside.
2. Bind each inventory row per **Part A.11**.
3. Add `'use client'` only if using state, refs, handlers, or `useTranslation`.
4. Match patterns from **Part A.7** when applicable.
5. **Append** to existing JSX when `<targetFile>` already has elements — do not delete unrelated UI.

- [ ] One DOM node per inventory row (or TASK 13 repeatable branch)
- [ ] Static `data-ui-uuid={UPPER.Group.Key.uuid}` only
- [ ] `{t(IDENTITY)}` for all user-visible text
- [ ] Semantic tokens only — [THEME_RULES.md](./THEME_RULES.md)

**Progress Report:** `TASK 12: PASS — JSX implemented`

⛔ **Do not start TASK 13 until TASK 12 is PASS.**

---

## TASK 13 — Repeatable Elements (Conditional)

**IF** no row has `Repeatable = yes` → **SKIP** to TASK 14.

Otherwise:

1. Registry block has `repeatable: true`.
2. `.map()` uses same `data-ui-uuid`.
3. Each instance has unique `data-ui-instance-id={stableId}`.

```tsx
{items.map((item) => (
  <img
    key={item.id}
    data-ui-uuid={<UPPER>.GALLERY.PREVIEW_IMAGE.uuid}
    data-ui-instance-id={item.id}
    src={item.url}
    alt={t(<UPPER>.GALLERY.PREVIEW_IMAGE)}
  />
))}
```

**Progress Report:** `TASK 13: PASS` or `SKIP`

⛔ **Do not start TASK 14 until TASK 13 is PASS or SKIP.**

---

## TASK 14 — Typecheck

```powershell
npm run typecheck
```

- [ ] Exit code `0`

**Progress Report:** `TASK 14: PASS`

⛔ **Do not start TASK 15 until TASK 14 is PASS.**

---

## TASK 15 — UUID CI

```powershell
npm run ci:uuid-dom-absolute
npm run ci:uuid-dom-parity
```

- [ ] Both exit code `0`

**Progress Report:** `TASK 15: PASS`

⛔ **Do not start TASK 16 until TASK 15 is PASS.**

---

## TASK 16 — Lint

```powershell
npm run lint
```

- [ ] Exit code `0`

**Progress Report:** `TASK 16: PASS`

⛔ **Do not start TASK 17 until TASK 16 is PASS.**

---

## TASK 17 — Final Audit

- [ ] TASK 0–16 PASS (TASK 13 SKIP allowed)
- [ ] Inventory was derived in TASK 1 (user was not asked for table)
- [ ] Every inventory row implemented
- [ ] No manual UUID edits
- [ ] Phase 1 wiring files untouched
- [ ] `npm run i18n` ran after locale edits

```text
Feature <feature> complete with UI (<N> elements).
Phase 1 TASK 21 + Phase 2 TASK 17 PASS.
```

**Progress Report:** `TASK 17: PASS — COMPLETE`

---

## Forbidden Actions (Instant STOP)

1. Starting before Phase 1 TASK 21 PASS
2. Elements not in TASK 1 derived inventory
3. Manual `uuid` edits
4. `npm run registry:add` for nested groups
5. `t('string.key')` with existing identity
6. Skipping TASK 6–7 after registry edits
7. Editing Phase 1 wiring files
8. Inventing Kind values outside Part A.4
9. Asking the user **any** question (Group, Key, file path, confirmation, inventory table)
10. Marking complete before TASK 17 PASS

---

## Progress Report Template

```text
---
RUNBOOK: AGENT_UI_ELEMENTS
TASK: <N> — <name>
STATUS: PASS | FAIL | STOP | SKIP
FEATURE: <feature>
ELEMENTS: <count>
NEXT: TASK <N+1> | HALTED — <reason>
---
```

---

## User Prompt Templates

### A — Add UI to existing Feature or Page (standalone — most common)

```text
Add to <feature-or-page>: <plain-language description of elements to add>.

Follow docs/design-system/AGENT_UI_ELEMENTS.md.
Execute TASK 0 through TASK 17. Print Progress Report after every TASK.
Derive everything in TASK 0–1 — do not ask me anything.
Do not mark complete until TASK 17 is PASS.
```

Example:

```text
Add to image-upload-form: a submit button and a cancel button below the gallery.

Follow docs/design-system/AGENT_UI_ELEMENTS.md.
Execute TASK 0 through TASK 17. Print Progress Report after every TASK.
Derive everything — do not ask me anything.
```

### B — New Feature + UI (single message)

```text
Create feature <feature> (route /<route>).

UI: <plain-language description of all elements>

Phase 1 — Follow docs/design-system/AGENT_FEATURE_CREATION.md.
Execute TASK 0 through TASK 21. Print Progress Report after every TASK.

Phase 2 — Follow docs/design-system/AGENT_UI_ELEMENTS.md.
Execute TASK 0 through TASK 17. Print Progress Report after every TASK.
Derive everything — do not ask me anything.
Do not mark complete until Phase 2 TASK 17 is PASS.
```

### C — New Page in existing Feature + UI (single message)

```text
Add page to <feature>: route /<route>, <pageSlug> page.
UI: <plain-language description of elements>

Phase 1 — Follow docs/design-system/AGENT_PAGE_CREATION.md.
Execute TASK 0 through TASK 21. Print Progress Report after every TASK.

Phase 2 — Follow docs/design-system/AGENT_UI_ELEMENTS.md.
Execute TASK 0 through TASK 17. Print Progress Report after every TASK.
Derive everything — do not ask me anything.
```

### D — Remove UI (use other runbook)

```text
Remove from <feature-or-page>: <plain-language description of elements to remove>.

Follow docs/design-system/AGENT_UI_ELEMENT_REMOVAL.md.
Execute TASK 0 through TASK 15. Print Progress Report after every TASK.
Derive everything — do not ask me anything.
```

---

## Related Runbooks

| Phase | Document |
|-------|----------|
| Phase 1 — new feature | [AGENT_FEATURE_CREATION.md](./AGENT_FEATURE_CREATION.md) |
| Phase 1 — new page | [AGENT_PAGE_CREATION.md](./AGENT_PAGE_CREATION.md) |
| **Remove UI elements** | [AGENT_UI_ELEMENT_REMOVAL.md](./AGENT_UI_ELEMENT_REMOVAL.md) |
| Rules reference | [UI_CREATION_RULES.md](./UI_CREATION_RULES.md) |
| Theme | [THEME_RULES.md](./THEME_RULES.md) |
| i18n | [i18n.md](./i18n.md) |
