# GoVa Agent Guide: Project Philosophy & UI Lifecycle

**Status:** Read this first.  
**Audience:** Any AI agent working on features, pages, or UI elements in GoVa.  
**Purpose:** One document that explains **why** the project is built this way and **which runbook** to follow for each operation.

The detailed step-by-step TASK lists live in separate runbooks. This file is the **map and philosophy** — not a replacement for them.

---

## 1. What GoVa Optimizes For

GoVa treats UI as **registered, traceable infrastructure** — not ad-hoc JSX.

| Goal | How the project enforces it |
|------|----------------------------|
| Every visible/interactive node is identifiable | UUID-first registry + `data-ui-uuid` on native DOM |
| Copy is translatable and bound | `t(REGISTRY.IDENTITY)` — never loose string keys when an identity exists |
| CI catches drift | ESLint rules + UUID DOM parity + i18n binding validation |
| Agents fail predictably | Strict runbooks with TASK 0→N, PASS/FAIL/STOP |
| Users speak in plain language | Agents derive technical details — **never ask the user for tables or Group/Key** |

**Core principle:** There is no shortcut around the registry. If it renders in app UI, it must be registered, bound, and (when applicable) translated.

---

## 2. Mental Model: Three Layers

Think in three layers. Each layer has a different runbook.

```text
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1 — FEATURE NAMESPACE                                │
│  New product area: registry file + i18n + route wiring      │
│  Example: image-upload-form, merchant                       │
│  Runbook: AGENT_FEATURE_CREATION.md                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2 — PAGE / ROUTE                                     │
│  New URL inside an existing feature                         │
│  Example: /merchant/analytics inside merchant               │
│  Runbook: AGENT_PAGE_CREATION.md                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3 — UI ELEMENTS                                      │
│  Buttons, inputs, galleries, headings inside a page         │
│  Add → AGENT_UI_ELEMENTS.md                                 │
│  Remove → AGENT_UI_ELEMENT_REMOVAL.md                       │
└─────────────────────────────────────────────────────────────┘
```

### Feature vs Page

| Term | Meaning | Registry | Typical route file |
|------|---------|----------|-------------------|
| **Feature** | i18n + registry **namespace** (`<feature>`) | `registry/features/<feature>.ts` | First route often `/<feature>` |
| **Page** | Additional **route** under that namespace | Same registry file; new **Group** (e.g. `ANALYTICS`) | `src/app/(app)/<route>/page.tsx` |
| **UI element** | One intrinsic DOM node | One identity `UPPER.Group.Key` | JSX in route or `src/components/<feature>/` |

**Rule:** One feature file holds many pages and many element groups. Pages do **not** get their own feature namespace unless you are creating a brand-new feature.

---

## 3. Two-Phase Lifecycle (Scaffold → UI)

Every feature and page is built in **two phases**. Phase order is fixed.

```text
PHASE 1 — SCAFFOLD (container only)
  • One empty container div with data-ui-uuid={….CONTAINER}
  • Wire registry, i18n, route, CI
  • NO buttons, inputs, titles, or business UI

PHASE 2 — UI ELEMENTS (everything the user described)
  • Derive element inventory from plain language
  • Register identities → locales → JSX
  • Same pipeline for add; reverse pipeline for remove
```

**Why two phases?**

1. Separates **infrastructure wiring** (easy to automate, must not break) from **product UI** (varies per request).
2. Phase 1 always produces a valid, CI-clean route before any complexity is added.
3. Phase 2 can run alone when the scaffold already exists (most common after first deploy).

Phase 1 and Phase 2 may appear in **one user prompt** or as **separate prompts**. The agent chooses based on what already exists in the codebase — not by asking the user.

---

## 4. The Universal Element Pipeline

Element **type never changes the pipeline**. Only `Group`, `Key`, and `Kind` change.

### Adding an element

```text
User plain language
       ↓
Agent derives inventory (1 row = 1 DOM node)
       ↓
registry/features/<feature>.ts   (identity block, no manual uuid)
       ↓
en.json + ar.json                (if translatable)
       ↓
JSX with data-ui-uuid + t(IDENTITY)
       ↓
npm run registry:materialize-uuids
npm run registry:generate
npm run i18n
npm run typecheck
npm run ci:uuid-dom-absolute && npm run ci:uuid-dom-parity
npm run lint
```

### Removing an element

Same chain, **reversed**:

```text
User plain language → removal inventory
       ↓
Delete JSX nodes
       ↓
Delete registry blocks (UUID preserved in removedIdentities via materialize)
       ↓
Delete locale keys
       ↓
Same regenerate + CI commands
```

**Never hand-edit:** `uuid` fields, `uuid-manifest.json`, `registry-member-paths.json`, `source-index.ts`.

**Phase 1 wiring files** (`registry.ts`, `index.ts`, `generate-registry-member-paths.ts`, i18n route manifest) are touched only when creating a **new feature** — not when adding/removing UI on an existing feature.

---

## 5. One DOM Node = One Identity

Decomposition rule (non-negotiable):

| User sees | Inventory rows |
|-----------|------------------|
| One text field | `LABEL` + `INPUT` (two rows) |
| Submit + cancel | `SUBMIT_BUTTON` + `CANCEL_BUTTON` (two rows) |
| Gallery with picker | `CONTAINER` + `SELECT_BUTTON` + `FILE_INPUT` + `PREVIEW_IMAGE` |
| List of cards | one repeatable identity per repeated **same** node type in `.map()` |

**Kind** (label, text-input, button, gallery, preview-image, …) picks path role and translation rules. Full Kind table: [AGENT_UI_ELEMENTS.md §A.4](./AGENT_UI_ELEMENTS.md#a4--kind-reference-complete).

**Repeatable:** Same `data-ui-uuid` in a loop + unique `data-ui-instance-id` per instance.

---

## 6. Zero-Question Policy

The user provides **where + what** in one sentence. The agent derives **everything else**.

| User may say | Agent derives (never ask) |
|--------------|---------------------------|
| «Add submit button to image-upload-form» | feature, targetFile, Group, Key, Kind, EN/AR strings |
| «Remove gallery from image-upload-form» | removal inventory, registry paths, locale keys |
| «Create feature X with two inputs» | Phase 1 scaffold + Phase 2 inventory |

**Forbidden:** Asking for Element Inventory tables, Group/Key/Kind, file paths, or confirmation.

**Allowed STOP (fixed message only, no question):**

- Target feature/page does not exist → run Phase 1 runbook first
- Prompt has no UI intent → «Include what to add/remove in plain language.»
- No matching elements for removal → «No matching elements found.»

**Ambiguity defaults** (add): one field if count omitted; full gallery pattern if «images» mentioned; numbered `FIELD1`, `FIELD2`, …  
Details: [AGENT_UI_ELEMENTS.md §A.12–A.14](./AGENT_UI_ELEMENTS.md).

---

## 7. Which Runbook? (Decision Tree)

```text
Does registry/features/<feature>.ts exist?
│
├─ NO  → Creating new namespace?
│         YES → AGENT_FEATURE_CREATION.md (TASK 0–21)
│         NO  → STOP (invalid target)
│
└─ YES → What is the user asking?
          │
          ├─ New route under existing feature
          │    → AGENT_PAGE_CREATION.md (TASK 0–21)
          │
          ├─ Add UI (buttons, inputs, …)
          │    → AGENT_UI_ELEMENTS.md (TASK 0–17)
          │
          └─ Remove UI
               → AGENT_UI_ELEMENT_REMOVAL.md (TASK 0–15)
```

**Quick checks**

| File exists | Operation |
|-------------|-----------|
| `registry/features/<feature>.ts` missing | Feature creation |
| Registry exists, new `src/app/(app)/…/page.tsx` missing | Page creation |
| Route/component exists, user describes new widgets | Add UI |
| User describes removing widgets | Remove UI |

Agents detect `<feature>` by matching prompt tokens and codebase paths — see [AGENT_UI_ELEMENTS.md §A.14](./AGENT_UI_ELEMENTS.md#a14--autonomous-context-resolution-feature-or-page).

---

## 8. Where Code Lives

```text
src/platform/ui/registry/features/<feature>.ts   ← all identities for feature
src/platform/ui/i18n/locales/<feature>/en.json   ← English
src/platform/ui/i18n/locales/<feature>/ar.json   ← Arabic
src/app/(app)/<route>/page.tsx                   ← thin App Router page
src/components/<feature>/*.tsx                   ← composed UI (preferred when >8 nodes)
```

**Thin route pattern:** `page.tsx` imports a component; heavy JSX lives under `src/components/`.

**App shell:** Most routes sit under `src/app/(app)/` and inherit `AppShell`. Splash stays at `/` outside `(app)`.

---

## 9. Agent Role: Weak Executor

Agents in this project are **not designers**.

| Do | Do not |
|----|--------|
| Follow TASK order strictly | Skip TASKs or merge steps |
| Print Progress Report after each TASK | Mark complete early |
| Derive inventory from user text | Invent UI beyond the description |
| Run CI commands after registry/locale edits | Hand-edit UUIDs or generated JSON |
| Use semantic theme tokens | Hardcode arbitrary Tailwind values |
| Append UI to existing pages | Delete unrelated elements |

Runbooks define **PASS / FAIL / STOP**. FAIL → fix and re-run the same TASK. STOP → halt with a fixed message (no questions).

---

## 10. Operation Summary

| Operation | Phase | Runbook | TASK range | Delivers |
|-----------|-------|---------|------------|----------|
| Create **Feature** | 1 | [AGENT_FEATURE_CREATION.md](./AGENT_FEATURE_CREATION.md) | 0–21 | Namespace + container route |
| Create **Page** | 1 | [AGENT_PAGE_CREATION.md](./AGENT_PAGE_CREATION.md) | 0–21 | Route + container component |
| **Add** UI | 2 | [AGENT_UI_ELEMENTS.md](./AGENT_UI_ELEMENTS.md) | 0–17 | Registry + locales + JSX |
| **Remove** UI | — | [AGENT_UI_ELEMENT_REMOVAL.md](./AGENT_UI_ELEMENT_REMOVAL.md) | 0–15 | Clean removal + CI |

Feature + UI or Page + UI in one prompt = Phase 1 TASKs first, then Phase 2 TASKs. Do not start Phase 2 until Phase 1 TASK 21 is PASS.

---

## 11. User Prompt Patterns (Copy-Ready)

### New feature + UI

```text
Create feature <feature> (route /<route>).
UI: <plain-language description>.

Phase 1 — AGENT_FEATURE_CREATION.md TASK 0–21.
Phase 2 — AGENT_UI_ELEMENTS.md TASK 0–17.
Print Progress Report after every TASK. Derive everything — do not ask me anything.
```

### New page + UI

```text
Add page to <feature>: route /<route>, <pageSlug> page.
UI: <plain-language description>.

Phase 1 — AGENT_PAGE_CREATION.md TASK 0–21.
Phase 2 — AGENT_UI_ELEMENTS.md TASK 0–17.
Print Progress Report after every TASK. Derive everything — do not ask me anything.
```

### Add to existing feature/page

```text
Add to <feature-or-page>: <what to add>.

Follow AGENT_UI_ELEMENTS.md TASK 0–17.
Print Progress Report after every TASK. Derive everything — do not ask me anything.
```

### Remove from existing feature/page

```text
Remove from <feature-or-page>: <what to remove>.

Follow AGENT_UI_ELEMENT_REMOVAL.md TASK 0–15.
Print Progress Report after every TASK. Derive everything — do not ask me anything.
```

---

## 12. Non-Negotiable Forbidden Patterns

| Forbidden | Why |
|-----------|-----|
| Manual `uuid` edits | Breaks manifest immutability CI |
| `t('feature.section.key')` when identity exists | Breaks registry binding enforcement |
| `data-ui-id` / legacy `Ui*` factories | Removed architecture |
| `src/features/<feature>/page.tsx` | Wrong folder; use App Router + components |
| Skipping `materialize-uuids` / `registry:generate` after registry edits | Stale CI artifacts |
| Extra wrapper `<div>` without `data-ui-uuid` | Fails UUID DOM absolute CI |
| Arbitrary Tailwind (`min-h-[200px]`) | Fails design-token ESLint |
| Asking user for inventory / Group / Key | Violates zero-question policy |

Protected on removal: Phase 1 **container** identity unless user explicitly deletes the whole page.

---

## 13. Supporting References

| Topic | Document |
|-------|----------|
| **This guide (start here)** | AGENT_PROJECT_PHILOSOPHY.md |
| Create feature | [AGENT_FEATURE_CREATION.md](./AGENT_FEATURE_CREATION.md) |
| Create page | [AGENT_PAGE_CREATION.md](./AGENT_PAGE_CREATION.md) |
| Add UI | [AGENT_UI_ELEMENTS.md](./AGENT_UI_ELEMENTS.md) |
| Remove UI | [AGENT_UI_ELEMENT_REMOVAL.md](./AGENT_UI_ELEMENT_REMOVAL.md) |
| Registry & route rules | [UI_CREATION_RULES.md](./UI_CREATION_RULES.md) |
| Translations | [i18n.md](./i18n.md) |
| Theme & tokens | [THEME_RULES.md](./THEME_RULES.md) |

---

## 14. End-to-End Example (How the Pieces Fit)

**User:** «Create feature image-upload-form with three text inputs and an image gallery with file picker.»

```text
1. AGENT_FEATURE_CREATION → image-upload-form namespace, route /image-upload-form,
   empty PAGE.CONTAINER, i18n wired, CI PASS

2. AGENT_UI_ELEMENTS TASK 1 derives 10 rows (3× label+input, gallery block)

3. Registry gets FORM.* and GALLERY.* groups

4. Locales get form.field1Label, gallery.selectButton, …

5. Component image-upload-form-content.tsx implements JSX with hooks for file picker

6. materialize → generate → i18n → typecheck → uuid CI → lint → TASK 17 PASS
```

**Later user:** «Remove gallery from image-upload-form.»

```text
1. AGENT_UI_ELEMENT_REMOVAL TASK 1 matches GALLERY.* rows

2. JSX gallery section deleted; registry blocks removed; locale keys deleted

3. Same CI pipeline → TASK 15 PASS
```

The feature namespace and route **stay**. Only Layer 3 elements change.

### Inspector route list (UI Inspector dropdown)

Inspector preview routes are **not** manual. They are discovered by scanning every `src/app/**/page.tsx` (including nested routes like `/merchant/analytics`).

| Mechanism | When |
|-----------|------|
| `GET /api/devtools/app-routes` | Live scan on each inspector load / refresh (development) |
| `npm run routes:generate` | Writes `app-route-manifest.json` fallback; runs on `npm run dev` and `registry:generate` |

Excluded from picker: `/devtools/*`, `/api/*`.  
Adding a new `page.tsx` anywhere under `src/app` is enough — no inspector wiring TASK required.

---

## 15. One-Sentence Summary

**GoVa UI is registry-first, two-phase, and agent-executed: scaffold the container, then add or remove registered DOM nodes through a fixed pipeline — with plain-language input from the user and zero technical questions from the agent.**
