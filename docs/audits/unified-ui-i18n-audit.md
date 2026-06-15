# Unified UI + i18n Audit Report

Generated: 2026-06-15T04:35:07.313Z

## Executive Summary

**Overall Result: ❌ FAIL**
**Score: 83/100**

## Phase 1: UI Registry Scan

- Total UI Identifiers: 39
- Features: home, error-boundary, splash, shared-layout

## Phase 2: Translation Scan

- Total Translation Keys: 203
- Features: auth, common, contact, dashboard, error-boundary, home, settings, shared-layout, signup, splash

## Phase 3: Component Usage

- Used UI Identifiers: 39
- Used Translation Keys: 45
- Hardcoded Text Instances: 1

## Phase 4: Binding Matrix

| Feature | UI Elements | Translation Keys | Bindings | Orphans UI | Orphans Translation |
|----------|-------------|------------------|----------|------------|-------------------|
| home | 16 | 74 | 7 | 9 | 0 |
| error-boundary | 4 | 1 | 1 | 3 | 0 |
| splash | 7 | 6 | 2 | 5 | 0 |
| shared-layout | 12 | 10 | 10 | 2 | 0 |
| auth | 0 | 25 | 0 | 0 | 25 |
| common | 0 | 51 | 0 | 0 | 0 |
| contact | 0 | 4 | 0 | 0 | 4 |
| dashboard | 0 | 14 | 0 | 0 | 14 |
| settings | 0 | 14 | 0 | 0 | 14 |
| signup | 0 | 4 | 0 | 0 | 4 |

## Phase 5: Orphan Detection

- Orphan UI Identifiers: 0
- Orphan Translations: 140
- Missing Bindings: 19
- Cross-Feature Violations: 0

## Errors

- Missing bindings: 19 UI identifiers without translations

## Warnings

- Orphan translations: 140 found (features pending UI identity migration)
- Hardcoded text: 1 instance(s) found — review if intentional
