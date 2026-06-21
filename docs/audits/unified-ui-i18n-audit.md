# Unified UI + i18n Audit Report

Generated: 2026-06-21T23:50:08.631Z

## Executive Summary

**Overall Result: ✅ PASS**
**Score: 98/100**

## Phase 1: UI Registry Scan

- Total UI Identifiers: 1309
- Features: home, error-boundary, splash, shared-layout, auth, settings, merchant, onboarding, test1, image-upload-form, devtools, common

## Phase 2: Translation Scan

- Total Translation Keys: 861
- Features: auth, common, devtools, error-boundary, home, image-upload-form, merchant, onboarding, settings, shared-layout, splash, test1

## Phase 3: Component Usage

- Used UI Identifiers: 1309
- Used Translation Keys: 61
- Hardcoded Text Instances: 28

## Phase 4: Binding Matrix

| Feature | UI Elements | Translation Keys | Bindings | Orphans UI | Orphans Translation |
|----------|-------------|------------------|----------|------------|-------------------|
| home | 66 | 75 | 66 | 0 | 0 |
| error-boundary | 14 | 9 | 14 | 0 | 0 |
| splash | 39 | 24 | 39 | 0 | 0 |
| shared-layout | 57 | 51 | 57 | 0 | 0 |
| auth | 142 | 100 | 142 | 0 | 0 |
| settings | 174 | 62 | 174 | 0 | 0 |
| merchant | 305 | 150 | 305 | 0 | 0 |
| onboarding | 298 | 190 | 298 | 0 | 0 |
| test1 | 11 | 7 | 11 | 0 | 0 |
| image-upload-form | 16 | 15 | 16 | 0 | 0 |
| devtools | 118 | 52 | 118 | 0 | 0 |
| common | 69 | 133 | 69 | 0 | 0 |

## Phase 5: Orphan Detection

- Orphan UI Identifiers: 0
- Orphan Translations: 725
- Missing Bindings: 0
- Cross-Feature Violations: 0

## Errors

None

## Warnings

- Orphan translations: 725 found (features pending UI identity migration)
- Hardcoded text: 28 instance(s) found — review if intentional
