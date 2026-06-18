# 🚀 HTML → React + Tailwind + UI Identity + SSOT Design System Pipeline

This pipeline governs the **mandatory transformation** of any imported HTML/CSS into the Gova system.

It is a **strict architectural enforcement layer**, not a guideline.

All agents MUST follow it without exception.

---

## 0. NON-NEGOTIABLE FOUNDATION

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
- **Documentation**: `docs/PROJECT_ARCHITECTURE_AR.md`

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

## 3. TAILWIND + DESIGN TOKEN ENGINE

Tailwind is ONLY allowed as a **token consumer layer**

### Allowed:

* `var(--gova-*)` tokens
* Tailwind utilities mapped to tokens only (configured in `src/app/globals.css`)

### Forbidden:

* `bg-red-500`, `text-blue-600`, etc.
* Arbitrary values (`p-[18px]`, `text-[14px]`)
* Custom one-off utility hacks
* RTL-specific classes (`ml-`, `mr-`, `text-left`, `text-right`) - use logical properties instead

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

### Registry Location:

* **UI Registry**: `src/platform/ui/registry/`
* **Features**: `src/platform/ui/registry/features/`
* **Categories**: `src/platform/ui/registry/categories.ts`

### If identity does not exist:

* Generate deterministic identity
* Register it in the appropriate feature file
* Ensure:

  * uniqueness
  * stability
  * semantic meaning
  * proper feature/page/section/component/element hierarchy

### Identity Pattern:

```
page.section.component.element
Example: home.categories-grid.actions.toggle-button
```

---

## 5. COMPONENT OUTPUT STRUCTURE (STRICT)

```
/src/components/<feature>/
  ├── ComponentName.tsx
  ├── SubComponent.tsx
  ├── hooks/
  │    └── useComponentHook.ts
  └── types.ts
```

### Rules:

* No deviation allowed
* No extra styling folders
* No duplicated component systems
* Use `src/platform/ui/runtime/components` for UI primitives

---

## 6. STATE & INTERACTIVITY RULES

* Forms → React Hook Form + Zod ONLY
* Validation → Zod schemas ONLY
* Buttons → UiButton ONLY
* No direct DOM manipulation
* No vanilla JS logic
* All state → React state / Zustand / React Query ONLY

---

## 7. DESIGN SYSTEM ENFORCEMENT LAYER

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
* RTL-specific classes (use logical properties)

### Enforcement Tools:

- **SSOT Guard**: `src/components/shared/SSOTGuard.tsx`
  - Detects forbidden class patterns
  - Detects inline styles
  - Detects RTL-specific classes
  - Runs in development mode only

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
* No RTL-specific classes exist

### How to Validate:

1. Run `npm run typecheck`
2. Run `npm run lint`
3. Check browser console for SSOT Guard warnings

---

## 10. BUILD ENFORCEMENT RULE

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
* RTL-specific classes

---

## 11. OUTPUT REQUIREMENT

Final output MUST include:

1. Full React component tree
2. Tailwind + token-based UI only
3. UI Identity registry updates (if any)
4. Clean Next.js App Router structure
5. Proof of SSOT compliance
6. Translation keys in `src/platform/ui/i18n/locales/`

---

## 12. I18N INTEGRATION (NEW)

All text MUST be translatable:

### Usage format:

```tsx
const { t } = useTranslation();
<span>{t(FEATURE.ELEMENT)}</span>
```

### Translation File Location:

* `src/platform/ui/i18n/locales/<feature>/ar.json`
* `src/platform/ui/i18n/locales/<feature>/en.json`

### Binding System:

* UI identities are automatically bound to translation keys
* Use `useBoundUI` and `useBoundTranslation` for type-safe translations
* See `src/platform/ui/i18n/binding/` for details

---

## 🎯 FINAL GOAL

Transform any HTML into:

> A fully modular, strongly typed, UI-identity tracked, **SSOT-compliant Next.js system with zero styling fragmentation and full i18n support**

---

## 💡 CORE PRINCIPLE

This is NOT conversion.

This is:

> A full architectural migration into a single-source-of-truth design-driven system with enforced global consistency, zero deviation tolerance, and full internationalization support.
