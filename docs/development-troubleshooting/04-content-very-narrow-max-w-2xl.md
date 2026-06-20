
# Problem: New feature/page content appears extremely narrow

## Description
When creating a new page/feature, all content is confined to a very narrow width, making it look cramped.

## Root cause
The default container class `max-w-2xl` in the page container component restricts the maximum width to a small size (tailwind's `max-w-2xl` = 672px). This class is copied from the default generated components or examples.

## Solution
Adjust the `max-w-*` class on the main container div:
- For a moderate width: use `max-w-3xl` (768px) or `max-w-4xl` (896px)
- For a wider width: use `max-w-5xl` (1024px) or `max-w-6xl` (1152px)
- For full (unrestricted) width: remove the `max-w-*` class entirely

### Example fix:
Before:
```typescript
<div
  data-ui-uuid={TEST1.PAGE.CONTAINER.uuid}
  className="mx-auto min-h-48 max-w-2xl space-y-6 bg-background px-4 py-8"
>
```

After (using wider width):
```typescript
<div
  data-ui-uuid={TEST1.PAGE.CONTAINER.uuid}
  className="mx-auto min-h-48 max-w-5xl space-y-6 bg-background px-4 py-8"
>
```
