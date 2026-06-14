# Unified UI + i18n Audit Report

Generated: 2026-06-14T11:06:07.177Z

## Executive Summary

**Overall Result: ❌ FAIL**
**Score: 65/100**

## Phase 1: UI Registry Scan

- Total UI Identifiers: 14
- Features: auth, home, dashboard, settings

## Phase 2: Translation Scan

- Total Translation Keys: 96
- Features: auth, common, dashboard, home, settings, splash

## Phase 3: Component Usage

- Used UI Identifiers: 0
- Used Translation Keys: 28
- Hardcoded Text Instances: 2

## Phase 4: Binding Matrix

| Feature | UI Elements | Translation Keys | Bindings | Orphans UI | Orphans Translation |
|----------|-------------|------------------|----------|------------|-------------------|
| auth | 6 | 19 | 0 | 6 | 0 |
| home | 2 | 10 | 0 | 2 | 0 |
| dashboard | 3 | 9 | 0 | 3 | 0 |
| settings | 3 | 11 | 0 | 3 | 0 |
| common | 0 | 43 | 0 | 0 | 0 |
| splash | 0 | 4 | 0 | 0 | 4 |

## Phase 5: Orphan Detection

- Orphan UI Identifiers: 14
- Orphan Translations: 53
- Missing Bindings: 14
- Cross-Feature Violations: 0

## Errors

- Missing bindings: 14 UI identifiers without translations
- Hardcoded text: 2 instances found

## Warnings

- Orphan UI identifiers: 14 found
- Orphan translations: 53 found
