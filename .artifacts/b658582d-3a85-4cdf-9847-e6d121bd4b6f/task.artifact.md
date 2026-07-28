# Tasks - React Native Android Release APK Build

- `[x]` Environment Verification & Dependency Setup
    - `[x]` Install root dependencies
    - `[x]` Install `apps/mobile` dependencies
    - `[x]` Run `npx react-native doctor` (skipped due to `wmic` issue, manual check passed)
- `[x]` Android Build Preparation
    - `[x]` Clean build environment (`./gradlew clean`) - Fixed `AndroidLocationsException` by unsetting `ANDROID_PREFS_ROOT`
- `[/]` Execute Release Build
    - `[ ]` Run `./gradlew assembleRelease`
- `[ ]` Error Analysis & Iterative Fixes
    - `[ ]` Resolve any AAPT2, R8, or dependency issues
- `[ ]` Final Verification
    - `[ ]` Verify APK output path: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
