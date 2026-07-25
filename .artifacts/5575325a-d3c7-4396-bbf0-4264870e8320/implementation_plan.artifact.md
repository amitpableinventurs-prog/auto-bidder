# Build Android APK

The goal is to build an Android APK for the `auto-bidder` mobile application. We have resolved environment conflicts and fixed Gradle property types and `compileSdk` version requirements.

## User Review Required

> [!IMPORTANT]
> The build was updated to use **Android SDK 36** as mandated by some modern dependencies (e.g., `androidx.core:core:1.18.0`).
> We are currently troubleshooting a C++ build issue (`ninja: error: manifest 'build.ninja' still dirty`) by performing a full clean.

## Proposed Changes

### [Component Name] Gradle Configuration

#### [MODIFY] [build.gradle](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/android/build.gradle)
- Set `minSdkVersion`, `compileSdkVersion`, and `targetSdkVersion` as Integers in `ext`.
- Increased `compileSdkVersion` and `targetSdkVersion` to **36**.

#### [MODIFY] [gradle.properties](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/android/gradle.properties)
- Updated `compileSdkVersion` and `targetSdkVersion` to **36**.

## Execution Plan

1. **Clean Build**: Run `gradlew clean` to reset C++ build states.
2. **Build Release APK**: Execute the build command with `ANDROID_PREFS_ROOT` unset.
   - Command: `cmd /c "set ANDROID_PREFS_ROOT=&& cd android && gradlew assembleRelease"`
3. **Verify APK**: Locate and verify the generated APK.

## Verification Plan

### Manual Verification
- Verify that the APK file is generated at `android/app/build/outputs/apk/release/app-release.apk`.
