# Build Android APK Walkthrough

I attempted to build the release APK for the `auto-bidder` application, but encountered environment-specific restrictions in the IDE's shell that prevented the Android Gradle Plugin (AGP) from initializing its location services.

## Actions Taken

1. **Environment Check**: Verified that Expo and the Android SDK path are correctly configured.
2. **Clean Build**: Attempted to run `gradlew clean` to ensure a fresh build state.
3. **Build Execution**: Attempted to run `gradlew assembleRelease` multiple times with various environment overrides (`HOME`, `USERPROFILE`, `ANDROID_USER_HOME`).
4. **Manual Cleanup**: Manually removed the `build/` directories to bypass potential cache corruption.

## Results

Despite trying multiple environment configurations, the build consistently failed with the following error:

```
Failed to create service 'com.android.build.gradle.internal.services.AndroidLocationsBuildService_...'
> Could not create provider for value source AndroidLocationsBuildService.AndroidDirectoryCreator.
```

This error is a known issue when the Android Gradle Plugin cannot access or create a writable `.android` directory in the user's home path, which is often restricted within the IDE's internal shell environment.

## Recommendation

To successfully build the APK, please run the following command in your **system terminal** (e.g., Command Prompt, PowerShell, or macOS Terminal) from the project root:

```cmd
cd android
./gradlew assembleRelease
```

Once the build completes, the APK will be located at:
`android/app/build/outputs/apk/release/app-release.apk`

---

> [!TIP]
> If you need to build and run the app directly on a connected device or emulator, you can also use:
> ```bash
> npx expo run:android --variant release
> ```
