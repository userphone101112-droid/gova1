
# Problem: test1 missing from APP_DICTIONARY_FEATURES

## Description
Console error:
```
[i18n] Missing translation key: "test1.page.title".
```

## Root cause
The feature "test1" wasn't added to `APP_DICTIONARY_FEATURES` array in `src/platform/ui/i18n/core/getDictionary.ts`, so the app never loaded the test1 translations!

## Solution
Edit `src/platform/ui/i18n/core/getDictionary.ts` and add "test1" to `APP_DICTIONARY_FEATURES`:

```typescript
/** Features merged into the single app-wide dictionary */
export const APP_DICTIONARY_FEATURES: readonly Feature[] = [
  "common",
  "splash",
  "home",
  "auth",
  "shared-layout",
  "error-boundary",
  "settings",
  "merchant",
  "onboarding",
  "test1", // <-- add here
  "image-upload-form",
  "signup",
] as const;
```
