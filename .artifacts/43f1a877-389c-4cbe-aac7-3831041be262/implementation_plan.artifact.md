# Production Readiness Plan for Auto-Bidder

This plan outlines the steps to make the Auto-Bidder application (API and Mobile) production-ready by improving security, stability, and deployment configuration.

## User Review Required

> [!IMPORTANT]
> **EAS Project ID**: The `app.json` for the mobile app currently has a placeholder for Expo Updates (`your-project-id`). If you have an Expo account, we should link the project using `npx eas project:init`.
> **Sentry DSN**: For production crash reporting, I recommend setting up Sentry. Do you have a Sentry DSN you'd like to use?
> **Stripe Production Keys**: Ensure that production keys are provided in the production environment variables.

## Proposed Changes

---

### API Service (`services/api`)

The goal is to harden the Express API for production use.

#### [MODIFY] [package.json](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/package.json)
- Add dependencies: `helmet`, `express-rate-limit`, `compression`, `morgan`.

#### [MODIFY] [http.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/http.ts)
- Integrate `helmet` for secure headers.
- Add `compression` to reduce payload size.
- Add `morgan` for structured request logging.
- Implement `express-rate-limit` for API endpoints to prevent abuse.

#### [MODIFY] [env.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/env.ts)
- Add validation for production-specific environment variables.

---

### Mobile App (`apps/mobile`)

The goal is to prepare the Expo app for stores and OTA updates.

#### [NEW] [eas.json](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/eas.json)
- Define build profiles: `development`, `preview`, and `production`.
- Configure `production` build to use proper environment variables.

#### [MODIFY] [app.json](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/app.json)
- Finalize naming and metadata.
- Ensure all permissions are strictly necessary and documented.

---

### General Cleanup

#### [DELETE] Debug logs
- Remove `startup.log`, `api_stdout.log`, `api_stderr.log`, `start_test.log`, `root_output.log`, `output-metadata.json`, `app-release.apk` from the project root.

## Verification Plan

### Automated Tests
- Run `npm run build` in root to ensure workspace consistency.
- Run `npm run build` in `services/api` to verify TypeScript compilation.
- Validate `eas.json` by running `npx eas build --list` (simulated).

### Manual Verification
- Verify `/health` and `/ready` endpoints on the API.
- Check that security headers are present in API responses (using `curl -I`).
- Ensure the mobile app starts correctly in development mode after changes.
