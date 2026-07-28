# Implementation Plan - Fix OTP 501 Error & Enable Email Login

The mobile app currently uses phone-based login and hits the `/api/auth/otp/request` endpoint, which returns a 501 error in production. The goal is to integrate the newly created Resend Email API endpoints into the mobile app and ensure the backend handles OTP requests correctly.

## User Review Required

> [!IMPORTANT]
> - The mobile app currently only shows "Login With Your Mobile Number". I will add a toggle or a second option to "Login With Email" so you can use the Resend Email API for authentication as requested.
> - I will also update the existing `/api/auth/otp/request` (phone-based) to use the new OTP logic, sending the code to the user's registered email if they exist, or providing a clear error if no email is linked.

## Proposed Changes

### [Backend (services/api)]

#### [MODIFY] [index.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/routes/index.ts)
- Update `/auth/otp/request` (phone-based) to find the user by phone.
- If user exists and has an email, send OTP via `EmailService`.
- If in production and no SMS provider is configured, return a helpful error instead of just 501.
- Ensure the new `/auth/send-otp` (email-based) is fully integrated.

### [Frontend (apps/mobile)]

#### [MODIFY] [api.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/api.ts)
- Add functions for `sendEmailOtp`, `verifyEmailOtp`, and `resendEmailOtp` calling the new backend endpoints.

#### [MODIFY] [PhoneLoginOnboarding.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/PhoneLoginOnboarding.tsx)
- Add a toggle/switch to allow "Email Login".
- Update the "GET OTP" logic to call `sendEmailOtp` when in Email mode.
- Update navigation to pass whether it's email or phone to the OTP screen.

#### [MODIFY] [OtpVerification.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/OtpVerification.tsx)
- Update to handle both email and phone verification using the correct endpoints.

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
1. **Email Login**:
   - Open app -> Toggle to Email Login.
   - Enter email -> Click GET OTP.
   - Verify Resend email is received.
   - Enter OTP -> Verify successful login.
2. **Phone Login (Existing)**:
   - Verify it no longer returns 501 if an email is associated with the phone.
3. **Socket Error**:
   - Investigate why "Socket connection error" is appearing (likely server URL mismatch in frontend).
