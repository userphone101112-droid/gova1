# 🚀 HTML → React + Tailwind + UI Identity + SSOT Design System Pipeline

This pipeline governs the **mandatory transformation** of any imported HTML/CSS into the Gova/Suez Bazaar system.

It is a **strict architectural enforcement layer**, not a guideline.

All agents MUST follow it without exception.

---

## 0. NON-NEGOTIABLE FOUNDATION (NEW)

Before any conversion:

* The **Design System SSOT is the ONLY source of styling truth**
* No hardcoded styles are allowed under any condition
* No Tailwind arbitrary values are allowed (`text-[..]`, `bg-[#..]`, `p-[..]`)
* No inline CSS is allowed
* No component-level styling overrides outside tokens

ALL styling MUST come from:

> `Design System Tokens (Primitive → Semantic → Component)`

### Design System Reference:

- **Tokens Location**: `src/design-system/`
  - `primitive-tokens.css`: Raw, immutable values
  - `semantic-tokens.css`: Meaningful values mapped to primitives
  - `component-tokens.css`: Component-specific tokens
- **Type Definitions**: `src/design-system/tokens.ts`
- **Documentation**: `docs/design-system.md`
- **Audit Script**: `npm run audit:design-system`

---

## 1. HTML PARSING LAYER

Parse HTML into a structured representation:

### Extract:

* Layout containers
* UI regions (header, footer, sections)
* Interactive elements
* Repeated patterns
* Content blocks

### Ignore:

* `<script>` tags
* Inline event handlers
* Non-visual metadata

---

## 2. ARCHITECTURAL DECOMPOSITION RULE

Convert HTML into **atomic React components only**

### Mapping:

* `<header>` → `Header.tsx`
* `<section>` → `Section.tsx`
* `<nav>` → `Navigation.tsx`
* Repeated patterns → reusable components (`Card`, `Button`, `Input`)
* Layout wrappers → layout system components only

### Rules:

* Each component = single responsibility
* No mixed concerns
* No raw HTML blobs inside components
* No styling inside components (except token usage)

---

## 3. TAILWIND + DESIGN TOKEN ENGINE (UPDATED)

Tailwind is ONLY allowed as a **token consumer layer**

### Allowed:

* `var(--gova-*)` tokens
* Tailwind utilities mapped to tokens only (configured in `src/app/globals.css`)

### Forbidden:

* `bg-red-500`, `text-blue-600`, etc.
* Arbitrary values (`p-[18px]`, `text-[14px]`)
* Custom one-off utility hacks

### Rule:

> Tailwind must act as a renderer of the Design System, not a styling source.

---

## 4. UI IDENTITY INTEGRATION LAYER (CRITICAL)

Every interactive element MUST be registered in UI Identity System.

### Mapping rules:

* Button → `UI_*_BUTTON`
* Input → `UI_*_INPUT`
* Link → `UI_*_LINK`
* Card action → `UI_*_CARD_ACTION`

### Usage format:

```tsx
<UiButton ui={SCOPE.FEATURE.ELEMENT} />
```

### If identity does not exist:

* Generate deterministic identity
* Register it in `src/shared/ui-registry.ts`
* Ensure:

  * uniqueness
  * stability
  * semantic meaning

---

## 5. COMPONENT OUTPUT STRUCTURE (STRICT)

```
/src/components/imported/<page-name>/
  ├── index.tsx
  ├── components/
  │    ├── Header.tsx
  │    ├── Hero.tsx
  │    ├── Section.tsx
  │    ├── Card.tsx
  ├── hooks/
  ├── types.ts
```

### Rules:

* No deviation allowed
* No extra styling folders
* No duplicated component systems

---

## 6. STATE & INTERACTIVITY RULES

* Forms → React Hook Form + Zod ONLY
* Validation → Zod schemas ONLY
* Buttons → UiButton ONLY
* No direct DOM manipulation
* No vanilla JS logic
* All state → React state / Zustand / React Query ONLY

---

## 7. DESIGN SYSTEM ENFORCEMENT LAYER (NEW CRITICAL LAYER)

ALL UI must comply with SSOT:

### Required:

* Colors → semantic tokens only
* Spacing → spacing tokens only
* Typography → typography system only
* Radius → radius tokens only
* Shadows → shadow tokens only
* Motion → motion system only

### Forbidden:

* Any raw value usage
* Any Tailwind arbitrary styling
* Any inline styles
* Any component-local design decisions

### ESLint Enforcement:

- Rule: `design-token-enforcement/no-hardcoded-design-tokens`
- Location: `.eslint-rules/design-token-enforcement.js`

---

## 8. ASSET HANDLING RULES

* Images → `next/image` only
* Icons → Lucide React only
* Fonts → `next/font` only
* No external CDN styling
* No inline font definitions

---

## 9. VALIDATION LAYER (MANDATORY GATE)

Before output is accepted:

### MUST PASS:

* No raw HTML remains
* No inline styles exist
* No hardcoded design values exist
* All UI elements have Identity mapping
* All components use design tokens only
* No arbitrary Tailwind values exist
* No duplicate styling systems exist

### How to Validate:

1. Run `npm run typecheck`
2. Run `npm run lint`
3. Run `npm run audit:design-system`

---

## 10. BUILD ENFORCEMENT RULE (NEW)

If violations exist:

* Build MUST fail
* Lint MUST fail
* CI MUST block merge

Violations include:

* Hardcoded colors
* Arbitrary spacing
* Inline styles
* Missing UI identity
* Missing token usage

---

## 11. OUTPUT REQUIREMENT

Final output MUST include:

1. Full React component tree
2. Tailwind + token-based UI only
3. UI Identity registry updates (if any)
4. Clean Next.js App Router structure
5. Proof of SSOT compliance

---

## 🎯 FINAL GOAL

Transform any HTML into:

> A fully modular, strongly typed, UI-identity tracked, **SSOT-compliant Next.js system with zero styling fragmentation**

---

## 💡 CORE PRINCIPLE (UPDATED)

This is NOT conversion.

This is:

> A full architectural migration into a single-source-of-truth design-driven system with enforced global consistency and zero deviation tolerance.
