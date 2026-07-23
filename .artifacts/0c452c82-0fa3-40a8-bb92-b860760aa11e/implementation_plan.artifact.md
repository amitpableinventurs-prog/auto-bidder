# Troubleshooting App Launch Issue (Android)

The user is unable to open the Android app. Initial investigation shows that the app (`com.autobidder.mobile`) is not installed on the emulator, and there have been port conflicts with the Metro bundler.

## User Review Required

> [!IMPORTANT]
> I will be running build commands which might take some time and consume system resources. Please ensure your Android emulator or device is running and stable.

## Proposed Changes

No code changes are proposed yet. The focus is on environment setup and build troubleshooting.

### 1. Environment Verification
- Check if `node_modules` are correctly installed and linked.
- Verify if port 8081 is available for Metro.
- Ensure Android SDK paths are correctly set.

### 2. Build and Launch
- Start the development server from the root using `npm run dev:mobile`.
- Attempt to build and install the Android app using `npm run android`.
- Monitor the output for specific errors (e.g., Gradle failures, dependency mismatches).

### 3. Log Analysis
- If the app builds but fails to open, analyze Logcat for startup crashes.
- Check Metro logs for JS-side bundle errors.

## Verification Plan

### Manual Verification
- Run `npm run android` and verify that the app successfully installs and opens on the emulator.
- Check if the "Auto Bidder" splash screen appears and transitions to the main app UI.
