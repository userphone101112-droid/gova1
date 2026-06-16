# 🚀 HTML → React + Tailwind + UI Identity Pipeline

This pipeline governs the conversion and integration of imported HTML/CSS pages into the Suez Bazaar / Gova codebase. All future agents and developers must strictly adhere to this protocol when importing external user interface designs.

---

## 1. HTML PARSING LAYER

* Parse raw HTML into a structured AST-like representation.
* Identify:
  * Layout containers
  * Interactive elements (`button`, `a`, `input`, `form`)
  * Content blocks (`cards`, `sections`)
* Ignore scripts and inline event handlers.

---

## 2. COMPONENT DECOMPOSITION RULE

Convert HTML into React components using this mapping:
* `<header>` → `Header.tsx`
* `<section>` → `Section.tsx`
* `<nav>` → `Navigation.tsx`
* Repeated UI patterns → Reusable components (`Card`, `Button`, `Input`)
* Layout wrappers → Layout components

Each component must:
* Be atomic
* Not exceed single responsibility
* Not contain raw HTML blobs

---

## 3. TAILWIND MIGRATION ENGINE

Convert all CSS into Tailwind classes:

### Rules:
* Inline styles → Tailwind utilities
* Class selectors → Mapped & merged into Tailwind
* Remove all global CSS unless absolutely necessary
* Resolve conflicts and duplicate styles

### Forbidden:
* Global CSS dependencies
* Deeply nested selectors
* Unused styles

---

## 4. UI IDENTITY INTEGRATION LAYER (CRITICAL)

Every interactive element MUST be mapped into the UI Identity system.

### Rules:
* Buttons → `UI_*_BUTTON`
* Inputs → `UI_*_INPUT`
* Links → `UI_*_LINK`
* Clickable cards → `UI_*_CARD_ACTION`

### Output format:
```tsx
<UiButton ui={SCOPE.FEATURE.ELEMENT}>
```

### If identity does not exist:
* Generate a candidate identity.
* Register it in `src/shared/ui-registry.ts`.
* Ensure uniqueness and stability.

---

## 5. COMPONENT OUTPUT STRUCTURE

Generated output must follow:
```
/src/components/imported/<page-name>/
  ├── index.tsx (main page)
  ├── components/
  │    ├── Header.tsx
  │    ├── Hero.tsx
  │    ├── Section.tsx
  │    ├── Card.tsx
  ├── hooks/ (if needed)
  ├── types.ts
```

---

## 6. STATE & INTERACTIVITY RULES

* Convert forms → React Hook Form + Zod schema.
* Convert buttons → `UiButton` with identity.
* Remove inline JS completely.
* Replace DOM manipulation with React state.

---

## 7. IMAGE & ASSET HANDLING

* Images → Next.js `<Image />` component with layout optimizations.
* Icons → Lucide React (or local registry icons).
* Fonts → `next/font` system.

---

## 8. VALIDATION LAYER (MANDATORY)

Before output is accepted:
* Ensure no raw HTML remains.
* Ensure every interactive element has UI Identity.
* Ensure no global CSS leaks.
* Ensure all components are React-based.
* Ensure Tailwind replaces CSS.

---

## 9. OUTPUT REQUIREMENT

Return:
1. Full React component tree.
2. Tailwind-migrated UI.
3. UI Identity mapping updates (if new IDs added).
4. Clean Next.js App Router compatible structure.

---

## 🎯 GOAL

Transform any imported HTML/CSS page into:
> Fully modular, typed, UI-tracked, production-ready Next.js system.

---

## 💡 IMPORTANT DESIGN PRINCIPLE

This is not simple "conversion" — it is a complete **re-architecture into the project's system standard**.
