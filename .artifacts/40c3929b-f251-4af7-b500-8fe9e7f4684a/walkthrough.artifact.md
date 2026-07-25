# Walkthrough - Resolved Expo Start Cache Issue

I have resolved the `Unable to deserialize cloned data` error that was preventing `npx expo start` from running.

## Changes Made

### Cache Invalidation
- Executed `npx expo start --clear` to clear the Metro bundler cache.
- Manually removed `.expo/` and `apps/mobile/.expo/` directories to ensure all cached data was purged.

### Port Management
- Freed up port `8081` (and `4000`) using the project's `kill-ports` script to allow the Metro Bundler to bind to the default port.

## Verification Results

### Successful Bundler Start
The Metro Bundler now starts correctly and begins rebuilding the cache:
```text
Starting Metro Bundler
warning: Bundler cache is empty, rebuilding (this may take a minute)
```

> [!TIP]
> If you encounter this error again, running `npx expo start --clear` is usually the first step to fix corrupted cache issues.
