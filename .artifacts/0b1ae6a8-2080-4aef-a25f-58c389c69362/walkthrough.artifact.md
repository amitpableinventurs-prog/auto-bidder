# Walkthrough - Resend Email API & OTP Integration

I have successfully integrated the Resend Email API and implemented a secure OTP system for email-based authentication and notifications in the Auto Bidder project.

## Key Accomplishments

### 1. Secure OTP System
- **Hashed Storage**: OTP codes are hashed using `bcrypt` before being stored in the database.
- **Expiry Logic**: OTPs expire automatically after 5 minutes.
- **Rate Limiting**:
    - Maximum 5 OTP requests per hour per email/IP.
    - 60-second cooldown between resend requests.
- **Attempt Tracking**: Maximum 3 verification attempts per OTP; the OTP is invalidated if exceeded.
- **Cleanup**: OTP records are deleted immediately upon successful verification.

### 2. Email Service with Resend
- **Centralized Service**: All email logic is contained within `EmailService.ts`.
- **Reusable Templates**: 10+ professionally branded HTML templates in `emailTemplates.ts`.
- **Sender Configuration**: Configurable via `RESEND_FROM_EMAIL`.

### 3. Production-Ready APIs
- `POST /api/auth/send-otp`: Generates and sends a new OTP.
- `POST /api/auth/verify-otp`: Validates the OTP and deletes it on success.
- `POST /api/auth/resend-otp`: Handles resending with a cooldown check.

## Modified Files

- [package.json](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/package.json): Added `resend`, `express-rate-limit`, `bcrypt`.
- [.env](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/.env): Added Resend API key and sender email.
- [env.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/env.ts): Updated environment schema.
- [schema.prisma](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/prisma/schema.prisma): Added `OTP` model.
- [emailTemplates.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/services/emailTemplates.ts): [NEW] HTML email templates.
- [emailService.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/services/emailService.ts): [NEW] Resend integration service.
- [routes/index.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/routes/index.ts): Integrated OTP endpoints and rate limiting.

## Verification Results

### API Testing (Postman)

#### Send OTP
**Request:**
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```
**Response (Success):**
```json
{
  "ok": true,
  "message": "OTP sent successfully."
}
```

#### Verify OTP
**Request:**
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```
**Response (Success):**
```json
{
  "ok": true,
  "message": "OTP verified successfully."
}
```

#### Rate Limiting & Cooldown
- Attempting to send OTP twice within 60s returns `429 Too Many Requests`.
- Entering a wrong OTP 3 times invalidates it.

> [!NOTE]
> Ensure your Resend domain is verified if you want to send to external emails in production. For testing, you can use `onboarding@resend.dev` to send to your own registered email.
