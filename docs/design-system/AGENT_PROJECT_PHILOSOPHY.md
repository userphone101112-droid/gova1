# GoVa: How the Project Works — Agent Orientation Guide

**Read this before anything else.**

This document teaches **how GoVa is built**, **how work flows through it**, and **how to find your way** without getting lost.  
It is a **map and methodology** — not a law book. Detailed step lists live in the runbooks linked at the end; use them once you know *where you are* in the system.

After reading this, you should be able to:

- Explain how a page goes from an idea to working UI in this codebase
- Know which folder to open first for any task
- Tell what is **already done** vs **still missing** before you write code
- Pick the right runbook without guessing

---

## 1. The Idea Behind GoVa UI

GoVa does not treat UI as free-form JSX. It treats UI as **named, traceable infrastructure**:

```text
Every meaningful DOM node  →  has an identity in the registry
Every identity             →  has a stable UUID
User-visible text          →  flows through t(IDENTITY), bound to locales
CI                         →  checks that registry, DOM, and translations stay in sync
```

This is not bureaucracy for its own sake. It enables:

- **Inspector / devtools** — pick any element on screen and see its registry path
- **i18n** — Arabic and English stay aligned with UI structure
- **Safe refactors** — UUIDs survive renames; removed identities are archived, not reused blindly
- **Predictable agent work** — same pipeline for a button, an input, or a gallery

**Mindset:** You are extending a **registry-backed UI system**, not dropping components into a blank page.

---

## 2. Repository Landmarks (Learn the Terrain)

When you arrive on a task, these folders tell you *what kind of world you are in*:

```text
src/app/                          ← Next.js App Router (URLs live here)
  page.tsx                        ← Splash at /
  (app)/                          ← Routes inside AppShell (header, nav, …)
    <route>/page.tsx              ← Thin route files — usually import components
  devtools/                       ← UI Inspector (development only)
  api/                            ← Backend endpoints

src/components/<feature>/         ← Real UI composition (preferred home for JSX)
src/platform/ui/
  registry/features/<feature>.ts  ← All UI identities for a feature namespace
  registry/registry.ts            ← Aggregates features (touch only for NEW features)
  i18n/locales/<feature>/         ← en.json + ar.json translations
  i18n/core/i18n-route-manifest.ts  ← Route → i18n feature mapping
  devtools/                       ← Inspector route discovery, inspect bridge

scripts/                          ← Generators: feature, registry, routes, CI
```

**Route groups:** `(app)` does **not** appear in the URL.  
`src/app/(app)/home/page.tsx` → `/home`.

**Splash vs app:** `/` is outside the shell. Everything else meaningful for users usually lives under `(app)/`.

---

## 3. Three Layers — How the Project Grows

Think of the codebase growing in three layers. Each layer answers a different question:

| Layer | Question it answers | What gets created | Starting file to check |
|-------|---------------------|-------------------|------------------------|
| **1 — Feature** | «Is there a namespace for this product area?» | Registry file, locales folder, i18n wiring, first route | `registry/features/<feature>.ts` |
| **2 — Page** | «Is there a URL for this screen?» | New `page.tsx`, new registry **Group**, route manifest entry | `src/app/(app)/<route>/page.tsx` |
| **3 — UI Element** | «What does the user see and interact with?» | Registry keys, locale strings, JSX nodes | `src/components/<feature>/` or route file |

```text
Feature (namespace)
  └── Page (route + container)
        └── Elements (inputs, buttons, galleries, …)
```

**Important:** A **page** does not get its own feature file. It extends the **same** `registry/features/<feature>.ts` with a new group (e.g. `ANALYTICS`, `FORM`, `GALLERY`).

---

## 4. The Two-Phase Rhythm

GoVa separates **wiring** from **product UI**:

### Phase 1 — Scaffold (container only)

Purpose: prove the route, registry namespace, and i18n pipeline work **before** adding complexity.

```tsx
// Typical Phase 1 page — one empty container, nothing else
<div data-ui-uuid={FEATURE.PAGE.CONTAINER.uuid} className="…" />
```

No titles, no buttons, no forms yet. CI should pass with just this shell.

### Phase 2 — UI elements

Purpose: implement what the user described — inputs, buttons, galleries, etc.

Phase 2 can run:

- In the **same prompt** as Phase 1 (create feature + UI in one go), or
- **Later**, when the scaffold already exists (most common for edits)

**How to know which phase you need:** inspect the codebase (see §8). If the route exists but only has an empty container → Phase 2. If nothing exists → Phase 1 first.

---

## 5. The Element Pipeline (Same for Every Widget)

Whether you add a heading, a text field, or an image gallery, the **sequence is identical**. Only names change (`Group`, `Key`, `Kind`).

### Adding

```text
1. Understand user intent (plain language)
2. Derive inventory: 1 intrinsic DOM node = 1 row
3. Add identity block in registry/features/<feature>.ts  (no manual uuid)
4. Add EN + AR strings in locales/<feature>/
5. Bind JSX: data-ui-uuid={UPPER.Group.Key.uuid} + t(IDENTITY) for text
6. Run toolchain (see §10)
```

### Removing

Same chain, reversed: JSX → registry block → locale keys → toolchain.

**Repeatable elements** (lists, gallery thumbnails): one identity, many DOM instances via `.map()`, each with `data-ui-instance-id`.

**Decomposition habit:** a labeled text field is **two** identities (label + input), not one.

---

## 6. How Identity Names Flow

Once you know `feature`, `Group`, and `Key`, everything else follows formulas:

```text
Registry constant   MERCHANT.FORM.EMAIL_INPUT
Stable id           UI_MERCHANT_FORM_EMAIL_INPUT
Path                merchant.form.input.email-input
Translation key     merchant.form.emailInput   (en.json leaf)
JSX                 data-ui-uuid={MERCHANT.FORM.EMAIL_INPUT.uuid}
                    placeholder={t(MERCHANT.FORM.EMAIL_INPUT)}
```

**Kind** (label, text-input, button, gallery, preview-image, …) decides path **role** (`display`, `input`, `actions`, `layout`) and whether translation is required.

Full Kind table: [AGENT_UI_ELEMENTS.md §A.4](./AGENT_UI_ELEMENTS.md#a4--kind-reference-complete).

---

## 7. Where to Start — By User Intent

Use this as your **first move** after reading the user message. No runbook yet — just orientation.

| User intent (examples) | Look first | Likely missing if not found |
|------------------------|------------|----------------------------|
| «Create feature X» | `registry/features/x.ts` | Entire Layer 1 — run Feature runbook |
| «Add page to merchant at /merchant/analytics» | `src/app/(app)/merchant/analytics/page.tsx` | Layer 2 — run Page runbook |
| «Add a submit button to X» | Component/route for X + grep `data-ui-uuid` | Layer 3 only — UI Elements runbook |
| «Remove the gallery from X» | Grep `GALLERY` in registry + JSX | Removal runbook |
| «Page works but no Arabic» | `locales/<feature>/ar.json` + `npm run i18n` | Locale keys or pipeline not run |
| «Inspector can't see my page» | `src/app/**/page.tsx` exists? Refresh inspector | Route file missing under `src/app` |
| «CI uuid error» | Grep component for `<div` without `data-ui-uuid` | Extra wrapper or stale registry |

**Derive `<feature>` from the prompt or path:**  
`/image-upload-form` → feature `image-upload-form` → registry `IMAGE_UPLOAD_FORM`.

Details for resolving target files: [AGENT_UI_ELEMENTS.md §A.14](./AGENT_UI_ELEMENTS.md#a14--autonomous-context-resolution-feature-or-page).

---

## 8. How to Discover What Is Missing (Diagnostic Playbook)

Before coding, walk this checklist. Each step tells you **what layer** is incomplete.

### Step A — Does the namespace exist?

```text
Check: src/platform/ui/registry/features/<feature>.ts
Check: src/platform/ui/i18n/locales/<feature>/en.json
```

| Result | Meaning |
|--------|---------|
| Missing | Layer 1 not done → [AGENT_FEATURE_CREATION.md](./AGENT_FEATURE_CREATION.md) |
| Present | Namespace OK; continue |

### Step B — Does the route exist?

```text
Check: src/app/(app)/<route>/page.tsx   (or nested path for sub-pages)
Optional: GET /api/devtools/app-routes in dev (live App Router scan)
```

| Result | Meaning |
|--------|---------|
| Missing | Layer 2 not done → [AGENT_PAGE_CREATION.md](./AGENT_PAGE_CREATION.md) |
| Present | Route OK; continue |

### Step C — Does Phase 1 container exist in JSX?

```text
Grep target file for data-ui-uuid={…CONTAINER…}
```

| Result | Meaning |
|--------|---------|
| No container | Finish Phase 1 scaffold first |
| Container only | Ready for Phase 2 UI |
| Container + other UI | Phase 2 partial or complete — append or edit carefully |

### Step D — Are described elements registered?

```text
Grep registry file for expected Group (FORM, GALLERY, ACTIONS, …)
Compare inventory rows to data-ui-uuid in JSX
```

| Result | Meaning |
|--------|---------|
| Registry row missing | Add identity before JSX |
| JSX missing uuid | Implement or fix binding |
| Both present | Element layer complete for that row |

### Step E — Are translations wired?

```text
npm run i18n:validate-bindings   (or full npm run i18n)
Check en.json / ar.json under feature section
```

| Result | Meaning |
|--------|---------|
| Missing binding | Add locale keys, run i18n:sync + i18n |
| Valid | i18n OK |

### Step F — Is generated artifacts fresh?

After **any** registry edit:

```text
npm run registry:materialize-uuids
npm run registry:generate
npm run i18n
```

Skipping this is the most common cause of «mysterious» CI failures.

---

## 9. Which Runbook When (Soft Decision Tree)

You do not memorize every TASK. You only need to know **which document owns your situation**:

```text
registry/features/<feature>.ts missing?
  └─ YES → AGENT_FEATURE_CREATION.md

registry exists, new route/page missing?
  └─ YES → AGENT_PAGE_CREATION.md

route + container exist, user wants new widgets?
  └─ YES → AGENT_UI_ELEMENTS.md

user wants widgets removed?
  └─ YES → AGENT_UI_ELEMENT_REMOVAL.md
```

Runbooks use numbered TASKs with PASS/FAIL/STOP. Treat them as **recipes** once you know the dish you are cooking.

---

## 10. Toolchain — How the Project Checks Itself

These commands are the project's **nervous system**. Learn what each one validates:

| Command | What it tells you |
|---------|-------------------|
| `npm run routes:generate` | Scans `src/app/**/page.tsx` → inspector manifest |
| `npm run registry:materialize-uuids` | Injects UUIDs; archives removed identities |
| `npm run registry:generate` | Refreshes member paths + source index |
| `npm run i18n` | Translations valid + bound to registry |
| `npm run typecheck` | TypeScript consistency |
| `npm run ci:uuid-dom-absolute` | Every intrinsic DOM node has uuid |
| `npm run ci:uuid-dom-parity` | DOM uuid count matches registry usage |
| `npm run lint` | ESLint including design tokens + i18n coupling |

**Healthy edit loop:** registry/locale/JSX change → materialize → generate → i18n → typecheck → uuid CI → lint.

---

## 11. Working With the User

GoVa expects **plain language** from the user, **technical precision** from the agent.

| User gives | You derive |
|------------|------------|
| «Add two inputs and a save button to settings» | Inventory rows, Group/Key, files, translations |
| «Create feature billing at /billing» | Phase 1 + optionally Phase 2 |
| «Remove field 2 from image-upload-form» | Removal inventory from registry + JSX |

**Collaboration style:** derive and proceed. Ask only when the prompt has **zero UI intent** — not when details like Group names are unstated (those are always yours to derive).

Ambiguity defaults (one field if count omitted, full gallery pattern if «images» mentioned): [AGENT_UI_ELEMENTS.md §A.12](./AGENT_UI_ELEMENTS.md).

---

## 12. Inspector & Devtools — Your Eyes in the Project

`/devtools/ui-inspector` is a **live mirror** of the registry on real pages.

| Capability | How it helps you |
|------------|------------------|
| Route dropdown | Auto-discovered from App Router (`page.tsx` scan) — main and nested routes |
| Element pick | See uuid, path, feature for any node |
| Preview iframe | Load `/<route>?inspect=1` |

Route discovery:

- **Live:** `GET /api/devtools/app-routes` (on inspector load / refresh)
- **Fallback:** `src/platform/ui/devtools/app-route-manifest.json`

Adding a new `page.tsx` under `src/app` is enough for inspector to see it — no manual dropdown edit.

---

## 13. What Usually Goes Wrong (And Why)

Understanding failures prevents maze-walking:

| Symptom | Typical root cause | Where to look |
|---------|-------------------|---------------|
| Hydration / text mismatch | Server vs client different strings | Component with `window` in render path |
| «Missing data-ui-uuid» lint | Extra wrapper `<div>` without identity | Remove wrapper or add registry row |
| UUID parity fail | More/fewer DOM nodes than registry expects | Count intrinsics in file |
| i18n binding fail | Key missing or `t('string')` instead of `t(IDENTITY)` | locales + JSX |
| Page 404 | `page.tsx` not under `src/app` correct path | App Router structure |
| Translations blank | Feature not in route manifest / featureScope | i18n wiring (Phase 1) |
| Inspector missing route | No `page.tsx` yet | Create route first |

---

## 14. Story Walkthrough — image-upload-form

A concrete path through all layers:

**1. User:** «Feature image-upload-form with three inputs and image gallery.»

**2. Agent checks:** no `registry/features/image-upload-form.ts` → Layer 1 needed.

**3. Phase 1** ([AGENT_FEATURE_CREATION.md](./AGENT_FEATURE_CREATION.md)):

- Creates registry namespace, locales, `/image-upload-form` route
- Wires `i18n-route-manifest`, `featureScope`, `getDictionary`, `registry.ts` (new features only)
- Leaves one `PAGE.CONTAINER` in JSX

**4. Phase 2** ([AGENT_UI_ELEMENTS.md](./AGENT_UI_ELEMENTS.md)):

- Derives 10 inventory rows from description
- Adds `FORM.*` and `GALLERY.*` to registry
- Implements `src/components/image-upload-form/image-upload-form-content.tsx`
- Runs toolchain

**5. Inspector:** `/image-upload-form` appears automatically in dropdown.

**6. Later — user:** «Remove gallery.»

- [AGENT_UI_ELEMENT_REMOVAL.md](./AGENT_UI_ELEMENT_REMOVAL.md): delete `GALLERY.*` from registry + JSX + locales
- Feature and route **remain**; only Layer 3 shrinks

---

## 15. Files You Rarely Touch (And Why)

Knowing what **not** to edit prevents accidental breakage:

| File | Touch when |
|------|------------|
| `uuid-manifest.json`, `registry-member-paths.json` | Never manually — generators only |
| `registry.ts`, `index.ts`, `generate-registry-member-paths.ts` | **New feature** wiring only |
| `uuid` fields in registry | Never manually — `materialize-uuids` |
| `src/features/<feature>/` | Avoid — legacy generator output; use `src/components/` |

Adding UI to an **existing** feature usually means: `registry/features/<feature>.ts`, locales, components — **not** central registry aggregation files.

---

## 16. Prompt Patterns (Starting Points for Users)

These are examples of how users may phrase requests. Your job: map them to §7–§9.

```text
Create feature <name> (route /<route>). UI: <description>.
→ Phase 1 runbook, then Phase 2 if UI described.

Add page to <feature>: route /<route>. UI: <description>.
→ Page runbook, then UI Elements if needed.

Add to <feature-or-page>: <what>.
→ UI Elements runbook.

Remove from <feature-or-page>: <what>.
→ UI Element Removal runbook.
```

---

## 17. Document Map — Go Deeper When Ready

| When you need… | Read |
|----------------|------|
| **Orientation (this file)** | AGENT_PROJECT_PHILOSOPHY.md |
| Exact TASKs for new feature | [AGENT_FEATURE_CREATION.md](./AGENT_FEATURE_CREATION.md) |
| Exact TASKs for new page | [AGENT_PAGE_CREATION.md](./AGENT_PAGE_CREATION.md) |
| Add elements | [AGENT_UI_ELEMENTS.md](./AGENT_UI_ELEMENTS.md) |
| Remove elements | [AGENT_UI_ELEMENT_REMOVAL.md](./AGENT_UI_ELEMENT_REMOVAL.md) |
| Registry & route conventions | [UI_CREATION_RULES.md](./UI_CREATION_RULES.md) |
| Translation system | [i18n.md](./i18n.md) |
| Colors, spacing, tokens | [THEME_RULES.md](./THEME_RULES.md) |

---

## 18. Closing Mindset

GoVa is **registry-first** and **phase-aware**:

1. **Learn the terrain** — app routes, registry namespaces, components
2. **Diagnose the layer** — what exists, what is missing (§8)
3. **Follow the pipeline** — registry → locales → JSX → toolchain
4. **Use runbooks as recipes** — not as punishment, but as proven paths

You are not memorizing rules. You are learning a **system that was designed to be extended one registered node at a time** — and once you see the pattern, every new page, form, or gallery is the same journey with different names.
