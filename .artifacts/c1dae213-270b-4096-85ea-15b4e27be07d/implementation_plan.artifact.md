# Implementation Plan - Version Alignment and Build

Solve version mismatches, clear all caches, and build the release APK for the Android application.

## User Review Required

> [!IMPORTANT]
> The project has two `android` directories: one in the root and one in `apps/mobile/android`. Based on recent file updates, I will proceed with the **root `android` directory** for the APK build. Please confirm if this is NOT intended.

> [!WARNING]
> I will be deleting `node_modules` and `package-lock.json` to ensure a clean state. This will require a full `npm install`.

## Proposed Changes

### 1. Environment Cleanup
- Delete `node_modules` and `package-lock.json` in the root and all workspace folders (`apps/mobile`, `services/api`).
- Clear Metro bundler cache.
- Clear Gradle cache for the Android build.

### 2. Dependency Alignment
- Run `npm install` in the root to regenerate the lockfile and install all dependencies.
- Run `npx expo install --check` in `apps/mobile` to identify any Expo-specific version mismatches.
- Fix any identified mismatches to ensure compatibility with Expo SDK 57.

### 3. Android Build
- Navigate to the `android` directory.
- Run `./gradlew clean` to ensure a fresh build state.
- Run `./gradlew assembleRelease` to generate the release APK.

## Verification Plan

### Automated Tests
- `npm run dev:mobile` to ensure the project starts correctly after dependency re-installation.
- `npx expo install --check` should report no issues.

### Manual Verification
- Check for the generated APK in `android/app/build/outputs/apk/release/app-release.apk`.
- Verify the build logs for any remaining version conflicts or warnings.
