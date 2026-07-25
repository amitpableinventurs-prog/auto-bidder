# Build Release APK

The goal is to generate a release APK for the `auto-bidder` Android application.

## User Review Required

> [!IMPORTANT]
> The project currently uses the **debug signing configuration** for release builds. This is suitable for testing the release build locally but should not be used for production distribution on the Play Store.

> [!NOTE]
> There are two potential Android projects in the repository:
> 1. Root `android/` (Package: `com.anonymous.autobidder`)
> 2. `apps/mobile/android/` (Package: `com.autobidder.mobile`)
>
> I will proceed with building the root `android/` project as it appears to be the primary one linked to the root Expo configuration. Please let me know if you intended to build the `apps/mobile` version instead.

## Proposed Changes

### Android Build

#### [BUILD] Root Android Project
I will execute the Gradle `assembleRelease` task in the root `android/` directory.

1.  Navigate to the `android/` directory.
2.  Run `./gradlew clean` to ensure a fresh build.
3.  Run `./gradlew assembleRelease` to generate the APK.

## Verification Plan

### Manual Verification
- Verify the existence of the generated APK at `android/app/build/outputs/apk/release/app-release.apk`.
- Provide the final path of the APK to the user.
