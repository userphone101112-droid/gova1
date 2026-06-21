# التقنيات والمكتبات المستخدمة في المشروع

## نظرة عامة

هذا المستند يوثق جميع التقنيات والمكتبات المستخدمة في مشروع GOVA، مع شرح استخدام كل منها في المشروع.

---

## 1. Framework & Core Technologies

### Next.js 16.2.9
- **الاستخدام:** إطار العمل الرئيسي للتطبيق
- **الإصدار:** 16.2.9
- **الميزات المستخدمة:**
  - App Router (`src/app/`)
  - Server Components و Client Components
  - Image Optimization (`next/image`)
  - Routing (`next/link`, `next/navigation`)
  - API Routes (`app/api/`)
  - Middleware (`middleware.ts`)
  - Dynamic Imports (`next/dynamic`)
- **الملفات المرتبطة:**
  - `next.config.ts` - تكوين Next.js
  - `src/app/` - هيكل التطبيق
  - `src/middleware.ts` - middleware للتطبيق

### React 19.2.4
- **الاستخدام:** مكتبة واجهة المستخدم الأساسية
- **الإصدار:** 19.2.4
- **الميزات المستخدمة:**
  - Hooks (useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect)
  - Client Components (`'use client'`)
  - Server Components
  - Context API
- **الملفات المرتبطة:**
  - جميع ملفات `.tsx` في `src/components/`
  - `src/providers/` - Providers للتطبيق

### TypeScript 5
- **الاستخدام:** لغة البرمجة الأساسية مع Type Safety
- **الإصدار:** 5.x
- **الميزات المستخدمة:**
  - Strict Mode مفعّل
  - Path Aliases (`@/`, `@/components/`, etc.)
  - Type Definitions
- **الملفات المرتبطة:**
  - `tsconfig.json` - تكوين TypeScript
  - جميع ملفات `.ts` و `.tsx`

---

## 2. State Management

### Zustand 5.0.14
- **الاستخدام:** إدارة الحالة العالمية للتطبيق
- **الإصدار:** 5.0.14
- **الميزات المستخدمة:**
  - `create()` API
  - `devtools` middleware للتطوير
  - `persist` middleware لحفظ الحالة
- **الاستخدام في المشروع:**
  - `src/store/unified.store.ts` - Store موحد للإعدادات والميزات
  - `src/store/ui-store.ts` - Store لواجهة المستخدم
  - `src/store/index.ts` - Store عام للتطبيق
  - `src/lib/onboarding/store.ts` - Store لعملية Onboarding

### @tanstack/react-query 5.101.0
- **الاستخدام:** إدارة حالة الخادم (Server State Management)
- **الإصدار:** 5.101.0
- **الميزات المستخدمة:**
  - Data Fetching
  - Caching
  - Background Updates
  - Optimistic Updates
- **ملاحظة:** مثبت في package.json لكن لم يُستخدم بشكل واضح في الكود المصدري الحالي

---

## 3. Database & ORM

### Drizzle ORM 0.45.2
- **الاستخدام:** ORM لقاعدة البيانات مع Type Safety
- **الإصدار:** 0.45.2
- **الميزات المستخدمة:**
  - SQLite Core (`drizzle-orm/sqlite-core`)
  - SQL Helper Functions (`sql`)
  - Schema Definitions
- **الملفات المرتبطة:**
  - `drizzle.config.ts` - تكوين Drizzle
  - `src/lib/db/schema.ts` - تعريف جداول قاعدة البيانات
  - `database/` - ملفات قاعدة البيانات

### better-sqlite3 12.10.1
- **الاستخدام:** محرك SQLite سريع ومتزامن
- **الإصدار:** 12.10.1
- **الميزات المستخدمة:**
  - SQLite Database Engine
  - Synchronous API
- **الملفات المرتبطة:**
  - `database/settings.db` - قاعدة البيانات الرئيسية

### Drizzle Kit 0.31.10
- **الاستخدام:** أدوات تطوير لـ Drizzle ORM
- **الإصدار:** 0.31.10
- **الميزات المستخدمة:**
  - Database Migrations
  - Schema Generation
  - Database Push/Pull
- **الملفات المرتبطة:**
  - `database/migrations/` - ملفات الترحيل

---

## 4. Forms & Validation

### react-hook-form 7.79.0
- **الاستخدام:** إدارة النماذج مع أداء عالي
- **الإصدار:** 7.79.0
- **الميزات المستخدمة:**
  - `useForm()` hook
  - `FormProvider` للـ nested forms
  - `Controller` للـ controlled components
  - `useFormContext()` للـ context access
  - `useWatch()` للـ watching values
- **الاستخدام في المشروع:**
  - `src/components/auth/RegistrationPageContent.tsx`
  - `src/components/auth/LoginPageContent.tsx`
  - `src/components/auth/PasswordInput.tsx`
  - `src/components/auth/PhoneVerification.tsx`

### @hookform/resolvers 5.4.0
- **الاستخدام:** ربط react-hook-form مع مكتبات التحقق
- **الإصدار:** 5.4.0
- **الميزات المستخدمة:**
  - `zodResolver` للتحقق مع Zod
- **الاستخدام في المشروع:**
  - `src/components/auth/RegistrationPageContent.tsx`

### Zod 4.4.3
- **الاستخدام:** مكتبة التحقق من البيانات (Schema Validation)
- **الإصدار:** 4.4.3
- **الميزات المستخدمة:**
  - Schema Definitions
  - Type Inference
  - Validation Rules
- **الاستخدام في المشروع:**
  - `src/lib/validation/auth.ts` - التحقق من بيانات المصادقة
  - التحقق من أرقام الهواتف المصرية

---

## 5. HTTP Client & API

### Axios 1.17.0
- **الاستخدام:** عميل HTTP للطلبات الخارجية
- **الإصدار:** 1.17.0
- **الميزات المستخدمة:**
  - `AxiosInstance` للـ configured client
  - Interceptors (request/response)
  - Error Handling
  - Timeout Configuration
- **الملفات المرتبطة:**
  - `src/lib/api-client.ts` - عميل API مخصص
  - `src/lib/api-error-normalizer.ts` - تطبيع الأخطاء

---

## 6. Styling & UI

### Tailwind CSS 4
- **الاستخدام:** إطار عمل CSS utility-first
- **الإصدار:** 4
- **الميزات المستخدمة:**
  - Utility Classes
  - Responsive Design
  - Custom Theme
  - CSS Variables
- **الملفات المرتبطة:**
  - `postcss.config.mjs` - تكوين PostCSS
  - `src/design-system/` - نظام التصميم المخصص
  - `src/design-system/primitive-tokens.css`
  - `src/design-system/semantic-tokens.css`
  - `src/design-system/component-tokens.css`
  - `src/design-system/visual-tokens.css`

### @tailwindcss/postcss 4
- **الاستخدام:** PostCSS plugin لـ Tailwind CSS
- **الإصدار:** 4
- **الميزات المستخدمة:**
  - PostCSS Integration
  - CSS Processing

### lucide-react 1.18.0
- **الاستخدام:** مكتبة الأيقونات
- **الإصدار:** 1.18.0
- **الميزات المستخدمة:**
  - 100+ أيقونات SVG
  - Tree-shakeable
  - Customizable
- **الاستخدام في المشروع:**
  - جميع مكونات الواجهة في `src/components/`
  - أمثلة: `Home`, `Bell`, `Heart`, `User`, `Settings`, `Menu`, `Search`, `ShoppingCart`, إلخ

### clsx 2.1.1
- **الاستخدام:** دمج أسماء الكلاسات بشكل مشروط
- **الإصدار:** 2.1.1
- **الميزات المستخدمة:**
  - Conditional Class Names
  - String Manipulation
- **الاستخدام في المشروع:**
  - `src/lib/utils.ts` - دالة `cn()` المساعدة

### tailwind-merge 3.6.0
- **الاستخدام:** دمج كلاسات Tailwise بشكل ذكي
- **الإصدار:** 3.6.0
- **الميزات المستخدمة:**
  - Smart Class Merging
  - Conflict Resolution
- **الاستخدام في المشروع:**
  - `src/lib/utils.ts` - دالة `cn()` المساعدة مع clsx

---

## 7. Utilities

### date-fns 4.4.0
- **الاستخدام:** معالجة التواريخ والأوقات
- **الإصدار:** 4.4.0
- **الميزات المستخدمة:**
  - Date Formatting
  - Date Manipulation
  - Timezone Support
- **ملاحظة:** مثبت في package.json لكن لم يُستخدم بشكل واضح في الكود المصدري الحالي

### nanoid 5.1.11
- **الاستخدام:** توليد معرفات فريدة
- **الإصدار:** 5.1.11
- **الميزات المستخدمة:**
  - Unique ID Generation
  - URL-safe IDs
  - Customizable Length
- **ملاحظة:** مثبت في package.json لكن لم يُستخدم بشكل واضح في الكود المصدري الحالي

### dotenv 17.4.2
- **الاستخدام:** إدارة متغيرات البيئة
- **الإصدار:** 17.4.2
- **الميزات المستخدمة:**
  - Environment Variables Loading
  - `.env` File Support
- **الملفات المرتبطة:**
  - `.env.example` - مثال على متغيرات البيئة
  - `.env.local` - متغيرات البيئة المحلية

---

## 8. Backend Services

### Firebase 12.14.0
- **الاستخدام:** خدمات Backend من Google
- **الإصدار:** 12.14.0
- **الميزات المحتملة:**
  - Authentication
  - Firestore Database
  - Storage
  - Real-time Database
- **ملاحظة:** مثبت في package.json لكن لم يُستخدم بشكل واضح في الكود المصدري الحالي

---

## 9. Testing

### Jest 30.4.2
- **الاستخدام:** إطار عمل الاختبار
- **الإصدار:** 30.4.2
- **الميزات المستخدمة:**
  - Unit Testing
  - Integration Testing
  - Snapshot Testing
- **الملفات المرتبطة:**
  - `jest.config.js` - تكوين Jest
  - `jest.setup.js` - إعداد Jest
  - `src/tests/` - ملفات الاختبار

### @testing-library/react 16.3.2
- **الاستخدام:** اختبار مكونات React
- **الإصدار:** 16.3.2
- **الميزات المستخدمة:**
  - Component Testing
  - User Interaction Testing
  - Accessibility Testing

### @testing-library/jest-dom 6.9.1
- **الاستخدام:** matchers مخصصة لـ Jest لـ DOM
- **الإصدار:** 6.9.1
- **الميزات المستخدمة:**
  - Custom Jest Matchers
  - DOM Assertions

### @testing-library/user-event 14.6.1
- **الاستخدام:** محاكاة تفاعلات المستخدم
- **الإصدار:** 14.6.1
- **الميزات المستخدمة:**
  - User Interaction Simulation
  - Event Firing

### jest-environment-jsdom 30.4.1
- **الاستخدام:** بيئة Jest لـ DOM
- **الإصدار:** 30.4.1
- **الميزات المستخدمة:**
  - DOM Simulation
  - Browser API Simulation

### ts-jest 29.4.11
- **الاستخدام:** preset لـ Jest مع TypeScript
- **الإصدار:** 29.4.11
- **الميزات المستخدمة:**
  - TypeScript Support
  - TSX Compilation

---

## 10. Development Tools

### ESLint 9
- **الاستخدام:** أداة فحص الكود (Linting)
- **الإصدار:** 9
- **الميزات المستخدمة:**
  - Code Quality Checks
  - Custom Rules
  - Auto-fix
- **الملفات المرتبطة:**
  - `eslint.config.mjs` - تكوين ESLint
  - `.eslintrc.js` - تكوين إضافي
  - `.eslint-rules/` - قواعد مخصصة

### eslint-config-next 16.2.9
- **الاستخدام:** تكوين ESLint لـ Next.js
- **الإصدار:** 16.2.9
- **الميزات المستخدمة:**
  - Next.js Specific Rules
  - React Hooks Rules
  - Accessibility Rules

### Prettier 3.8.4
- **الاستخدام:** تنسيق الكود تلقائياً
- **الإصدار:** 3.8.4
- **الميزات المستخدمة:**
  - Code Formatting
  - Consistent Style
- **الملفات المرتبطة:**
  - `.prettierrc` - تكوين Prettier

### prettier-plugin-tailwindcss 0.8.0
- **الاستخدام:** تنظيم كلاسات Tailwind CSS
- **الإصدار:** 0.8.0
- **الميزات المستخدمة:**
  - Tailwind Class Sorting
  - Automatic Class Organization

### tsx 4.22.4
- **الاستخدام:** تنفيذ TypeScript مباشرة
- **الإصدار:** 4.22.4
- **الميزات المستخدمة:**
  - TypeScript Execution
  - Script Running
- **الاستخدام في المشروع:**
  - جميع scripts في `package.json` التي تستخدم `tsx`

---

## 11. Type Definitions

### @types/node 20
- **الاستخدام:** تعريفات TypeScript لـ Node.js
- **الإصدار:** 20
- **الميزات المستخدمة:**
  - Node.js Type Definitions
  - Built-in Module Types

### @types/react 19
- **الاستخدام:** تعريفات TypeScript لـ React
- **الإصدار:** 19
- **الميزات المستخدمة:**
  - React Type Definitions
  - React Hook Types

### @types/react-dom 19
- **الاستخدام:** تعريفات TypeScript لـ React DOM
- **الإصدار:** 19
- **الميزات المستخدمة:**
  - React DOM Type Definitions
  - Browser API Types

### @types/better-sqlite3 7.6.13
- **الاستخدام:** تعريفات TypeScript لـ better-sqlite3
- **الإصدار:** 7.6.13
- **الميزات المستخدمة:**
  - better-sqlite3 Type Definitions
  - SQLite API Types

---

## 12. Custom Design System

المشروع يحتوي على نظام تصميم مخصص بالكامل في `src/design-system/`:

### الملفات الأساسية:
- `primitive-tokens.css` - Tokens الأساسية (الألوان، الخطوط، المسافات)
- `semantic-tokens.css` - Tokens دلالية (للعناصر المختلفة)
- `visual-tokens.css` - Tokens بصرية (الظلال، الحدود، إلخ)
- `component-tokens.css` - Tokens للمكونات
- `component-patterns.css` - أنماط المكونات
- `tokens.ts` - TypeScript definitions للـ tokens
- `token-names.ts` - أسماء الـ tokens
- `index.ts` - نقطة الدخول لنظام التصميم

### الميزات:
- CSS Variables للـ theming
- Type-safe token access
- Single Source of Truth (SSOT)
- Custom token system

---

## 13. Custom Platform UI

المشروع يحتوي على نظام UI مخصص في `src/platform/ui/`:

### الميزات:
- UI Registry System مع UUID-based identities
- Internationalization (i18n) System
- Component Registry
- Translation Management
- UI Telemetry
- DevTools Inspector

### الملفات الرئيسية:
- `src/platform/ui/registry/` - نظام تسجيل المكونات
- `src/platform/ui/i18n/` - نظام الترجمة
- `src/platform/ui/devtools/` - أدوات التطوير
- `src/platform/ui/enforcement/` - قواعد إنفاذ الـ UI

---

## 14. Scripts & Automation

المشروع يحتوي على scripts مخصصة في `scripts/`:

### Scripts الرئيسية:
- `generate-feature.ts` - توليد feature جديد
- `generate-app-route-manifest.ts` - توليد manifest للـ routes
- `export-to-json.ts` - تصدير قاعدة البيانات إلى JSON
- `check-db.ts` - فحص قاعدة البيانات
- `validate-images.ts` - التحقق من الصور
- `analyze-db.ts` - تحليل قاعدة البيانات
- `registry-generate.ts` - توليد registry
- `ci-*.ts` - scripts للـ CI/CD

---

## 15. Summary Table

| الفئة | المكتبة | الإصدار | الاستخدام |
|-------|---------|---------|-----------|
| Framework | Next.js | 16.2.9 | React Framework |
| Core | React | 19.2.4 | UI Library |
| Core | TypeScript | 5 | Type Safety |
| State Management | Zustand | 5.0.14 | Global State |
| State Management | @tanstack/react-query | 5.101.0 | Server State |
| Database | Drizzle ORM | 0.45.2 | ORM |
| Database | better-sqlite3 | 12.10.1 | SQLite Engine |
| Forms | react-hook-form | 7.79.0 | Form Management |
| Validation | Zod | 4.4.3 | Schema Validation |
| HTTP | Axios | 1.17.0 | HTTP Client |
| Styling | Tailwind CSS | 4 | CSS Framework |
| Icons | lucide-react | 1.18.0 | Icon Library |
| Utilities | clsx | 2.1.1 | Class Names |
| Utilities | tailwind-merge | 3.6.0 | Tailwind Merging |
| Utilities | date-fns | 4.4.0 | Date Handling |
| Utilities | nanoid | 5.1.11 | ID Generation |
| Backend | Firebase | 12.14.0 | Backend Services |
| Testing | Jest | 30.4.2 | Testing Framework |
| Testing | @testing-library/react | 16.3.2 | React Testing |
| Development | ESLint | 9 | Linting |
| Development | Prettier | 3.8.4 | Formatting |
| Execution | tsx | 4.22.4 | TypeScript Runner |

---

## 16. Architecture Notes

### Monorepo Structure
المشروع يستخدم هيكل monorepo مع:
- `apps/` - التطبيقات
- `packages/` - الحزم المشتركة
- `src/` - الكود المصدري الرئيسي

### Custom Platform
المشروع يحتوي على platform مخصص:
- UI Registry System
- Internationalization System
- Component Enforcement
- DevTools Integration

### Design System
نظام تصميم مخصص بالكامل:
- CSS Token System
- Type-safe Token Access
- Component Patterns
- Visual Tokens

---

## 17. Future Considerations

### المكتبات المثبتة لكن غير المستخدمة بشكل واضح:
- @tanstack/react-query - يمكن استخدامه لتحسين data fetching
- date-fns - يمكن استخدامه لمعالجة التواريخ
- nanoid - يمكن استخدامه لتوليد IDs
- Firebase - يمكن استخدامه للمصادقة أو التخزين

### التوصيات:
- النظر في استخدام @tanstack/react-query لتحسين performance
- استخدام date-fns لمعالجة التواريخ بشكل أفضل
- استخدام nanoid لتوليد IDs فريدة
- تقييم استخدام Firebase للميزات المستقبلية

---

## 18. References

### روابط مهمة:
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
- [Jest Documentation](https://jestjs.io/docs)

---

## 19. Maintenance

### تحديث المكتبات:
- تحقق من التحديثات الأمنية بانتظام
- اتباع best practices لكل مكتبة
- اختبار التحديثات قبل تطبيقها
- مراجعة breaking changes

### إضافة مكتبات جديدة:
- تقييم الحاجة الفعلية
- التحقق من التوافق
- مراجعة الحجم والأداء
- توثيق الاستخدام

---

**آخر تحديث:** يونيو 2026  
**المسؤول:** فريق تطوير GOVA
