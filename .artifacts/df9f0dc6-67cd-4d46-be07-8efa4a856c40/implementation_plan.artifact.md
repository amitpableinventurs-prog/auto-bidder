# Implementation Plan - Fix FileSystem Upload Error

The app is currently failing to upload files with the error `Cannot read property 'MULTIPART' of undefined`. This is due to a change in `expo-file-system@19` (SDK 54) where legacy API members like `FileSystemUploadType` are no longer exported from the main entry point and must be imported from the `/legacy` path.

## User Review Required

> [!NOTE]
> This change switches the `expo-file-system` import to its legacy path to maintain compatibility with the existing code while using Expo SDK 54. In the future, it is recommended to migrate to the new class-based API or `@expo/fetch` as suggested by the library warnings.

## Proposed Changes

### Mobile Application

#### [MODIFY] [apps/mobile/src/api.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/api.ts)
- Change the `expo-file-system` import to use the legacy subpath:
  ```typescript
  import * as FileSystem from 'expo-file-system/legacy';
  ```

## Verification Plan

### Automated Tests
- Run `npx expo export apps/mobile --platform web` to verify that the change doesn't break the web bundle.
- Check for any other `expo-file-system` imports that might need a similar update.

### Manual Verification
- Ask the user to try the photo upload again in Expo Go and verify that the `MULTIPART` error is resolved.
