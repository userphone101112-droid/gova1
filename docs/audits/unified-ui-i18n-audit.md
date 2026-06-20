# Unified UI + i18n Audit Report

Generated: 2026-06-20T05:15:08.017Z

## Executive Summary

**Overall Result: ✅ PASS**
**Score: 100/100**

## Phase 1: UI Registry Scan

- Total UI Identifiers: 1251
- Features: home, error-boundary, splash, shared-layout, auth, settings, merchant, onboarding, devtools, common

## Phase 2: Translation Scan

- Total Translation Keys: 822
- Features: auth, common, devtools, error-boundary, home, merchant, onboarding, settings, shared-layout, splash

## Phase 3: Component Usage

- Used UI Identifiers: 1251
- Used Translation Keys: 42
- Hardcoded Text Instances: 0

## Phase 4: Binding Matrix

| Feature | UI Elements | Translation Keys | Bindings | Orphans UI | Orphans Translation |
|----------|-------------|------------------|----------|------------|-------------------|
| home | 66 | 75 | 66 | 0 | 0 |
| error-boundary | 14 | 9 | 14 | 0 | 0 |
| splash | 39 | 24 | 39 | 0 | 0 |
| shared-layout | 57 | 51 | 57 | 0 | 0 |
| auth | 137 | 90 | 137 | 0 | 0 |
| settings | 174 | 62 | 174 | 0 | 0 |
| merchant | 305 | 150 | 305 | 0 | 0 |
| onboarding | 298 | 190 | 298 | 0 | 0 |
| devtools | 92 | 45 | 92 | 0 | 0 |
| common | 69 | 133 | 69 | 0 | 0 |

## Phase 5: Orphan Detection

- Orphan UI Identifiers: 0
- Orphan Translations: 686
- Missing Bindings: 0
- Cross-Feature Violations: 0

## Errors

None

## Warnings

- Orphan translations: 686 found (features pending UI identity migration)
