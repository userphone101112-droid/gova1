# توثيق بنية المشروع - كيفية عمل أنظمة المكونات والواجهة والترجمة

## نظرة عامة

يستخدم المشروع بنية معمارية متقدمة لإدارة المكونات والواجهة والترجمة تعتمد على ثلاثة أنظمة رئيسية مترابطة:
1. **نظام تسجيل الواجهة (UI Registry)**
2. **نظام المكونات الأولية والتشغيلية (Primitives & Runtime Components)**
3. **نظام الترجمة والربط (i18n & Binding)**

---

## 1. نظام تسجيل الواجهة (UI Registry)

### الموقع
`src/platform/ui/registry/`

### الوظيفة
نظام مركزي لتسجيل وتعريف جميع عناصر الواجهة في المشروع، حيث يتم تعريف كل عنصر UI بهوية فريدة.

### هيكل البيانات

كل عنصر UI في السجل يحتوي على:

```typescript
{
  id: string;           // معرف فريد ثابت (مثال: 'UI_HOME_PROMO_BANNER_TITLE')
  path: string;         // مسار هرمي (مثال: 'home.promo-banner.display.title')
  description: string;  // وصف العنصر
  category: string;     // الفئة (action, display, container, layout)
  feature: string;      // الميزة (home, splash, auth, settings)
  version: string;      // إصدار التعريف
  createdAt: string;   // تاريخ الإنشاء
  updatedAt: string;   // تاريخ التحديث
}
```

### نمط التسمية

يتبع المسار (path) النمط التالي:
- **4 أجزاء**: `page.section.component.element`
- **3 أجزاء**: `page.section.element` (للعناصر البسيطة)

أمثلة:
- `home.promo-banner.display.title` → صفحة الرئيسية، قسم بانر ترويجي، عرض، عنوان
- `home.categories-grid.actions.toggle-button` → صفحة الرئيسية، شبكة الفئات، إجراءات، زر تبديل

### تنظيم السجل

يتم تنظيم السجل حسب الميزات (Features):

```typescript
export const UI_REGISTRY = {
  HOME,              // عناصر الصفحة الرئيسية
  SPLASH,            // عناصر شاشة البداية
  ERROR_BOUNDARY,    // عناصر معالجة الأخطاء
  SHARED_LAYOUT,    // عناصر التخطيط المشتركة
  AUTH,              // عناصر المصادقة
  SETTINGS,          // عناصر الإعدادات
} as const;
```

### ملفات السجل

- `registry.ts` - السجل الرئيسي ووظائف البحث والتحقق
- `features/home.ts` - تعريفات عناصر الصفحة الرئيسية
- `features/splash.ts` - تعريفات عناصر شاشة البداية
- `features/auth.ts` - تعريفات عناصر المصادقة
- `features/settings.ts` - تعريفات عناصر الإعدادات
- `categories.ts` - تعريفات الفئات المشتركة

### وظائف السجل

```typescript
// البحث عن هوية UI بالمعرف
getUiIdentityById(id: string): UiIdentity | undefined

// البحث عن هوية UI بالمسار
getUiIdentityByPath(path: string): UiIdentity | undefined

// تحويل معامل UI إلى هوية
resolveUiParam(param: UiParam): UiIdentity | undefined

// التحقق من صحة الهوية في وقت التشغيل
validateRuntimeIdentity(componentName, ui, resolvedIdentity): void
```

---

## 2. نظام المكونات الأولية (Primitives)

### الموقع
`src/platform/ui/runtime/primitives/`

### الوظيفة
مكونات React أساسية مع تنسيقات (styling) جاهزة، تُستخدم كبناء تحتي للمكونات التشغيلية.

### المكونات المتاحة

- **button.tsx** - مكون الزر مع متغيرات (default, destructive, outline, secondary, ghost, link)
- **input.tsx** - مكون إدخال النص
- **select.tsx** - مكون القائمة المنسدلة
- **textarea.tsx** - مكون منطقة النص
- **checkbox.tsx** - مكون مربع الاختيار
- **radio.tsx** - مكون زر الاختيار
- **switch.tsx** - مكون المفتاح
- **link.tsx** - مكون الرابط
- **label.tsx** - مكون التسمية
- **header.tsx** - مكون العناوين (H1-H6)
- **image.tsx** - مكون الصورة
- **card.tsx** - مكون البطاقة
- **modal.tsx** - مكون النافذة المنبثقة
- **badge.tsx** - مكون الشارة

### مثال: مكون الزر

```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(/* تنسيقات CSS */)}
        ref={ref}
        {...props}
      />
    );
  }
);
```

---

## 3. نظام المكونات التشغيلية (Runtime Components)

### الموقع
`src/platform/ui/runtime/components/`

### الوظيفة
مكونات UI تربط بين Primitives و UI Registry، وتضيف هوية UI لكل عنصر.

### آلية العمل

تستخدم الدالة `createUiStyledComponent` لإنشاء مكونات UI:

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

### إنشاء مكون UI

```typescript
// في button.tsx
import { Button, type ButtonProps } from '../primitives/button';
import { createUiStyledComponent, type UiStyledProps } from './createUiStyledComponent';

export type UiButtonProps = UiStyledProps<ButtonProps>;
export const UiButton = createUiStyledComponent<ButtonProps, HTMLButtonElement>(Button, 'UiButton');
```

### سمات البيانات المضافة

كل مكون UI يحصل على السمات التالية:
- `data-ui-id` - المعرف الفريد للعنصر
- `data-ui-path` - المسار الهرمي للعنصر
- `data-ui-feature` - الميزة التابعة لها
- `data-ui-component` - اسم المكون

### المكونات التشغيلية المتاحة

- **UiButton** - زر UI
- **UiInput** - إدخال UI
- **UiSelect** - قائمة منسدلة UI
- **UiTextarea** - منطقة نص UI
- **UiCheckbox** - مربع اختيار UI
- **UiRadio** - زر اختيار UI
- **UiSwitch** - مفتاح UI
- **UiLink** - رابط UI
- **UiLabel** - تسمية UI
- **UiHeader** - عنوان UI
- **UiImage** - صورة UI
- **UiCard** - بطاقة UI
- **UiModal** - نافذة منبثقة UI
- **UiBadge** - شارة UI
- **عناصر HTML** - UiDiv, UiSpan, UiSection, UiMain, UiArticle, UiAside, UiFooter, إلخ

---

## 4. نظام الترجمة (i18n)

### الموقع
`src/platform/ui/i18n/`

### الوظيفة
نظام شامل لإدارة الترجمات وربطها بعناصر UI، مع دعم متعدد اللغات (العربية والإنجليزية).

### هيكل الملفات

```
i18n/
├── core/
│   ├── provider.tsx          - مزود الترجمة (I18nProvider)
│   ├── useTranslation.ts     - هوك استخدام الترجمة
│   ├── t.ts                  - دالة الترجمة الأساسية
│   ├── getDictionary.ts     - تحميل قواميس الترجمة
│   ├── types.ts              - تعريفات الأنواع
│   ├── enforceBoundary.ts    - فرض حدود الميزة
│   ├── featureScope.ts       - تحديد نطاق الميزة
│   ├── i18n-route-manifest.ts - بيان مسارات الترجمة
│   └── resolveTranslationSource.ts - تحليل مصدر الترجمة
├── binding/
│   ├── registry-binding.ts   - ربط السجل بالترجمة
│   ├── useBoundUI.ts         - هوك UI المربوط
│   ├── boundTranslation.ts  - ترجمة مربوطة
│   └── translation-validator.ts - التحقق من الترجمات
├── locales/
│   ├── common/
│   │   ├── ar.json          - الترجمات المشتركة (عربي)
│   │   └── en.json          - الترجمات المشتركة (إنجليزي)
│   ├── home/
│   │   ├── ar.json          - ترجمات الصفحة الرئيسية (عربي)
│   │   └── en.json          - ترجمات الصفحة الرئيسية (إنجليزي)
│   ├── splash/
│   ├── auth/
│   ├── settings/
│   └── ...
├── storage/
│   ├── LocaleStorageManager.ts   - مدير تخزين اللغة
│   ├── CookieLocaleAdapter.ts    - محول الكوكيز
│   └── IndexedDbLocaleAdapter.ts - محول IndexedDB
└── keys.ts                    - أنواع مفاتيح الترجمة
```

### المزود (I18nProvider)

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

  // تحميل القاموس عند تغيير اللغة
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

### هوك الترجمة (useTranslation)

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

### تحميل القواميس

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

### هيكل ملفات الترجمة

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

## 5. نظام الربط (Binding System)

### الموقع
`src/platform/ui/i18n/binding/`

### الوظيفة
ضمان الربط الإلزامي بين UI Identifiers و Translation Keys، لمنع وجود عناصر بدون ترجمة أو ترجمات بدون استخدام.

### آلية الربط

#### توليد مفتاح الترجمة من UI Identifier

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

**أمثلة:**
- `home.promo-banner.display.title` → `home.promo-banner.title`
- `home.categories-grid.actions.toggle-button` → `home.categories-grid.toggleButton`

#### التحقق من الربط

```typescript
export function validateBinding(
  ui: UiIdentifier,
  translationKey: string,
  availableTranslationKeys: Set<string>
): BindingValidationResult {
  const errors: BindingError[] = [];
  const warnings: BindingWarning[] = [];
  
  // التحقق من تنسيق UI identifier
  if (!validateUiIdentifierFormat(ui)) {
    errors.push({
      type: BindingErrorType.INVALID_FORMAT,
      ui,
      message: `UI identifier "${ui}" has invalid format. Expected: page.section.component.element`,
    });
    return { isValid: false, errors, warnings };
  }
  
  // استخراج الميزة من UI identifier
  const uiFeature = extractFeatureFromUiIdentifier(ui);
  
  // استخراج الميزة من مفتاح الترجمة
  const translationFeature = translationKey.split('.')[0];
  
  // التحقق من عدم وجود ربط بين الميزات المختلفة
  if (uiFeature !== translationFeature && translationFeature !== 'common') {
    errors.push({
      type: BindingErrorType.CROSS_FEATURE_MAPPING,
      ui,
      translationKey,
      feature: uiFeature,
      message: `UI identifier "${ui}" belongs to feature "${uiFeature}" but translation key "${translationKey}" belongs to feature "${translationFeature}". Cross-feature mapping is not allowed.`,
    });
  }
  
  // التحقق من وجود مفتاح الترجمة
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

#### التحقق من السجل الكامل

```typescript
export function validateBindingRegistry(
  uiIdentifiers: UiIdentifier[],
  translationKeys: Set<string>,
  usedUiIdentifiers: Set<UiIdentifier>,
  usedTranslationKeys: Set<string>
): BindingValidationResult {
  const errors: BindingError[] = [];
  const warnings: BindingWarning[] = [];
  
  // التحقق من UI identifiers اليتيمة (مسجلة لكن غير مستخدمة)
  for (const ui of uiIdentifiers) {
    if (!usedUiIdentifiers.has(ui)) {
      warnings.push({
        type: 'ORPHAN_UI_IDENTIFIER',
        message: `UI identifier "${ui}" is registered but never used in any component.`,
        ui,
      });
    }
    
    // التحقق من وجود ترجمة لكل UI identifier
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
  
  // التحقق من الترجمات اليتيمة (موجودة لكن غير مستخدمة)
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

## 6. مثال عملي: إنشاء مكون مع ترجمة

### الخطوة 1: تعريف UI Identity في السجل

في `src/platform/ui/registry/features/home.ts`:

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

### الخطوة 2: إضافة الترجمات

في `src/platform/ui/i18n/locales/home/ar.json`:

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

في `src/platform/ui/i18n/locales/home/en.json`:

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

### الخطوة 3: إنشاء المكون

في `src/components/home/CategoriesGrid.tsx`:

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

## 7. التدفق الكامل (Full Flow)

```
1. تعريف UI Identity
   ↓
   src/platform/ui/registry/features/home.ts
   ↓
2. إضافة الترجمات
   ↓
   src/platform/ui/i18n/locales/home/ar.json
   src/platform/ui/i18n/locales/home/en.json
   ↓
3. إنشاء المكون
   ↓
   src/components/home/CategoriesGrid.tsx
   ↓
4. استخدام المكون مع UI Identity
   ↓
   <UiButton ui={HOME.CATEGORIES_GRID.TOGGLE}>
   ↓
5. إضافة سمات البيانات تلقائياً
   ↓
   data-ui-id="UI_HOME_CATEGORIES_GRID_TOGGLE"
   data-ui-path="home.categories-grid.actions.toggle-button"
   data-ui-feature="home"
   data-ui-component="UiButton"
   ↓
6. الترجمة التلقائية
   ↓
   {t(HOME.CATEGORIES_GRID.TOGGLE)}
   ↓
   home.categories-grid.toggleButton
   ↓
   "عرض الكل" (ar) أو "View All" (en)
```

---

## 8. مزايا البنية المعمارية

### 1. **نوعية آمنة (Type Safety)**
- جميع UI Identifiers موثقة في TypeScript
- Translation Keys يتم التحقق منها في وقت الترجمة

### 2. **تتبع كامل**
- كل عنصر UI له هوية فريدة قابلة للتتبع
- سمات البيانات تمكن من التصحيح والتحليل

### 3. **منع الأخطاء**
- نظام الربط يمنع وجود عناصر بدون ترجمة
- التحقق في وقت التشغيل يكشف الأخطاء مبكراً

### 4. **قابلية التوسع**
- سهولة إضافة ميزات جديدة
- فصل واضح بين الطبقات

### 5. **دعم متعدد اللغات**
- هيكل منظم لملفات الترجمة
- دعم RTL/LTR تلقائي

### 6. **أداء عالي**
- نظام تخزين مؤقت للقواميس
- تحميل ديناميكي للترجمات

---

## 9. أدوات التطوير

### التحقق من السجل

```typescript
validateRegistry(); // التحقق من صحة السجل
```

### التحقق من الربط

```typescript
validateBindingRegistry(
  uiIdentifiers,
  translationKeys,
  usedUiIdentifiers,
  usedTranslationKeys
);
```

### إحصائيات التخزين المؤقت

```typescript
getDictionaryCacheStats(); // الحصول على إحصائيات القاموس
```

### أدوات التطوير

```typescript
<DevUiOverlay /> // طبقة تطوير UI للتصحيح
```

---

## 10. الخلاصة

يستخدم المشروع بنية معمارية متقدمة تربط بين ثلاثة أنظمة رئيسية:

1. **UI Registry** - لتعريف وتسجيل جميع عناصر الواجهة
2. **Primitives & Runtime Components** - لبناء المكونات مع هوية قابلة للتتبع
3. **i18n & Binding** - لربط الترجمات بعناصر UI وضمان الاتساق

هذه البنية تضمن:
- نوعية آمنة في وقت الترجمة
- تتبع كامل لجميع عناصر UI
- منع الأخطاء والترجمات المفقودة
- قابلية التوسع والصيانة
- دعم متعدد اللغات بكفاءة
