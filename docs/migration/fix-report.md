# Automated Fix Report

**Generated:** 2026-06-14T12:09:27.148Z
**Dry Run:** NO

## Summary

- Total Fixes Attempted: 18
- Successful Fixes: 16
- Failed Fixes: 2
- Skipped Fixes: 0

## Detailed Results


### hardcoded_text_ui.ts_19_46

- **Status:** ✅ Success
- **Error:** None
- **Original:** `/**
 * Public UI Component API
 * 
 * This is the ONLY public API for UI components in the project.
`
- **Fixed:** `/**
 * Public UI Component API
 * 
 * This is the ONLY public API for UI components in the project.
`

---

### missing_translation_ui.ts_19_46

- **Status:** ❌ Failed
- **Error:** No changes needed or unable to fix safely


---

### missing_translation_api-client.ts_51_20

- **Status:** ✅ Success
- **Error:** None
- **Original:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`
- **Fixed:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`

---

### missing_translation_api-client.ts_52_35

- **Status:** ✅ Success
- **Error:** None
- **Original:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`
- **Fixed:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`

---

### missing_translation_api-client.ts_56_21

- **Status:** ✅ Success
- **Error:** None
- **Original:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`
- **Fixed:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`

---

### missing_translation_api-client.ts_57_35

- **Status:** ✅ Success
- **Error:** None
- **Original:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`
- **Fixed:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`

---

### missing_translation_api-client.ts_61_20

- **Status:** ✅ Success
- **Error:** None
- **Original:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`
- **Fixed:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`

---

### missing_translation_api-client.ts_62_35

- **Status:** ✅ Success
- **Error:** None
- **Original:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`
- **Fixed:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`

---

### missing_translation_api-client.ts_66_22

- **Status:** ✅ Success
- **Error:** None
- **Original:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`
- **Fixed:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`

---

### missing_translation_api-client.ts_67_35

- **Status:** ✅ Success
- **Error:** None
- **Original:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`
- **Fixed:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`

---

### missing_translation_api-client.ts_71_23

- **Status:** ✅ Success
- **Error:** None
- **Original:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`
- **Fixed:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`

---

### missing_translation_api-client.ts_72_35

- **Status:** ✅ Success
- **Error:** None
- **Original:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`
- **Fixed:** `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { normali`

---

### hardcoded_text_dynamic-imports.ts_4_16

- **Status:** ✅ Success
- **Error:** None
- **Original:** `import dynamic from 'next/dynamic';

export const dynamicImport = (
  importFn: () => Promise<{ d`
- **Fixed:** `import dynamic from 'next/dynamic';

export const dynamicImport = (
  importFn: () =>{{t("common.`

---

### missing_translation_dynamic-imports.ts_4_16

- **Status:** ❌ Failed
- **Error:** No changes needed or unable to fix safely


---

### missing_translation_base-repository.ts_6_46

- **Status:** ✅ Success
- **Error:** None
- **Original:** `export abstract class BaseRepository<T> {
  protected abstract resourceName: string;

  protected`
- **Fixed:** `export abstract class BaseRepository<T> {
  protected abstract resourceName: string;

  protected`

---

### missing_translation_base-repository.ts_7_55

- **Status:** ✅ Success
- **Error:** None
- **Original:** `export abstract class BaseRepository<T> {
  protected abstract resourceName: string;

  protected`
- **Fixed:** `export abstract class BaseRepository<T> {
  protected abstract resourceName: string;

  protected`

---

### missing_translation_base-service.ts_6_46

- **Status:** ✅ Success
- **Error:** None
- **Original:** `export abstract class BaseService<T> {
  protected abstract repository: unknown;

  protected abs`
- **Fixed:** `export abstract class BaseService<T> {
  protected abstract repository: unknown;

  protected abs`

---

### missing_translation_base-service.ts_7_55

- **Status:** ✅ Success
- **Error:** None
- **Original:** `export abstract class BaseService<T> {
  protected abstract repository: unknown;

  protected abs`
- **Fixed:** `export abstract class BaseService<T> {
  protected abstract repository: unknown;

  protected abs`


## Next Steps


1. Review the applied fixes
2. Run ESLint and TypeScript to validate
3. Manually fix remaining violations
4. Run clean state validation

