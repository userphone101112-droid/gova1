# Project Architecture Documentation - How Component, UI, and Translation Systems Work

## Overview

The project uses an advanced architecture to manage components, UI, and translation based on three interconnected main systems:
1. **UI Registry System**
2. **Primitives & Runtime Components System**
3. **i18n & Binding System**

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
  category: string;     // Category (action, display, container, layout)
  feature: string;      // Feature (home, splash, auth, settings)
  version: string;      // Definition version
  createdAt: string;   // Creation date
  updatedAt: string;   // Update date
}
```

### Naming Convention

The path follows this pattern:
- **4 parts**: `page.section.component.element`
- **3 parts**: `page.section.element` (for simple elements)

Examples:
- `home.promo-banner.display.title` → Home page, promo banner section, display, title
- `home.categories-grid.actions.toggle-button` → Home page, categories grid, actions, toggle button

### Registry Organization

The registry is organized by features:

```typescript
export const UI_REGISTRY = {
  HOME,              // Home page elements
  SPLASH,            // Splash screen elements
  ERROR_BOUNDARY,    // Error handling elements
  SHARED_LAYOUT,    // Shared layout elements
  AUTH,              // Authentication elements
  SETTINGS,          // Settings elements
} as const;
```

### Registry Files

- `registry.ts` - Main registry and search/validation functions
- `features/home.ts` - Home page element definitions
- `features/splash.ts` - Splash screen element definitions
- `features/auth.ts` - Authentication element definitions
- `features/settings.ts` - Settings element definitions
- `categories.ts` - Shared category definitions

### Registry Functions

```typescript
// Search for UI identity by ID
getUiIdentityById(id: string): UiIdentity | undefined

// Search for UI identity by path
getUiIdentityByPath(path: string): UiIdentity | undefined

// Resolve UI parameter to identity
resolveUiParam(param: UiParam): UiIdentity | undefined

// Validate identity at runtime
validateRuntimeIdentity(componentName, ui, resolvedIdentity): void
```

---

## 2. Primitives System

### Location
`src/platform/ui/runtime/primitives/`

### Function
Basic React components with ready-made styling, used as infrastructure for runtime components.

### Available Components

- **button.tsx** - Button component with variants (default, destructive, outline, secondary, ghost, link)
- **input.tsx** - Text input component
- **select.tsx** - Dropdown list component
- **textarea.tsx** - Text area component
- **checkbox.tsx** - Checkbox component
- **radio.tsx** - Radio button component
- **switch.tsx** - Toggle switch component
- **link.tsx** - Link component
- **label.tsx** - Label component
- **header.tsx** - Heading component (H1-H6)
- **image.tsx** - Image component
- **card.tsx** - Card component
- **modal.tsx** - Modal window component
- **badge.tsx** - Badge component

### Example: Button Component

```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(/* CSS styles */)}
        ref={ref}
        {...props}
      />
    );
  }
);
```

---

## 3. Runtime Components System

### Location
`src/platform/ui/runtime/components/`

### Function
UI components that connect Primitives and UI Registry, adding UI identity to each element.

### Mechanism

Uses the `createUiStyledComponent` function to create UI components:

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
- `data-ui-id` - Unique element identifier
- `data-ui-path` - Hierarchical element path
- `data-ui-feature` - Feature it belongs to
- `data-ui-component` - Component name

### Available Runtime Components

- **UiButton** - UI button
- **UiInput** - UI input
- **UiSelect** - UI dropdown
- **UiTextarea** - UI text area
- **UiCheckbox** - UI checkbox
- **UiRadio** - UI radio button
- **UiSwitch** - UI switch
- **UiLink** - UI link
- **UiLabel** - UI label
- **UiHeader** - UI header
- **UiImage** - UI image
- **UiCard** - UI card
- **UiModal** - UI modal
- **UiBadge** - UI badge
- **HTML elements** - UiDiv, UiSpan, UiSection, UiMain, UiArticle, UiAside, UiFooter, etc.

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
│   ├── provider.tsx          - Translation provider (I18nProvider)
│   ├── useTranslation.ts     - Translation use hook
│   ├── t.ts                  - Basic translation function
│   ├── getDictionary.ts     - Load translation dictionaries
│   ├── types.ts              - Type definitions
│   ├── enforceBoundary.ts    - Enforce feature boundary
│   ├── featureScope.ts       - Feature scope determination
│   ├── i18n-route-manifest.ts - Translation route manifest
│   └── resolveTranslationSource.ts - Resolve translation source
├── binding/
│   ├── registry-binding.ts   - Bind registry to translation
│   ├── useBoundUI.ts         - Bound UI hook
│   ├── boundTranslation.ts  - Bound translation
│   └── translation-validator.ts - Translation validation
├── locales/
│   ├── common/
│   │   ├── ar.json          - Common translations (Arabic)
│   │   └── en.json          - Common translations (English)
│   ├── home/
│   │   ├── ar.json          - Home page translations (Arabic)
│   │   └── en.json          - Home page translations (English)
│   ├── splash/
│   ├── auth/
│   ├── settings/
│   └── ...
├── storage/
│   ├── LocaleStorageManager.ts   - Language storage manager
│   ├── CookieLocaleAdapter.ts    - Cookie adapter
│   └── IndexedDbLocaleAdapter.ts - IndexedDB adapter
└── keys.ts                    - Translation key types
```

### Provider (I18nProvider)

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

  // Load dictionary when language changes
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
    <I18nContextInstance.Provider value={{ locale, setLocale: handleSetLocale, dictionary, feature: routeFeature }}>
      {children}
    </I18nContextInstance.Provider>
  );
}
```

### Translation Hook (useTranslation)

```typescript
export function useTranslation() {
  const { locale, setLocale, dictionary, feature } = useI18nContext();

  const t: TranslateFn = (source, fallback) => {
    const key = resolveTranslationKey(source);

    if (!key) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[i18n] No translation key for source:', source);
      }
      return fallback ?? '';
    }

    try {
      validateTranslationKey(key, feature);
    } catch (error) {
      console.warn(error);
    }

    const result = translateKey(key, dictionary, fallback);

    if (result === key && process.env.NODE_ENV === 'development') {
      console.warn(`[i18n] Missing translation for key "${key}" (feature scope: ${feature})`);
    }

    return result;
  };

  return { t, locale, setLocale, feature };
}
```

### Loading Dictionaries

```typescript
export async function getAppDictionary(locale: Locale): Promise<TranslationDictionary> {
  const uniqueFeatures = [...new Set(APP_DICTIONARY_FEATURES)];

  const dictionaries = await Promise.all(
    uniqueFeatures.map((scopeFeature) =>
      scopeFeature === 'common'
        ? loadCommonDictionary(locale)
        : loadFeatureDictionary(scopeFeature, locale)
    )
  );

  return dictionaries.reduce<TranslationDictionary>(
    (merged, dict) => deepMerge(merged, dict),
    {}
  );
}
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

#### Binding Validation

```typescript
export function validateBinding(
  ui: UiIdentifier,
  translationKey: string,
  availableTranslationKeys: Set<string>
): BindingValidationResult {
  const errors: BindingError[] = [];
  const warnings: BindingWarning[] = [];
  
  // Validate UI identifier format
  if (!validateUiIdentifierFormat(ui)) {
    errors.push({
      type: BindingErrorType.INVALID_FORMAT,
      ui,
      message: `UI identifier "${ui}" has invalid format. Expected: page.section.component.element`,
    });
    return { isValid: false, errors, warnings };
  }
  
  // Extract feature from UI identifier
  const uiFeature = extractFeatureFromUiIdentifier(ui);
  
  // Extract feature from translation key
  const translationFeature = translationKey.split('.')[0];
  
  // Validate no cross-feature binding
  if (uiFeature !== translationFeature && translationFeature !== 'common') {
    errors.push({
      type: BindingErrorType.CROSS_FEATURE_MAPPING,
      ui,
      translationKey,
      feature: uiFeature,
      message: `UI identifier "${ui}" belongs to feature "${uiFeature}" but translation key "${translationKey}" belongs to feature "${translationFeature}". Cross-feature mapping is not allowed.`,
    });
  }
  
  // Validate translation key exists
  if (!availableTranslationKeys.has(translationKey)) {
    errors.push({
      type: BindingErrorType.MISSING_TRANSLATION,
      ui,
      translationKey,
      feature: uiFeature,
      message: `Translation key "${translationKey}" does not exist in translation registry for UI identifier "${ui}".`,
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
```

#### Full Registry Validation

```typescript
export function validateBindingRegistry(
  uiIdentifiers: UiIdentifier[],
  translationKeys: Set<string>,
  usedUiIdentifiers: Set<UiIdentifier>,
  usedTranslationKeys: Set<string>
): BindingValidationResult {
  const errors: BindingError[] = [];
  const warnings: BindingWarning[] = [];
  
  // Validate orphan UI identifiers (registered but not used)
  for (const ui of uiIdentifiers) {
    if (!usedUiIdentifiers.has(ui)) {
      warnings.push({
        type: 'ORPHAN_UI_IDENTIFIER',
        message: `UI identifier "${ui}" is registered but never used in any component.`,
        ui,
      });
    }
    
    // Validate translation exists for each UI identifier
    const expectedKey = generateTranslationKeyFromUi(ui);
    if (!translationKeys.has(expectedKey)) {
      errors.push({
        type: BindingErrorType.MISSING_TRANSLATION,
        ui,
        translationKey: expectedKey,
        feature: extractFeatureFromUiIdentifier(ui),
        message: `UI identifier "${ui}" requires translation key "${expectedKey}" which does not exist.`,
      });
    }
  }
  
  // Validate orphan translations (exist but not used)
  for (const key of translationKeys) {
    if (!usedTranslationKeys.has(key)) {
      const feature = key.split('.')[0];
      if (feature !== 'common') {
        warnings.push({
          type: 'ORPHAN_TRANSLATION',
          message: `Translation key "${key}" exists but is not used by any UI element.`,
          translationKey: key,
        });
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
```

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
    ITEM: {
      id: 'UI_HOME_CATEGORIES_GRID_ITEM',
      path: 'home.categories-grid.actions.category-button',
      description: 'Select category button',
      category: 'action',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    CATEGORY_IMAGE: {
      id: 'UI_HOME_CATEGORIES_GRID_CATEGORY_IMAGE',
      path: 'home.categories-grid.display.category-image',
      description: 'Category image in grid',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    CATEGORY_NAME: {
      id: 'UI_HOME_CATEGORIES_GRID_CATEGORY_NAME',
      path: 'home.categories-grid.display.category-name',
      description: 'Category name label',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
  },
} as const;
```

### Step 2: Add Translations

In `src/platform/ui/i18n/locales/home/ar.json`:

```json
{
  "home": {
    "categories-grid": {
      "sectionTitle": "الفئات",
      "toggleButton": "عرض الكل"
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
      "sectionTitle": "Categories",
      "toggleButton": "View All"
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

const CATEGORIES: Array<{
  id: string;
  nameKey: TranslationKey;
  imgSrc: string;
}> = [
  { id: 'fashion', nameKey: 'home.categories.fashion', imgSrc: '...' },
  { id: 'automotive', nameKey: 'home.categories.automotive', imgSrc: '...' },
  // ...
];

export function CategoriesGrid() {
  const { t, locale } = useTranslation();

  return (
    <UiSection ui={COMMON_LAYOUT.SECTION} id="categories-section">
      <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex justify-between items-end mb-4">
        <UiHeader
          ui={HOME.CATEGORIES_GRID.SECTION_TITLE}
          level={3}
          className="font-semibold"
        >
          {t(HOME.CATEGORIES_GRID.SECTION_TITLE)}
        </UiHeader>
        <UiButton ui={HOME.CATEGORIES_GRID.TOGGLE}>
          <span>{t(HOME.CATEGORIES_GRID.TOGGLE)}</span>
          {locale === 'ar' ? <ChevronLeft /> : <ChevronRight />}
        </UiButton>
      </UiDiv>

      <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="grid grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <UiButton ui={HOME.CATEGORIES_GRID.ITEM} key={cat.id}>
            <UiImage ui={HOME.CATEGORIES_GRID.CATEGORY_IMAGE} src={cat.imgSrc} />
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
   "عرض الكل" (ar) or "View All" (en)
```

---

## 8. Architecture Benefits

### 1. **Type Safety**
- All UI Identifiers are documented in TypeScript
- Translation Keys are validated at compile time

### 2. **Full Tracking**
- Each UI element has a unique trackable identity
- Data attributes enable debugging and analytics

### 3. **Error Prevention**
- Binding system prevents elements without translations
- Runtime validation catches errors early

### 4. **Scalability**
- Easy to add new features
- Clear separation between layers

### 5. **Multi-language Support**
- Structured translation file organization
- Automatic RTL/LTR support

### 6. **High Performance**
- Dictionary caching system
- Dynamic translation loading

---

## 9. Development Tools

### Registry Validation

```typescript
validateRegistry(); // Validate registry
```

### Binding Validation

```typescript
validateBindingRegistry(
  uiIdentifiers,
  translationKeys,
  usedUiIdentifiers,
  usedTranslationKeys
);
```

### Cache Statistics

```typescript
getDictionaryCacheStats(); // Get dictionary statistics
```

### Development Tools

```typescript
<DevUiOverlay /> // UI development overlay for debugging
```

---

## 10. Conclusion

The project uses an advanced architecture that connects three main systems:

1. **UI Registry** - To define and register all UI elements
2. **Primitives & Runtime Components** - To build components with trackable identity
3. **i18n & Binding** - To bind translations to UI elements and ensure consistency

This architecture ensures:
- Compile-time type safety
- Full tracking of all UI elements
- Prevention of errors and missing translations
- Scalability and maintainability
- Efficient multi-language support
