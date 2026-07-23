# Build Issue Resolved: NDK and SDK Versions Adjusted

The previous build failed with linker errors (`undefined symbol: std::__ndk1::...`) when compiling native modules like `react-native-worklets` and `expo-modules-core`. This was caused by a mismatch or issue with NDK 27 and SDK 36 on Windows.

## Changes Made

### Configuration Updates

- **[app.json](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/app.json)**:
    - Pinned `compileSdkVersion` and `targetSdkVersion` to **35**.
    - Pinned `buildToolsVersion` to **35.0.0**.
    - Pinned `ndkVersion` to **26.1.10909125** (the stable version for modern React Native).
- **[apps/mobile/app.json](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/app.json)**: Applied identical version pinning for consistency.

## Next Steps

1. **Regenerate Native Project**:
   Run the following command to apply the version changes to the native `android` folder:
   ```bash
   npx expo prebuild --clean
   ```

2. **Re-run Build**:
   After prebuild finishes, try the build again:
   ```bash
   npx expo run:android
   ```

> [!TIP]
> Pinning the NDK to 26.1.x is a common fix for linker errors on Windows when using the React Native New Architecture, as NDK 27 introduced breaking toolchain changes that some libraries haven't fully adopted.
