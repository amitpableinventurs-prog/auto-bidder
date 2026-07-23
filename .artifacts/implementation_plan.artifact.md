<<<<<<< HEAD
# Update Submit and More Details Button UI

The goal is to update the "SUBMIT" and "ADD MORE INFO" buttons in the `FillCarDetails` screen to match the provided 3D rounded design with icons.

## Proposed Changes

### Mobile App

#### [MODIFY] [FillCarDetails.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/FillCarDetails.tsx)
- Update `submitBtn` style to add a 3D effect using `borderBottomWidth` and `borderBottomColor`.
- Update the buttons in the footer row:
    - Change "ADD MORE INFO" to "MORE DETAILS".
    - Update icons to match the design (Paper plane for Submit, Document for More Details).
    - Use pill-shaped `borderRadius`.
- Adjust spacing and font weights to match the image.
=======
# Fix App Not Running on Emulator and Expo

The app is failing to run due to two main issues: a Metro bundler crash when starting Expo, and an Android build failure due to Kotlin version mismatches in the Expo plugins.

## User Review Required

> [!IMPORTANT]
> The project is using extremely new versions of Expo (54) and React Native (0.81). These versions are currently in pre-release/experimental state and may have inherent bugs.

## Proposed Changes

### 1. Metro Configuration
Exclude native build folders and other non-essential directories from Metro's watcher to prevent the `ENOENT` error.

#### [MODIFY] [metro.config.js](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/metro.config.js)
- Add `exclusionList` to ignore `.gradle`, `android`, `ios`, and `build` folders.

### 2. Android Build Fix
Address the Kotlin version mismatch in `expo-dev-launcher` and `expo-modules-autolinking`.

#### [MODIFY] [gradle-wrapper.properties](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/android/gradle/wrapper/gradle-wrapper.properties)
- Ensure Gradle 8.10.2 is used consistently.

#### [MODIFY] [build.gradle.kts (expo-dev-launcher)](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/node_modules/expo-dev-launcher/expo-dev-launcher-gradle-plugin/build.gradle.kts)
- Update Kotlin version to `2.1.20` to match `expo-modules-autolinking`.

### 3. Cleanup and Reset
Provide a way to clean all caches if the above don't work.
>>>>>>> 2ce57fb (Update project)

## Verification Plan

### Manual Verification
<<<<<<< HEAD
- Navigate to the "Sell Car" flow and reach the "Fill Car Details" screen.
- Verify the buttons at the bottom have the new 3D rounded look.
- Confirm icons are displayed correctly next to the text.
=======
- Run `npx expo start` in `apps/mobile` and verify it starts without ENOENT.
- Run `npx expo run:android` (or the `npm run android` root script) to verify the build completes and installs on the emulator.
>>>>>>> 2ce57fb (Update project)
