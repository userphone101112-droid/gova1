
# Problem: Using hyphen in final path segment causes missing translation

## Description
Console error like:
```
[i18n] Missing translation key: "test1.form.input-1".
```

## Root cause
The `generateTranslationKeyFromUi` function in `src/platform/ui/i18n/binding/registry-binding.ts` uses this regex to convert kebab-case to camelCase:
```typescript
const camelCaseElement = element.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
```
This regex only works with lowercase letters, NOT numbers! For example:
- `input-1` → stays `input-1` instead of `input1`
- `input-2` → stays `input-2` instead of `input2`
- `upload-button` → correctly `uploadButton` (since hyphen followed by a letter)

## Solution
Update your registry identity paths in `src/platform/ui/registry/features/<feature>.ts` to remove hyphens from the final segment. For example:
- `test1.form.input.input-1` → `test1.form.input.input1`
- `test1.form.input.input-2` → `test1.form.input.input2`
- `test1.form.input.input-3` → `test1.form.input.input3`

Then run:
1. `npm run registry:materialize-uuids`
2. `npm run registry:generate`
3. `npm run i18n:sync` (if needed)
4. `npm run i18n:validate`
