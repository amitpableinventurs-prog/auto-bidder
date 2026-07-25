# Implementation Plan - EAS Build Android (Cloud)

Since local EAS builds for Android are not supported on Windows, we will proceed with a Cloud build. To include your uncommitted changes, we will commit them to a temporary branch.

## User Review Required

> [!IMPORTANT]
> This process will:
> 1. Create a temporary git branch `build-android-preview`.
> 2. Commit all current uncommitted changes.
> 3. Trigger an EAS Cloud build using the `preview` profile.

## Proposed Changes

### Git Operations

#### [RUN] `git checkout -b build-android-preview`
Create a dedicated branch for this build.

#### [RUN] `git add .` & `git commit -m "chore: prepare for android preview build"`
Capture all current work.

### Build Execution

#### [RUN] `eas build --platform android --profile preview`
Submit the build to Expo's servers.

## Verification Plan

### Manual Verification
- Provide the EAS build dashboard URL to the user.
- Verify the build is successfully queued in the Expo dashboard.
