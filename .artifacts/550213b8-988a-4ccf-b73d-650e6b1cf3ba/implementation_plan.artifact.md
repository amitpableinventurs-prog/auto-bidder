# Implementation Plan - Production Readiness

This plan outlines the steps to make the AutoBidder mobile app production-ready by improving security, stability, and professional configuration.

## User Review Required

> [!IMPORTANT]
> The plan includes migrating authentication tokens to `expo-secure-store`. This is a breaking change for existing local development sessions (users will need to log in again).

> [!NOTE]
> I will be adding `expo-secure-store` and `expo-updates` to the dependencies. These require a new development build if you are using Expo Dev Client.

## Proposed Changes

### Mobile App Security & Stability

#### [MODIFY] [package.json](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/package.json)
- Add `expo-secure-store` for encrypted storage of authentication tokens.
- Add `expo-updates` to enable Over-The-Air (OTA) updates.

#### [MODIFY] [AuthContext.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/AuthContext.tsx)
- Replace `AsyncStorage` with `SecureStore` for the `auth_token` to ensure it is encrypted on-device.

#### [MODIFY] [app.json](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/app.json)
- Add professional metadata: `description`, `owner`, and `supportEmail`.
- Configure `expo-build-properties` to enable ProGuard/R8 obfuscation for Android release builds.
- Set `runtimeVersion` for `expo-updates`.

#### [NEW] [env-check.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/utils/env-check.ts)
- Create a utility to validate that essential environment variables (like `EXPO_PUBLIC_API_BASE_URL`) are present before the app starts, preventing silent failures in production.

#### [MODIFY] [ErrorBoundary.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/components/ErrorBoundary.tsx)
- Enhance the UI for production.
- Add a hook for future integration with crash reporting services (e.g., Sentry or Firebase Crashlytics).

### Code Quality & UX

#### [MODIFY] [EditProfile.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/EditProfile.tsx)
- Implement more robust validation using `zod` (already in project dependencies).
- Improve error feedback for image uploads and profile updates.

## Verification Plan

### Automated Tests
- N/A (Project doesn't have a configured test suite yet, but I will check for syntax errors).

### Manual Verification
1.  **Auth Migration**: Verify that the app still loads and manages auth state correctly with `SecureStore`.
2.  **Environment Check**: Temporarily remove an env var and verify the app shows a clear error message.
3.  **Build Config**: Verify `app.json` is valid and contains the new properties.
4.  **UI Review**: Check `EditProfile` for improved validation feedback.
