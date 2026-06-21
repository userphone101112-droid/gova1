# CSP (Content Security Policy) Blocking Blob Image Previews

## Problem
After selecting images for upload, you see a browser error:
"Loading the image 'blob:http://localhost:3001/[uuid]' violates the following Content Security Policy directive: "img-src 'self' data: https:". The action has been blocked."

## Root Cause
The Content Security Policy (CSP) did not allow `blob:` URLs in the `img-src` directive, which are required for local previewing of uploaded files (since we use `URL.createObjectURL(file)` which produces blob: URLs).

## Solution
Update the CSP headers in `src/middleware.ts` to add `blob:` to the `img-src` directive!

## Code Changes
```typescript
// src/middleware.ts
  // Before (without blob:):
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self';"
  );

  // After (with blob: added):
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self';"
  );
```
