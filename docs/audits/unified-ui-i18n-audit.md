# Unified UI + i18n Audit Report

Generated: 2026-06-15T20:37:54.853Z

## Executive Summary

**Overall Result: ❌ FAIL**
**Score: 78/100**

## Phase 1: UI Registry Scan

- Total UI Identifiers: 38
- Features: home, error-boundary, splash, shared-layout

## Phase 2: Translation Scan

- Total Translation Keys: 221
- Features: auth, common, contact, dashboard, error-boundary, home, settings, shared-layout, signup, splash

## Phase 3: Component Usage

- Used UI Identifiers: 38
- Used Translation Keys: 48
- Hardcoded Text Instances: 6

## Phase 4: Binding Matrix

| Feature | UI Elements | Translation Keys | Bindings | Orphans UI | Orphans Translation |
|----------|-------------|------------------|----------|------------|-------------------|
| home | 23 | 90 | 23 | 0 | 0 |
| error-boundary | 1 | 1 | 1 | 0 | 0 |
| splash | 4 | 8 | 4 | 0 | 0 |
| shared-layout | 10 | 10 | 10 | 0 | 0 |
| auth | 0 | 25 | 0 | 0 | 25 |
| common | 0 | 51 | 0 | 0 | 0 |
| contact | 0 | 4 | 0 | 0 | 4 |
| dashboard | 0 | 14 | 0 | 0 | 14 |
| settings | 0 | 14 | 0 | 0 | 14 |
| signup | 0 | 4 | 0 | 0 | 4 |

## Phase 5: Orphan Detection

- Orphan UI Identifiers: 0
- Orphan Translations: 155
- Missing Bindings: 0
- Cross-Feature Violations: 9

## Errors

- Cross-feature violations: 9 found

## Warnings

- Orphan translations: 155 found (features pending UI identity migration)
- Hardcoded text: 6 instance(s) found — review if intentional
