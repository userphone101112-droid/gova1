# Unified UI + i18n Audit Report

Generated: 2026-06-20T02:02:36.591Z

## Executive Summary

**Overall Result: ✅ PASS**
**Score: 98/100**

## Phase 1: UI Registry Scan

- Total UI Identifiers: 498
- Features: home, error-boundary, splash, shared-layout, auth, settings, merchant, onboarding, common

## Phase 2: Translation Scan

- Total Translation Keys: 623
- Features: auth, common, error-boundary, home, merchant, onboarding, settings, shared-layout, splash

## Phase 3: Component Usage

- Used UI Identifiers: 498
- Used Translation Keys: 38
- Hardcoded Text Instances: 6

## Phase 4: Binding Matrix

| Feature | UI Elements | Translation Keys | Bindings | Orphans UI | Orphans Translation |
|----------|-------------|------------------|----------|------------|-------------------|
| home | 39 | 73 | 39 | 0 | 0 |
| error-boundary | 3 | 3 | 3 | 0 | 0 |
| splash | 11 | 24 | 11 | 0 | 0 |
| shared-layout | 27 | 32 | 27 | 0 | 0 |
| auth | 66 | 82 | 66 | 0 | 0 |
| settings | 59 | 59 | 59 | 0 | 0 |
| merchant | 82 | 82 | 82 | 0 | 0 |
| onboarding | 142 | 142 | 142 | 0 | 0 |
| common | 69 | 133 | 69 | 0 | 0 |

## Phase 5: Orphan Detection

- Orphan UI Identifiers: 0
- Orphan Translations: 487
- Missing Bindings: 0
- Cross-Feature Violations: 0

## Errors

None

## Warnings

- Orphan translations: 487 found (features pending UI identity migration)
- Hardcoded text: 6 instance(s) found — review if intentional
