# Build Release APK Implementation Plan

I will attempt to build the Release APK again. The previous attempt failed due to Ninja build system issues (dirty manifest) and some native module path mismatches.

## Proposed Changes

### Release Build Process
1. **Full Clean**: Run `./gradlew clean` to reset the build state.
2. **Remove Native Caches**: Manually delete all `.cxx` directories in the `android/` folder and relevant `node_modules` to ensure CMake regenerates correctly.
3. **Build Release APK**: Run `./gradlew assembleRelease` with environment fixes (unsetting `ANDROID_PREFS_ROOT` to avoid conflict).

## Verification Plan

### Automated Tests
- Verify existence of `android/app/build/outputs/apk/release/app-release.apk`.

### Manual Verification
- Provide the user with the final APK path.
