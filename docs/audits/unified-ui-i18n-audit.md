# Unified UI + i18n Audit Report

Generated: 2026-06-21T16:58:53.503Z

## Executive Summary

**Overall Result: ❌ FAIL**
**Score: 78/100**

## Phase 1: UI Registry Scan

- Total UI Identifiers: 1307
- Features: home, error-boundary, splash, shared-layout, auth, settings, merchant, onboarding, test1, image-upload-form, devtools, common

## Phase 2: Translation Scan

- Total Translation Keys: 863
- Features: auth, common, devtools, error-boundary, home, image-upload-form, merchant, onboarding, settings, shared-layout, splash, test1

## Phase 3: Component Usage

- Used UI Identifiers: 1307
- Used Translation Keys: 58
- Hardcoded Text Instances: 21

## Phase 4: Binding Matrix

| Feature | UI Elements | Translation Keys | Bindings | Orphans UI | Orphans Translation |
|----------|-------------|------------------|----------|------------|-------------------|
| home | 66 | 75 | 66 | 0 | 0 |
| error-boundary | 14 | 9 | 14 | 0 | 0 |
| splash | 39 | 24 | 39 | 0 | 0 |
| shared-layout | 57 | 51 | 57 | 0 | 0 |
| auth | 140 | 102 | 140 | 0 | 0 |
| settings | 174 | 62 | 174 | 0 | 0 |
| merchant | 305 | 150 | 305 | 0 | 0 |
| onboarding | 298 | 190 | 298 | 0 | 0 |
| test1 | 11 | 7 | 11 | 0 | 0 |
| image-upload-form | 16 | 15 | 16 | 0 | 0 |
| devtools | 118 | 52 | 118 | 0 | 0 |
| common | 69 | 133 | 69 | 0 | 0 |

## Phase 5: Orphan Detection

- Orphan UI Identifiers: 0
- Orphan Translations: 727
- Missing Bindings: 0
- Cross-Feature Violations: 0

## Errors

- Strict Coverage Violation: data-ui-uuid uses raw string "AUTH.REGISTRATION.EMAIL_INPUT_CONTAINER" in "/src/components/auth/EmailInput.tsx:16". Use a registry identity reference: data-ui-uuid={HOME.X.uuid}.
- Strict Coverage Violation: data-ui-uuid uses raw string "AUTH.REGISTRATION.EMAIL_INPUT_LABEL" in "/src/components/auth/EmailInput.tsx:18". Use a registry identity reference: data-ui-uuid={HOME.X.uuid}.
- Strict Coverage Violation: data-ui-uuid uses raw string "AUTH.REGISTRATION.EMAIL_INPUT_WRAPPER" in "/src/components/auth/EmailInput.tsx:23". Use a registry identity reference: data-ui-uuid={HOME.X.uuid}.
- Strict Coverage Violation: data-ui-uuid uses raw string "AUTH.REGISTRATION.EMAIL_INPUT" in "/src/components/auth/EmailInput.tsx:25". Use a registry identity reference: data-ui-uuid={HOME.X.uuid}.
- Strict Coverage Violation: data-ui-uuid uses raw string "AUTH.REGISTRATION.EMAIL_INPUT_ERROR" in "/src/components/auth/EmailInput.tsx:37". Use a registry identity reference: data-ui-uuid={HOME.X.uuid}.

## Warnings

- Orphan translations: 727 found (features pending UI identity migration)
- Hardcoded text: 21 instance(s) found — review if intentional
