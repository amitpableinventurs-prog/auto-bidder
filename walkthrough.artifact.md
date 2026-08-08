# Walkthrough: Fixed Backend Configuration & Building Instructions

I have fixed the issues caused by running the wrong command in the `services/api` directory and provided the correct instructions for starting your services.

## Changes Made

### Backend Service (`services/api`)
- **Reverted `tsconfig.json`**: Removed the accidental `extends: expo/tsconfig.base` which was added by Expo CLI.
- **Cleanup**: Removed the `.expo/` folder that was created in the backend directory.

## Root Cause of Error
The error `ECONNRESET` occurred because `npx expo start` was executed inside the **Backend API** folder. Expo tried to treat the backend as a mobile app, updated its configuration, and attempted to download the Expo Go app over a potentially unstable connection.

## Correct Commands

### 1. To Start the Backend API
Run this from the `services/api` folder:
```bash
npm run dev
```

### 2. To Start the Mobile App
Run this from the **Root** folder:
```bash
npm run dev:mobile
```

### 3. To Start Everything (API + Mobile + Admin)
Run this from the **Root** folder:
```bash
npm run dev
```

### 4. To Build the APK
Run this from the **Root** folder (ensure you have unset `ANDROID_PREFS_ROOT` if still building locally):
```bash
cd android
./gradlew assembleRelease
```

> [!TIP]
> Always verify which directory you are in before running `npx expo start`. It should only be used for the frontend mobile app folders.
