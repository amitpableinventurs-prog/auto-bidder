# Fix Build Errors in Expo/React Native Android

The project is failing to build due to a combination of factors:
1.  **Ninja "Dirty Manifest" Error**: A common issue on Windows where Ninja gets stuck in an infinite loop regenerating `build.ninja`.
2.  **Missing Prefab Headers**: `react-native-worklets` (v0.10.0) depends on headers generated during the build, but CMake configuration runs before they are ready, especially after a clean.
3.  **Deprecated Configuration**: `newArchEnabled=false` is deprecated in React Native 0.86+ and should be removed.
4.  **Path Length Warning**: The project path is quite long, which can cause issues on Windows with CMake/Ninja.
5.  **Android Preferences Conflict**: Multiple environment variables (`ANDROID_PREFS_ROOT` and `ANDROID_USER_HOME`) are pointing to the same location, which modern Android Gradle Plugin versions treat as an error.

## User Review Required

> [!IMPORTANT]
> This plan involves deleting build folders (`.cxx`, `build`) and modifying Gradle files. These changes are safe but will trigger a full rebuild.

> [!CAUTION]
> **Environment Variables**: You need to unset `ANDROID_PREFS_ROOT` in your system environment variables. Only `ANDROID_USER_HOME` should be used. I cannot fix this automatically as it is a system-level setting.

> [!TIP]
> If build errors persist after these steps, consider moving the project to a shorter directory path (e.g., `C:\dev\auto-bidder`) to avoid Windows `MAX_PATH` limitations.

## Proposed Changes

### [Component] Gradle Configuration

#### [MODIFY] [gradle.properties](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/android/gradle.properties)
- Remove `newArchEnabled=false` to resolve the deprecation warning.

#### [MODIFY] [build.gradle](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/android/app/build.gradle)
- Add a workaround to ensure `react-native-worklets` headers are generated before CMake configuration starts.

### [Component] Manual Cleanup

#### [COMMAND] Forced Cleanup
- Manually delete `.cxx` and `build` directories in the root and relevant `node_modules`.

## Execution Plan

1.  **Cleanup**:
    - Delete `android/.gradle`
    - Delete `android/app/build`
    - Delete `node_modules/expo-modules-core/android/.cxx`
    - Delete `node_modules/react-native-reanimated/android/.cxx`
    - Delete `node_modules/react-native-worklets/android/.cxx`
    - Delete `node_modules/react-native-worklets/android/build`

2.  **Update `gradle.properties`**:
    - Remove `newArchEnabled=false`.

3.  **Update `app/build.gradle`**:
    - Add the task dependency fix for Prefab headers.

4.  **Rebuild**:
    - Run `.\gradlew clean` (should succeed now).
    - Run `.\gradlew assembleRelease`.

## Verification Plan

### Automated Tests
- Run `./gradlew clean` to ensure the configuration phase passes without errors.
- Run `./gradlew assembleRelease` to verify the full build completes successfully.
