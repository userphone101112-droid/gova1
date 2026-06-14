# Legacy Violations Report

**Generated:** 2026-06-14T12:01:46.380Z
**Total Violations:** 18

## Executive Summary

- **CRITICAL:** 0
- **HIGH:** 18
- **MEDIUM:** 0
- **LOW:** 0

## Violations by Type

- **hardcoded_text:** 2
- **missing_translation:** 16

## Violations by Feature

- **common:** 18

## Detailed Violations


### hardcoded_text_ui.ts_19_46

- **Type:** hardcoded_text
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\components\ui.ts
- **Line:** 19
- **Column:** 47
- **Feature:** common
- **Description:** Hardcoded text "Click me" found in JSX
- **Suggestion:** Replace with translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_ui.ts_19_46

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\components\ui.ts
- **Line:** 19
- **Column:** 47
- **Feature:** common
- **Description:** Text "Click me" not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_api-client.ts_51_20

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\lib\api-client.ts
- **Line:** 51
- **Column:** 21
- **Feature:** common
- **Description:** Text "(url: string, config?: AxiosRequestConfig): Promis..." not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_api-client.ts_52_35

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\lib\api-client.ts
- **Line:** 52
- **Column:** 36
- **Feature:** common
- **Description:** Text "= await this.client.get" not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_api-client.ts_56_21

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\lib\api-client.ts
- **Line:** 56
- **Column:** 22
- **Feature:** common
- **Description:** Text "(url: string, data?: unknown, config?: AxiosReques..." not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_api-client.ts_57_35

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\lib\api-client.ts
- **Line:** 57
- **Column:** 36
- **Feature:** common
- **Description:** Text "= await this.client.post" not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_api-client.ts_61_20

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\lib\api-client.ts
- **Line:** 61
- **Column:** 21
- **Feature:** common
- **Description:** Text "(url: string, data?: unknown, config?: AxiosReques..." not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_api-client.ts_62_35

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\lib\api-client.ts
- **Line:** 62
- **Column:** 36
- **Feature:** common
- **Description:** Text "= await this.client.put" not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_api-client.ts_66_22

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\lib\api-client.ts
- **Line:** 66
- **Column:** 23
- **Feature:** common
- **Description:** Text "(url: string, data?: unknown, config?: AxiosReques..." not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_api-client.ts_67_35

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\lib\api-client.ts
- **Line:** 67
- **Column:** 36
- **Feature:** common
- **Description:** Text "= await this.client.patch" not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_api-client.ts_71_23

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\lib\api-client.ts
- **Line:** 71
- **Column:** 24
- **Feature:** common
- **Description:** Text "(url: string, config?: AxiosRequestConfig): Promis..." not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_api-client.ts_72_35

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\lib\api-client.ts
- **Line:** 72
- **Column:** 36
- **Feature:** common
- **Description:** Text "= await this.client.delete" not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### hardcoded_text_dynamic-imports.ts_4_16

- **Type:** hardcoded_text
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\lib\dynamic-imports.ts
- **Line:** 4
- **Column:** 17
- **Feature:** common
- **Description:** Hardcoded text "Promise" found in JSX
- **Suggestion:** Replace with translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_dynamic-imports.ts_4_16

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\lib\dynamic-imports.ts
- **Line:** 4
- **Column:** 17
- **Feature:** common
- **Description:** Text "Promise" not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_base-repository.ts_6_46

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\repositories\base-repository.ts
- **Line:** 6
- **Column:** 47
- **Feature:** common
- **Description:** Text "): Promise" not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_base-repository.ts_7_55

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\repositories\base-repository.ts
- **Line:** 7
- **Column:** 56
- **Feature:** common
- **Description:** Text "): Promise" not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_base-service.ts_6_46

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\services\base-service.ts
- **Line:** 6
- **Column:** 47
- **Feature:** common
- **Description:** Text "): Promise" not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes

---

### missing_translation_base-service.ts_7_55

- **Type:** missing_translation
- **Severity:** HIGH
- **File:** C:\Users\hesham\Desktop\gova\src\services\base-service.ts
- **Line:** 7
- **Column:** 56
- **Feature:** common
- **Description:** Text "): Promise" not wrapped in translation function
- **Suggestion:** Wrap in translation: {t("common.key")}
- **Auto-Fixable:** Yes


## Migration Priority

1. **CRITICAL** - Fix immediately (breaks UI/i18n rules)
2. **HIGH** - Fix soon (hardcoded text)
3. **MEDIUM** - Fix during migration (missing binding)
4. **LOW** - Fix later (style/legacy patterns)

## Next Steps

1. Run automated fixer for auto-fixable violations
2. Manually review and fix remaining violations
3. Validate fixes with ESLint and TypeScript
4. Run clean state validation
