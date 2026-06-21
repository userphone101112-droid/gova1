# Technologies and Libraries Used in the Project

## Overview

This document lists all technologies and libraries used in the GOVA project.

---

## 1. Framework & Core Technologies

### Next.js 16.2.9
- **Version:** 16.2.9
- **Related Files:**
  - `next.config.ts`
  - `src/app/`
  - `src/middleware.ts`

### React 19.2.4
- **Version:** 19.2.4
- **Related Files:**
  - All `.tsx` files in `src/components/`
  - `src/providers/`

### TypeScript 5
- **Version:** 5.x
- **Related Files:**
  - `tsconfig.json`
  - All `.ts` and `.tsx` files

---

## 2. State Management

### Zustand 5.0.14
- **Version:** 5.0.14
- **Usage in Project:**
  - `src/store/unified.store.ts`
  - `src/store/ui-store.ts`
  - `src/store/index.ts`
  - `src/lib/onboarding/store.ts`

### @tanstack/react-query 5.101.0
- **Version:** 5.101.0

---

## 3. Database & ORM

### Drizzle ORM 0.45.2
- **Version:** 0.45.2
- **Related Files:**
  - `drizzle.config.ts`
  - `src/lib/db/schema.ts`
  - `database/`

### better-sqlite3 12.10.1
- **Version:** 12.10.1
- **Related Files:**
  - `database/settings.db`

### Drizzle Kit 0.31.10
- **Version:** 0.31.10
- **Related Files:**
  - `database/migrations/`

---

## 4. Forms & Validation

### react-hook-form 7.79.0
- **Version:** 7.79.0
- **Usage in Project:**
  - `src/components/auth/RegistrationPageContent.tsx`
  - `src/components/auth/LoginPageContent.tsx`
  - `src/components/auth/PasswordInput.tsx`
  - `src/components/auth/PhoneVerification.tsx`

### @hookform/resolvers 5.4.0
- **Version:** 5.4.0
- **Usage in Project:**
  - `src/components/auth/RegistrationPageContent.tsx`

### Zod 4.4.3
- **Version:** 4.4.3
- **Usage in Project:**
  - `src/lib/validation/auth.ts`

---

## 5. HTTP Client & API

### Axios 1.17.0
- **Version:** 1.17.0
- **Related Files:**
  - `src/lib/api-client.ts`
  - `src/lib/api-error-normalizer.ts`

---

## 6. Styling & UI

### Tailwind CSS 4
- **Version:** 4
- **Related Files:**
  - `postcss.config.mjs`
  - `src/design-system/`
  - `src/design-system/primitive-tokens.css`
  - `src/design-system/semantic-tokens.css`
  - `src/design-system/component-tokens.css`
  - `src/design-system/visual-tokens.css`

### @tailwindcss/postcss 4
- **Version:** 4

### lucide-react 1.18.0
- **Version:** 1.18.0
- **Usage in Project:**
  - All UI components in `src/components/`

### clsx 2.1.1
- **Version:** 2.1.1
- **Usage in Project:**
  - `src/lib/utils.ts`

### tailwind-merge 3.6.0
- **Version:** 3.6.0
- **Usage in Project:**
  - `src/lib/utils.ts`

---

## 7. Utilities

### date-fns 4.4.0
- **Version:** 4.4.0

### nanoid 5.1.11
- **Version:** 5.1.11

### dotenv 17.4.2
- **Version:** 17.4.2
- **Related Files:**
  - `.env.example`
  - `.env.local`

---

## 8. Backend Services

### Firebase 12.14.0
- **Version:** 12.14.0

---

## 9. Testing

### Jest 30.4.2
- **Version:** 30.4.2
- **Related Files:**
  - `jest.config.js`
  - `jest.setup.js`
  - `src/tests/`

### @testing-library/react 16.3.2
- **Version:** 16.3.2

### @testing-library/jest-dom 6.9.1
- **Version:** 6.9.1

### @testing-library/user-event 14.6.1
- **Version:** 14.6.1

### jest-environment-jsdom 30.4.1
- **Version:** 30.4.1

### ts-jest 29.4.11
- **Version:** 29.4.11

---

## 10. Development Tools

### ESLint 9
- **Version:** 9
- **Related Files:**
  - `eslint.config.mjs`
  - `.eslintrc.js`
  - `.eslint-rules/`

### eslint-config-next 16.2.9
- **Version:** 16.2.9

### Prettier 3.8.4
- **Version:** 3.8.4
- **Related Files:**
  - `.prettierrc`

### prettier-plugin-tailwindcss 0.8.0
- **Version:** 0.8.0

### tsx 4.22.4
- **Version:** 4.22.4

---

## 11. Type Definitions

### @types/node 20
- **Version:** 20

### @types/react 19
- **Version:** 19

### @types/react-dom 19
- **Version:** 19

### @types/better-sqlite3 7.6.13
- **Version:** 7.6.13

---

## 12. Custom Design System

### Core Files:
- `primitive-tokens.css`
- `semantic-tokens.css`
- `visual-tokens.css`
- `component-tokens.css`
- `component-patterns.css`
- `tokens.ts`
- `token-names.ts`
- `index.ts`

---

## 13. Custom Platform UI

### Key Directories:
- `src/platform/ui/registry/`
- `src/platform/ui/i18n/`
- `src/platform/ui/devtools/`
- `src/platform/ui/enforcement/`

---

## 14. Scripts & Automation

### Main Scripts:
- `generate-feature.ts`
- `generate-app-route-manifest.ts`
- `export-to-json.ts`
- `check-db.ts`
- `validate-images.ts`
- `analyze-db.ts`
- `registry-generate.ts`
- `ci-*.ts`

---

## 15. Summary Table

| Category | Library | Version |
|----------|---------|---------|
| Framework | Next.js | 16.2.9 |
| Core | React | 19.2.4 |
| Core | TypeScript | 5 |
| State Management | Zustand | 5.0.14 |
| State Management | @tanstack/react-query | 5.101.0 |
| Database | Drizzle ORM | 0.45.2 |
| Database | better-sqlite3 | 12.10.1 |
| Forms | react-hook-form | 7.79.0 |
| Validation | Zod | 4.4.3 |
| HTTP | Axios | 1.17.0 |
| Styling | Tailwind CSS | 4 |
| Icons | lucide-react | 1.18.0 |
| Utilities | clsx | 2.1.1 |
| Utilities | tailwind-merge | 3.6.0 |
| Utilities | date-fns | 4.4.0 |
| Utilities | nanoid | 5.1.11 |
| Backend | Firebase | 12.14.0 |
| Testing | Jest | 30.4.2 |
| Testing | @testing-library/react | 16.3.2 |
| Development | ESLint | 9 |
| Development | Prettier | 3.8.4 |
| Execution | tsx | 4.22.4 |

---

## 16. Architecture

### Monorepo Structure
- `apps/`
- `packages/`
- `src/`

### Custom Platform
- UI Registry System
- Internationalization System
- Component Enforcement
- DevTools Integration

### Design System
- CSS Token System
- Type-safe Token Access
- Component Patterns
- Visual Tokens

---

## 17. References

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

**Last Updated:** June 2026  
**Maintained by:** GOVA Development Team
