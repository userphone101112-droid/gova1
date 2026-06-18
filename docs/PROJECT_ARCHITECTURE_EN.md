# Project Architecture Documentation - How Component, UI, and Translation Systems Work

## Overview

The project uses an advanced architecture to manage components, UI, and translation based on three interconnected main systems:
1. **UI Registry System**
2. **Primitives & Runtime Components System**
3. **i18n & Binding System**

### Public entry points

| Import | Purpose |
|--------|---------|
| `@/platform/ui` | Client-safe API: registry, `Ui*` components, i18n hooks |
| `@/platform/ui/server` | Server-only API: dictionaries, locale cookies, feature layouts |

---

## 1. UI Registry System

### Location
`src/platform/ui/registry/`

### Function
A central system for registering and defining all UI elements in the project, where each UI element is defined with a unique identity.

### Data Structure

Each UI element in the registry contains:

```typescript
{
  id: string;           // Unique constant identifier (example: 'UI_HOME_PROMO_BANNER_TITLE')
  path: string;         // Hierarchical path (example: 'home.promo-banner.display.title')
  description: string;  // Element description
  category: 'action' | 'input' | 'navigation' | 'display' | 'container';
  feature: string;      // Feature (home, splash, auth, settings, common, …)
  version: string;      // Definition version
  createdAt: string;    // Creation date
  updatedAt: string;    // Update date
  deprecated?: boolean; // Optional deprecation flag
}
```

### Naming Convention

The path follows this pattern:
- **4 parts**: `page.section.component.element`
- **3 parts**: `page.section.element` (for simple elements)

Examples:
- `home.promo-banner.display.title` → Home page, promo banner section, display, title
- `home.categories-grid.actions.toggle-button` → Home page, categories grid, actions, toggle button
- `common.layout.wrapper` → Shared layout wrapper (category identity, no bound translation)

Validated at runtime by `UI_IDENTIFIER_REGEX`: `/^[a-z0-9-]+(\.[a-z0-9-]+){2,3}$/`

### Registry Organization

The registry is organized by features:

```typescript
export const UI_REGISTRY = {
  HOME,
  ERROR_BOUNDARY,
  SPLASH,
  SHARED_LAYOUT,
  AUTH,
  SETTINGS,
} as const;
```

Feature identities are merged with **category identities** (`ALL_CATEGORY_IDENTITIES` from `categories/`) into `ALL_UI_IDENTITIES`.

### Registry Files

- `registry.ts` — Main registry, lookup maps, search/validation functions (auto-validates on module load)
- `types.ts` — Core type definitions (`UiIdentity`, etc.)
- `config.ts` — `UI_REGISTRY_CONFIG` (validation enabled only in development)
- `source-index.ts` — Maps identity IDs to source file locations
- `generator.ts` — Registry generation utilities
- `features/home.ts` — Home page element definitions
- `features/splash.ts` — Splash screen element definitions
- `features/auth.ts` — Authentication element definitions
- `features/settings.ts` — Settings element definitions
- `features/error-boundary.ts` — Error boundary element definitions
- `features/shared-layout.ts` — Shared layout element definitions
- `categories/` — Shared category identities (layout, typography, forms, media, lists, tables, interactive, spacing, template, components)
- `categories/index.ts` — Re-exports all category modules and `ALL_CATEGORY_IDENTITIES`

### Registry Functions

```typescript
// Lookup maps (built from ALL_UI_IDENTITIES)
UI_ID_MAP, UI_PATH_MAP, FEATURE_MAP

// Flattened lists
ALL_UI_IDENTITIES, ALL_UI_IDENTIFIERS

// Search for UI identity by ID or path
getUiIdentityById(id: string): UiIdentity | undefined
getUiIdentityByPath(path: string): UiIdentity | undefined
getUiIdentityByFeature(feature: string): UiIdentity[]

// Resolve UI parameter to identity (UiIdentity object preferred; string paths are deprecated)
resolveUiParam(param: UiParam): UiIdentity | undefined
getUiIdentity(param: UiParam): UiIdentity | undefined

// Resolve source file location from identity
resolveSourceFromIdentity(param: UiParam): UiSourceLocation | undefined

// Validate identity at runtime (development only)
validateRuntimeIdentity(componentName, ui, resolvedIdentity): void

// Validate entire registry (also runs automatically at module load)
validateRegistry(): void
```

### Registry Configuration

```typescript
export const UI_REGISTRY_CONFIG = {
  enableValidation: process.env.NODE_ENV === 'development',
  strictMode: true,
  warnDeprecated: process.env.NODE_ENV === 'development',
  warnLegacy: process.env.NODE_ENV === 'development',
  autoFix: false,
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
} as const;
```

---

## 2. Primitives System

### Location
`src/platform/ui/runtime/primitives/`

### Function
Basic React components with ready-made styling, used as infrastructure for runtime components. **Not intended for direct app import** — use `Ui*` components from `@/platform/ui` instead.

### Available Primitives

- **button.tsx** — Button with variants (default, destructive, outline, secondary, ghost, link)
- **input.tsx** — Text input
- **select.tsx** — Dropdown list
- **textarea.tsx** — Text area
- **checkbox.tsx** — Checkbox
- **radio.tsx** — Radio button
- **switch.tsx** — Toggle switch
- **link.tsx** — Link
- **label.tsx** — Label
- **header.tsx** — Heading component (H1–H6 via `level` prop)
- **image.tsx** — Image component
- **card.tsx** — Card component
- **modal.tsx** — Modal window
- **badge.tsx** — Badge component
- **logo.tsx** — Logo component

### Example: Button Component

```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}
```

---

## 3. Runtime Components System

### Location
`src/platform/ui/runtime/components/`

Public exports are defined in `public-api.ts` and re-exported from `@/platform/ui`.

### Function
UI components that connect Primitives and UI Registry, adding UI identity to each element.

### Two Creation Mechanisms

#### 1. Styled components — `createUiStyledComponent`

Wraps styled primitives (Button, Input, Header, …):

```typescript
export function createUiStyledComponent<P extends object, R = HTMLElement>(
  StyledComponent: React.ForwardRefExoticComponent<P & React.RefAttributes<R>>,
  componentName: string
) {
  const Component = React.forwardRef<R, UiStyledProps<P>>((props, ref) => {
    const { ui, ...rest } = props;
    const identity = resolveUiParam(ui);

    if (UI_REGISTRY_CONFIG.enableValidation) {
      validateRuntimeIdentity(componentName, ui, identity);
    }

    return (
      <StyledComponent
        ref={ref}
        {...(rest as P)}
        data-ui-id={identity?.id}
        data-ui-path={identity?.path}
        data-ui-feature={identity?.feature}
        data-ui-component={componentName}
      />
    );
  });

  Component.displayName = componentName;
  return Component;
}
```

#### 2. HTML elements — `createUiComponent` (`component-factory.ts`)

Creates UI-identified wrappers for raw HTML elements (div, section, table, …).

### Creating a UI Component

```typescript
// In button.tsx
import { Button, type ButtonProps } from '../primitives/button';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiButtonProps = UiStyledProps<ButtonProps>;
export const UiButton = createUiStyledComponent<ButtonProps, HTMLButtonElement>(Button, 'UiButton');
```

### Added Data Attributes

Each UI component gets the following attributes:
- `data-ui-id` — Unique element identifier
- `data-ui-path` — Hierarchical element path
- `data-ui-feature` — Feature it belongs to
- `data-ui-component` — Component name

### Available Runtime Components (from `@/platform/ui`)

**Styled components:**
- **UiButton**, **UiInput**, **UiSelect**, **UiTextarea**, **UiCheckbox**, **UiRadio**, **UiSwitch**
- **UiLink**, **UiLabel**, **UiHeader**, **UiImage**
- **UiCard**, **UiModal**, **UiBadge**

**HTML structural components** (from `html-components.ts`):
- Layout: UiDiv, UiSpan, UiNav, UiMain, UiSection, UiArticle, UiAside, UiFooter
- Headings: UiH1–UiH6
- Text: UiP, UiStrong, UiEm
- Media: UiPicture, UiFigure, UiFigcaption, UiVideo, UiAudio, UiIframe
- Lists: UiUl, UiOl, UiLi
- Tables: UiTable, UiThead, UiTbody, UiTr, UiTh, UiTd
- Forms: UiForm, UiOption, UiFieldset, UiLegend
- Dialog: UiDialog, UiDetails, UiSummary
- Other: UiA, UiCanvas, UiSvg, UiTemplate, UiSlot, UiBr, UiHr, UiCode, UiPre

**DevTools:**
- **UiDev** (alias for `DevUiOverlay`) — UI development overlay for debugging

### Shared Layout Categories

Structural elements typically use category identities from `COMMON_LAYOUT` (and related category exports):

```typescript
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';

<UiSection ui={COMMON_LAYOUT.SECTION}>…</UiSection>
<UiDiv ui={COMMON_LAYOUT.WRAPPER}>…</UiDiv>
```

Category paths under `common.*` do not require bound translations (`isCategoryUiPath`).

---

## 4. i18n System

### Location
`src/platform/ui/i18n/`

### Function
Comprehensive system for managing translations and binding them to UI elements, with multi-language support (Arabic and English).

### File Structure

```
i18n/
├── core/
│   ├── provider.tsx              - Translation provider (I18nProvider)
│   ├── useTranslation.ts         - Translation hook
│   ├── t.ts                      - Basic translation function
│   ├── getDictionary.ts          - Load/merge/cache dictionaries
│   ├── types.ts                  - Type definitions
│   ├── enforceBoundary.ts        - Enforce feature boundary
│   ├── featureScope.ts           - Feature scope determination (FEATURE_SCOPES)
│   ├── i18n-route-manifest.ts    - Translation route manifest
│   └── resolveTranslationSource.ts - Resolve UI identity → translation key
├── binding/
│   ├── registry-binding.ts       - Bind registry to translation
│   ├── useBoundUI.ts               - Bound UI hook and validation helpers
│   ├── boundTranslation.ts         - Bound translation helper
│   └── translation-validator.ts    - Translation validation
├── locales/
│   ├── common/                   - ar.json, en.json
│   ├── home/                     - ar.json, en.json
│   ├── splash/
│   ├── auth/
│   ├── settings/
│   ├── shared-layout/
│   └── error-boundary/
├── storage/
│   ├── LocaleStorageManager.ts
│   ├── LocaleStorageAdapter.ts
│   ├── CookieLocaleAdapter.ts
│   └── IndexedDbLocaleAdapter.ts
├── utils/
│   ├── getLocale.ts              - Client locale helpers (direction, theme)
│   ├── getLocale.server.ts       - Server locale/cookie helpers
│   ├── createFeatureLayout.tsx   - Feature layout factory
│   └── discoverFeatures.ts       - Feature discovery
├── LocaleProvider.tsx            - Syncs HTML lang/dir with unified store
└── keys.ts                       - Translation key types
```

Server-only dictionary APIs live in `@/platform/ui/server` (re-exported from `getDictionary.ts`).

### Provider (I18nProvider)

Root layout loads the full app dictionary once via `getAppDictionaryCached`, then `I18nProvider` keeps it in sync with locale changes:

```typescript
export function I18nProvider({
  children,
  initialLocale,
  initialDictionary,
}: I18nProviderProps) {
  const pathname = usePathname();
  const routeFeature = useMemo(
    () => resolveFeatureFromPathname(pathname ?? '/'),
    [pathname]
  );

  const { language: locale, setLanguage: setLocaleSSOT } = useUnifiedStore();
  const [dictionary, setDictionary] = useState<TranslationDictionary>(initialDictionary);

  const loadDictionary = useCallback(
    async (targetLocale: Locale) => getAppDictionary(targetLocale),
    []
  );

  useEffect(() => {
    if (locale === initialLocale) return;

    let cancelled = false;
    loadDictionary(locale).then((dict) => {
      if (!cancelled) setDictionary(dict);
    });

    return () => { cancelled = true; };
  }, [locale, initialLocale, loadDictionary]);

  const handleSetLocale = async (newLocale: Locale) => {
    setLocaleSSOT(newLocale);
    const newDictionary = await loadDictionary(newLocale);
    setDictionary(newDictionary);
  };

  return (
    <I18nContextInstance.Provider
      value={{ locale, setLocale: handleSetLocale, dictionary, feature: routeFeature }}
    >
      {children}
    </I18nContextInstance.Provider>
  );
}
```

`LocaleProvider` (separate component) updates `document.documentElement.lang` and `.dir` for RTL/LTR when the unified store language changes.

### Translation Hook (useTranslation)

Accepts either a **UI identity object** or an explicit **translation key** as `TranslationSource`:

```typescript
export function useTranslation() {
  const { locale, setLocale, dictionary, feature } = useI18nContext();

  const t: TranslateFn = (source, fallback) => {
    const key = resolveTranslationKey(source);
    // … validateTranslationKey, translateKey …
    return result;
  };

  return { t, locale, setLocale, feature };
}
```

`resolveTranslationKey` maps UI paths to keys via `generateTranslationKeyFromUi`, or passes through explicit keys like `'home.categories.fashion'`.

### Loading Dictionaries

```typescript
/** Features merged into the single app-wide dictionary */
export const APP_DICTIONARY_FEATURES = [
  'common', 'splash', 'home', 'auth',
  'shared-layout', 'error-boundary', 'settings',
] as const;

export async function getAppDictionary(locale: Locale): Promise<TranslationDictionary> {
  const uniqueFeatures = [...new Set(APP_DICTIONARY_FEATURES)];
  const dictionaries = await Promise.all(
    uniqueFeatures.map((scopeFeature) =>
      scopeFeature === 'common'
        ? loadCommonDictionary(locale)
        : loadFeatureDictionary(scopeFeature, locale)
    )
  );
  return dictionaries.reduce(deepMerge, {});
}
```

Additional APIs:
- `getMergedDictionary(locale, feature)` — Merge namespaces for a route scope via `FEATURE_SCOPES`
- `getDictionary(locale, feature)` — Alias for `getMergedDictionary`
- `getDictionaryCached` / `getAppDictionaryCached` — Server-side cache (5-minute TTL)
- `clearDictionaryCache()` / `getDictionaryCacheStats()` — Cache management

### Feature Scopes

```typescript
export const FEATURE_SCOPES = {
  home: ['common', 'shared-layout', 'home'],
  auth: ['common', 'auth'],
  settings: ['common', 'settings'],
  // …
};
```

### Translation File Structure

```json
{
  "home": {
    "categories": {
      "fashion": "أزياء",
      "automotive": "سيارات",
      "realestate": "عقارات"
    },
    "promo-banner": {
      "title": "عقارات النخبة",
      "description": "اعثر على مساحتك الصناعية القادمة",
      "bannerButton": "استكشف العقارات"
    },
    "curated-offers": {
      "sectionTitle": "عروض مختارة",
      "showMoreButton": "عرض المزيد",
      "addToCartButton": "إضافة للسلة"
    }
  }
}
```

---

## 5. Binding System

### Location
`src/platform/ui/i18n/binding/`

### Function
Ensure mandatory binding between UI Identifiers and Translation Keys, preventing elements without translations or translations without usage.

### Binding Mechanism

#### Generate Translation Key from UI Identifier

```typescript
export function generateTranslationKeyFromUi(ui: UiIdentifier): string {
  const parts = ui.split('.');
  if (parts.length < 3) {
    throw new Error(`Invalid UI identifier format: ${ui}`);
  }

  const page = parts[0]!;
  const section = parts[1]!;
  const element = parts.length >= 4 ? parts[3]! : parts[2]!;

  const camelCaseElement = element.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

  return `${page}.${section}.${camelCaseElement}`;
}
```

**Examples:**
- `home.promo-banner.display.title` → `home.promo-banner.title`
- `home.categories-grid.actions.toggle-button` → `home.categories-grid.toggleButton`

#### Category Paths (No Translation Required)

```typescript
export function isCategoryUiPath(ui: UiIdentifier): boolean {
  return ui.startsWith('common.');
}
```

Identities under `common.*` (e.g. `COMMON_LAYOUT.WRAPPER`) are structural and do not resolve to translation keys.

#### Binding Validation

`validateBinding` checks format, cross-feature mapping, key existence, and emits a `NAMING_MISMATCH` warning when the provided key differs from the expected generated key.

`validateBindingRegistry` checks orphan UI identifiers and orphan translations across the full registry.

Additional helpers: `createBindingRecord`, `generateBindingMap`, `getFeatureBindings`, `useBoundUI`, `boundTranslation`.

---

## 6. Practical Example: Creating a Component with Translation

### Step 1: Define UI Identity in Registry

In `src/platform/ui/registry/features/home.ts`:

```typescript
export const HOME = {
  CATEGORIES_GRID: {
    SECTION_TITLE: {
      id: 'UI_HOME_CATEGORIES_GRID_SECTION_TITLE',
      path: 'home.categories-grid.display.section-title',
      description: 'Categories section title',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    TOGGLE: {
      id: 'UI_HOME_CATEGORIES_GRID_TOGGLE',
      path: 'home.categories-grid.actions.toggle-button',
      description: 'Toggle categories grid layout button',
      category: 'action',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    // … ITEM, CATEGORY_IMAGE, CATEGORY_NAME
  },
} as const;
```

### Step 2: Add Translations

In `src/platform/ui/i18n/locales/home/ar.json`:

```json
{
  "home": {
    "categories-grid": {
      "sectionTitle": "أسواق السويس",
      "toggleButton": "تبديل المظهر"
    },
    "categories": {
      "fashion": "أزياء",
      "automotive": "سيارات",
      "realestate": "عقارات"
    }
  }
}
```

In `src/platform/ui/i18n/locales/home/en.json`:

```json
{
  "home": {
    "categories-grid": {
      "sectionTitle": "Suez Markets",
      "toggleButton": "Toggle Layout"
    },
    "categories": {
      "fashion": "Fashion",
      "automotive": "Cars",
      "realestate": "Real Estate"
    }
  }
}
```

### Step 3: Create the Component

In `src/components/home/CategoriesGrid.tsx`:

```typescript
'use client';

import { useTranslation, type TranslationKey } from '@/platform/ui';
import { Store, ChevronLeft, ChevronRight } from 'lucide-react';
import { UiButton, UiImage, UiLabel, UiHeader, UiDiv, UiSection } from '@/platform/ui';
import { HOME } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';

const CATEGORIES: Array<{ id: string; nameKey: TranslationKey; imgSrc: string }> = [
  { id: 'fashion', nameKey: 'home.categories.fashion', imgSrc: '…' },
  { id: 'automotive', nameKey: 'home.categories.automotive', imgSrc: '…' },
  // …
];

export function CategoriesGrid() {
  const { t, locale } = useTranslation();

  return (
    <UiSection ui={COMMON_LAYOUT.SECTION} id="categories-section">
      <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex justify-between items-end mb-4">
        <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center gap-2 …">
          <Store className="w-5 h-5 text-blue-600" />
          <UiHeader ui={HOME.CATEGORIES_GRID.SECTION_TITLE} level={3}>
            {t(HOME.CATEGORIES_GRID.SECTION_TITLE)}
          </UiHeader>
        </UiDiv>
        <UiButton ui={HOME.CATEGORIES_GRID.TOGGLE} variant="outline">
          <span>{t(HOME.CATEGORIES_GRID.TOGGLE)}</span>
          {locale === 'ar' ? <ChevronLeft /> : <ChevronRight />}
        </UiButton>
      </UiDiv>

      <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="grid grid-cols-4 …">
        {CATEGORIES.map((cat) => (
          <UiButton ui={HOME.CATEGORIES_GRID.ITEM} key={cat.id}>
            <UiImage ui={HOME.CATEGORIES_GRID.CATEGORY_IMAGE} src={cat.imgSrc} fill />
            <UiLabel ui={HOME.CATEGORIES_GRID.CATEGORY_NAME}>
              {t(cat.nameKey)}
            </UiLabel>
          </UiButton>
        ))}
      </UiDiv>
    </UiSection>
  );
}
```

---

## 7. Full Flow

```
1. Define UI Identity
   ↓
   src/platform/ui/registry/features/home.ts
   ↓
2. Add Translations
   ↓
   src/platform/ui/i18n/locales/home/ar.json
   src/platform/ui/i18n/locales/home/en.json
   ↓
3. Create Component
   ↓
   src/components/home/CategoriesGrid.tsx
   ↓
4. Use Component with UI Identity
   ↓
   <UiButton ui={HOME.CATEGORIES_GRID.TOGGLE}>
   ↓
5. Automatically Add Data Attributes
   ↓
   data-ui-id="UI_HOME_CATEGORIES_GRID_TOGGLE"
   data-ui-path="home.categories-grid.actions.toggle-button"
   data-ui-feature="home"
   data-ui-component="UiButton"
   ↓
6. Automatic Translation
   ↓
   {t(HOME.CATEGORIES_GRID.TOGGLE)}
   ↓
   home.categories-grid.toggleButton
   ↓
   "تبديل المظهر" (ar) or "Toggle Layout" (en)
```

---

## 8. Architecture Benefits

### 1. **Type Safety**
- All UI Identifiers are documented in TypeScript
- Translation Keys are validated at compile time via `TranslationKey` types

### 2. **Full Tracking**
- Each UI element has a unique trackable identity
- Data attributes enable debugging and analytics

### 3. **Error Prevention**
- Binding system prevents elements without translations
- Runtime validation catches errors early (development only)
- CI scripts validate bindings and translations on every build

### 4. **Scalability**
- Easy to add new features via registry feature files and locale directories
- Clear separation between layers (primitives → runtime → app components)

### 5. **Multi-language Support**
- Structured translation file organization per feature
- `LocaleProvider` syncs HTML `lang`/`dir` for RTL/LTR

### 6. **High Performance**
- Server-side dictionary caching (`getAppDictionaryCached`)
- Full app dictionary loaded once at root layout

---

## 9. Development Tools

### npm Scripts

```bash
npm run i18n:validate              # Validate translation files
npm run i18n:validate-bindings     # Validate UI ↔ translation bindings
npm run i18n:generate-keys         # Regenerate translation key types
npm run audit:unified-ui-i18n      # Full UI/i18n audit
npm run audit:orphans              # Find orphan UI/translation entries
npm run ci:i18n                    # Runs validate + bindings + generate-keys (used in build)
npm run platform:doctor            # Platform health check
```

### Enforcement Scripts

Located in `src/platform/ui/enforcement/`:
- `scripts/validate-translations.ts`
- `scripts/validate-registry-bindings.ts`
- `scripts/generate-translation-keys.ts`
- `scripts/audit-unified-ui-i18n.ts`
- `scripts/find-orphans.ts`
- `scripts/prune-orphans.ts`
- `eslint/i18n-enforcement.js`
- `eslint/ui-identification.js`

### Runtime Helpers

```typescript
validateRegistry();           // Validate registry (also auto-runs at import)
validateBindingRegistry(…);   // Validate full binding registry
getDictionaryCacheStats();    // Dictionary cache statistics
clearDictionaryCache();       // Clear dictionary cache
```

### DevTools

```typescript
import { DevUiOverlay } from '@/platform/ui';
// or
import { UiDev } from '@/platform/ui';

<DevUiOverlay />  // UI development overlay (development only in root layout)
```

---

## 10. Conclusion

The project uses an advanced architecture that connects three main systems:

1. **UI Registry** — Define and register all UI elements with stable IDs and paths
2. **Primitives & Runtime Components** — Build components with trackable identity via `createUiStyledComponent` and `createUiComponent`
3. **i18n & Binding** — Bind translations to UI elements and ensure consistency

This architecture ensures:
- Compile-time type safety
- Full tracking of all UI elements
- Prevention of errors and missing translations
- Scalability and maintainability
- Efficient multi-language support with RTL/LTR handling
