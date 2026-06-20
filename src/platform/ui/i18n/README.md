# UI i18n Contract

The UI registry is the source of truth for user-facing translation keys.

## Key Shape

Registry paths may include a role segment:

```ts
feature.section.role.element
```

Translation keys are generated from that path as:

```ts
feature.section.camelCaseElement
```

Examples:

```ts
onboarding.welcome.display.description -> onboarding.welcome.description
merchant.performance.display.revenue-today -> merchant.performance.revenueToday
shared-layout.sidebar.actions.close-button -> shared-layout.sidebar.closeButton
```

The role segment (`display`, `actions`, `form`, `layout`, etc.) describes the UI identity and is not part of the final translation key.

## Naming

Leaf text keys must be `camelCase`.

Allowed:

```json
{ "currencyAud": "AUD ($)" }
```

Not allowed:

```json
{ "currency-aud": "AUD ($)" }
```

Section names may remain kebab-case when they match feature structure:

```json
{
  "store-info": {
    "storeName": "Store Name"
  }
}
```

## Metadata Identities

The registry also tracks structural and dynamic UI identities for inspection, telemetry, and MAOL.
These identities do not require translation entries:

- identities with `category: 'container'`
- identities listed in `NO_TRANSLATION_REQUIRED`
- common category identities skipped by the binding layer

Use `NO_TRANSLATION_REQUIRED` for dynamic-only identities such as merchant names, avatars, or banners where visible text comes from data rather than a locale file.

## Commands

```powershell
npm run i18n:sync
npm run i18n:validate
npm run i18n:validate-bindings
npm run i18n:generate-keys
npm run i18n
```

`npm run i18n` runs the full i18n pipeline. `i18n:sync` only adds missing required keys and never overwrites existing translations.
