# Image Preview Not Appearing After Upload

## Problem

When using the Test1 page's image upload feature, after clicking "Upload Image" and selecting images, the preview wasn't appearing on the screen.

## Root Cause

- Originally, we were wrapping preview images with a conditional (`{previewImages.length > 0 && ...}`).
- Also, we were missing a dedicated `PREVIEW_IMAGE` UI registry identity, and weren't using `data-ui-instance-id` (which is required for repeatable UI elements).

## Solution Steps

1. **Added a dedicated PREVIEW_IMAGE identity** in the TEST1 registry with repeatable: true
2. **Materialized a UUID** for PREVIEW_IMAGE
3. **Added translations** for preview image alt text
4. **Updated the component** to use TEST1.IMAGE_UPLOAD.PREVIEW_IMAGE
5. **Removed the conditional wrapper** around preview images and used a grid layout matching image-upload-form

## Code Changes
```typescript
// src/platform/ui/registry/features/test1.ts
IMAGE_UPLOAD: {
  ...
  PREVIEW_IMAGE: {
    id: 'UI_TEST1_IMAGE_UPLOAD_PREVIEW_IMAGE',
    path: 'test1.image-upload.display.preview-image',
    description: 'Image preview image',
    category: 'display',
    feature: 'test1',
    lifecycle: 'active',
    version: '1.0.0',
    createdAt: '2026-06-21',
    updatedAt: '2026-06-21',
    repeatable: true,
  } as const,
}
```

```tsx
// src/components/test1/test1-content.tsx
{previewImages.map((image) => (
  <img
    key={image.id}
    data-ui-uuid={TEST1.IMAGE_UPLOAD.PREVIEW_IMAGE.uuid}
    data-ui-instance-id={image.id}
    src={image.url}
    alt={t(TEST1.IMAGE_UPLOAD.PREVIEW_IMAGE)}
    className="col-span-1 h-32 w-full rounded-lg border border-outline-variant object-cover"
  />
))}
```

Also, don't forget to run `npm run registry:materialize-uuids`, `npm run i18n:sync`, `npm run registry:generate`, and `npm run typecheck`.

## Result
The preview images now appear immediately after being selected!
