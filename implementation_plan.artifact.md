# Implementation Plan: Fix Codegen Errors and Backend Setup

This plan addresses the bundling error in `react-native-screens` and prevents recurring issues in the backend service configuration.

## User Review Required

> [!CAUTION]
> **DO NOT RUN `npx expo start` in the `services/api` directory.**
> The `services/api` folder contains a Node.js Express backend, NOT an Expo app. Running Expo commands there will corrupt your backend configuration and try to download mobile apps unnecessarily.

## Proposed Changes

### 1. Restore and Fix Codegen in `react-native-screens`
The previous patch removed `WithDefault` wrappers, which are mandatory for certain types (like enums/unions) in React Native Codegen. I will update the patch script to use direct `WithDefault` imports without namespaces, which should resolve both the "Unknown prop type" and "Default enum value required" errors.

- **Action**: Run an updated `patch_screens.js` script.
- **Goal**: Change types like `autoCapitalize?: AutoCapitalizeType` back to `autoCapitalize?: WithDefault<AutoCapitalizeType, 'systemDefault'>` but with direct imports.

### 2. Backend Environment Cleanup
Expo CLI modified `services/api/tsconfig.json`. I need to ensure it's reverted to its pure Node.js state.

- **Action**: Revert `services/api/tsconfig.json` (I'll do this again to be sure).
- **Action**: Delete any `.expo` folder in `services/api`.

## Verification Plan

### Automated Tests
- Run `npm run dev:mobile` from the **root** directory to verify bundling succeeds.
- Run `npm run dev` from the `services/api` directory to verify the backend starts without Expo errors.

### Manual Verification
- Verify that the mobile app loads in the Metro bundler without "Unknown prop type" errors.
