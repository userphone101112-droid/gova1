
# Problem: feature "test1" already existed

## Description
When trying to run `npm run generate:feature -- test1`, we got an error:
```
❌ Feature "test1" already exists.
```

## Root cause
There was already a directory named `test1` at `src/features/`.

## Solution
Delete `src/features/test1` directory:
```powershell
Remove-Item -Path "src/features/test1" -Recurse -Force
```

Then re-run the feature generation command:
```powershell
npm run generate:feature -- test1
```
