# GoVa Project — Deep QC Question Bank

**Purpose:** Hard questions about project structure, internal systems, UUID architecture, and operational pipelines.  
**Audience:** Engineers and AI agents who claim to understand GoVa **without** having read the codebase deeply.  
**Instructions:** Answer from the codebase and runbooks only — not from generic React/Next.js knowledge.  
**Answer key:** [PROJECT_DEEP_QA_ANSWERS.md](./PROJECT_DEEP_QA_ANSWERS.md)

**Difficulty legend:** ★★★ = requires reading multiple subsystems; ★★★★ = non-obvious behavior or failure modes; ★★★★★ = cross-layer integration traps.

---

## Section A — Architecture & Mental Model

**Q1 (★★★)**  
GoVa treats UI as “registered infrastructure.” Name **four distinct artifacts** that must stay aligned when you add a translatable button, and explain what breaks if only three of four are updated.

**Q2 (★★★★)**  
Why does GoVa use a **two-phase lifecycle** (container scaffold → UI elements) instead of generating a complete page in one step? What concrete CI or wiring problem does Phase 1 isolate?

**Q3 (★★★)**  
What is the difference between a **Feature**, a **Page**, and a **UI element** in GoVa terminology — in terms of registry file, route file, and i18n namespace?

**Q4 (★★★★)**  
Why must `src/features/<feature>/page.tsx` **not** be used, while `src/components/<feature>/` **is** the preferred home for JSX? What historical generator behavior does this avoid?

**Q5 (★★★★★)**  
Trace the full path from user-visible text on `/home` to the JSON file that supplies Arabic copy. List every transformation step (registry field → path → translation key → locale file path).

---

## Section B — UUID System

**Q6 (★★★★)**  
What is the **seed** for `createDeterministicUiUuid()` — `id`, `path`, or something else? Why was that choice made given `registry:move` exists?

**Q7 (★★★★★)**  
Describe the exact algorithm (namespace, hash, formatting) that turns `UI_HOME_LANG_ENGLISH` into a UUID-shaped string. Why is group 3 prefixed with `5` and group 4 constrained to variant `8/9/a/b`?

**Q8 (★★★★)**  
What is `uuid-manifest.json` for, and how does it differ from the inline `uuid:` fields inside `registry/features/*.ts`? Which one is authoritative when they disagree?

**Q9 (★★★★★)**  
Explain `removedIdentities` in the manifest. What happens when you delete an identity block from a feature registry file and run `registry:materialize-uuids`? Can that UUID ever be reused for a **different** identity?

**Q10 (★★★★)**  
When is it **forbidden** to hand-edit a `uuid:` field? When is hand-editing **never** the correct fix even if CI fails?

**Q11 (★★★★★)**  
`findManifestUuid()` (materialize script) searches active identities, removed identities, and aliases. Describe a scenario where re-adding a deleted identity **recovers the same UUID** vs a scenario where a **new UUID** is assigned.

---

## Section C — UI Registry

**Q12 (★★★)**  
What does `flattenObject()` in `registry.ts` consider a leaf identity? Why do intermediate keys like `LANGUAGE_SWITCHER` not appear in `ALL_UI_IDENTITIES`?

**Q13 (★★★★)**  
What is the difference between `ALL_UI_IDENTITIES` (flatten by `id`+`path`) and `registry-member-paths.json` (member paths like `HOME.PROMO_BANNER.TITLE`)? Why does ESLint need the latter, not the former?

**Q14 (★★★★)**  
What runs when any module imports `@/platform/ui/registry/registry`? What class of errors fails **at import time** before React renders?

**Q15 (★★★★★)**  
`isTranslationRequiredForUiIdentity()` has three exclusion rules beyond `NO_TRANSLATION_REQUIRED`. List them and give an example identity for each rule.

**Q16 (★★★★)**  
What is `repeatable: true` on a registry identity? How does it change ESLint rules, DOM attributes, and Inspector behavior?

**Q17 (★★★★★)**  
Why are `COMMON_*` and `DECORATIVE.*` category identities banned from application JSX (outside devtools)? What architectural guarantee would break if developers used them for product UI?

---

## Section D — i18n & Translation Binding

**Q18 (★★★★)**  
Convert registry path `merchant.form.input.email-input` to the expected translation key and show the JSON location in locale files. Which path segment is **dropped** during conversion and why?

**Q19 (★★★★★)**  
`I18nProvider` loads the full app dictionary, yet `FEATURE_SCOPES` and `I18N_ROUTE_MANIFEST` exist. Explain what each is used for if not for partial client dictionary loading.

**Q20 (★★★★)**  
What does `npm run i18n:sync` do automatically? What fallback strings does it write for EN vs AR when a key is missing?

**Q21 (★★★★★)**  
Why is `t('merchant.form.emailLabel')` forbidden when `MERCHANT.FORM.EMAIL_INPUT` exists in the registry? Which ESLint rules and CI scripts enforce the preferred pattern?

**Q22 (★★★★)**  
If you add a new identity to `registry/features/settings.ts` but forget `en.json`, which commands fail and in what order during `npm run ci:i18n`?

---

## Section E — DOM Binding, ESLint & CI

**Q23 (★★★★)**  
What must a JSX intrinsic element include to pass `require-data-ui-uuid`? What forms of `data-ui-uuid` are **rejected** even if the attribute is present?

**Q24 (★★★★★)**  
Compare `ci:uuid-dom-absolute` vs `ci:uuid-dom-parity`. Give an example JSX snippet that passes parity but **fails** absolute.

**Q25 (★★★★)**  
Why does an extra wrapper `<div className="grid">` without `data-ui-uuid` fail CI? How does this relate to the “one intrinsic = one identity” inventory rule?

**Q26 (★★★★)**  
What is `MIGRATION_MODE=true` for ESLint, and why is it dangerous to leave enabled in production CI?

**Q27 (★★★★★)**  
The audit script `audit-unified-ui-i18n.ts` generates `source-index.ts`. What problem does source-index solve for Inspector/MAOL, and when does it become stale?

---

## Section F — App Router, Features & Agent Runbooks

**Q28 (★★★)**  
Why does route group `(app)` not appear in URLs? Where is the App Shell applied, and which route intentionally lives **outside** `(app)`?

**Q29 (★★★★)**  
When creating a **new feature**, which four `registry.ts` touchpoints must be wired (TASK 4–7 in AGENT_FEATURE_CREATION)? What symptom appears if TASK 9–10 (member-paths ROOTS) are skipped?

**Q30 (★★★★★)**  
A new page exists at `src/app/(app)/merchant/analytics/page.tsx` but Inspector dropdown does not list it until refresh. Explain the live vs fallback route discovery mechanism and which files are involved.

**Q31 (★★★★)**  
Phase 2 agent runbooks forbid editing `registry.ts` when adding UI to an **existing** feature. Why is that safe for i18n route resolution but **not** sufficient if the new page’s URL prefix was never added to `i18n-route-manifest.ts`?

---

## Section G — UI Inspector & Devtools

**Q32 (★★★★)**  
How does the Inspector iframe communicate with the parent shell? Name the channel identifier and at least three message types.

**Q33 (★★★★★)**  
Where is per-element Inspector configuration persisted on disk, and how is `identityKey` formed for repeatable elements?

**Q34 (★★★★)**  
Why was `discover-app-routes.ts` split into server-only (`fs`) and client-safe (`inspector-route-utils.ts`)? What Next.js bundling error does this prevent?

---

## Section H — MAOL & Observability

**Q35 (★★★★)**  
What does MAOL’s DOM summary collector gather, and how does it use `data-ui-uuid` to group elements by feature?

**Q36 (★★★★★)**  
What is `maol:diff` / `track-ui-identity-diff.ts` checking, and how does it distinguish `PATH_CHANGED` from forbidden UUID reuse?

---

## Section I — Pipeline Integration & Failure Diagnosis

**Q37 (★★★★)**  
List the **minimum** command sequence after editing `registry/features/<feature>.ts` (adding identities). What does each step regenerate or validate?

**Q38 (★★★★★)**  
`npm run ci:check` runs many steps. Name five checks that would catch (a) a manual UUID edit, (b) a missing Arabic translation key, (c) an unregistered `data-ui-uuid`, (d) a stale `source-index.ts`, (e) reuse of a removed UUID.

**Q39 (★★★★★)**  
You see: “Duplicate UI UUIDs found in registry.” List three **distinct root causes** in this codebase (not generic git advice) and how you would confirm each.

**Q40 (★★★★★)**  
Summarize GoVa’s **dependency on UUID** as a percentage of subsystems: which features would partially work, which would fail at import, and which would fail at CI if UUID enforcement were removed entirely?

---

## Scoring Guide (Self-Assessment)

| Score | Interpretation |
|-------|----------------|
| 0–10 | Surface familiarity — read [AGENT_PROJECT_PHILOSOPHY.md](../design-system/AGENT_PROJECT_PHILOSOPHY.md) |
| 11–25 | Working contributor — can add UI with runbooks |
| 26–35 | Deep contributor — understands CI and registry edge cases |
| 36–40 | System owner level — can debug cross-layer failures without guesswork |

---

*Version: 1.0 — aligned with GoVa registry-first architecture (2026-06).*
