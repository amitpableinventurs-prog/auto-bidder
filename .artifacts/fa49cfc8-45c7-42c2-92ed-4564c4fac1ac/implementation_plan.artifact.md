# Launch Readiness & Feature Completion

Based on the **Android App Development & Launch Checklist**, we will focus on completing critical missing items to prepare the **Auto-Bidder** app for a production-ready state.

## User Review Required

> [!IMPORTANT]
> Some items in the checklist (like SSL certificates and Play Store account setup) are infrastructure-related and must be handled by the user. I will focus on the **codebase** aspects.

## Proposed Changes

We will address the following areas sequentially:

### 1. Testing Infrastructure (Section 5)
- **Goal**: Set up a robust testing environment to ensure app stability.
- **Action**:
    - Install and configure `jest`, `ts-jest`, and `@testing-library/react-native`.
    - Create a sample unit test for `api.ts`.
    - Create a sample UI test for `MainHome.tsx`.

### 2. Security Enhancements (Section 4)
- **Goal**: Hardening the authentication flow and protecting sensitive data.
- **Action**:
    - Implement a JWT Refresh Token mechanism on both the backend and frontend.
    - Ensure all API keys are correctly managed via `.env` and `expo-constants`.

### 3. Performance Optimization (Section 6)
- **Goal**: Improve user experience and app responsiveness.
- **Action**:
    - Audit image usage and implement aggressive caching/optimization using `expo-image` if not already optimal.
    - Verify list performance in `BuyCarList.tsx` and `ListingManagement.tsx`.

### 4. Optional Features (Section 15)
- **Goal**: Add high-value "Optional" features requested in the checklist.
- **Action**:
    - Implement **Dark Mode** support across the app.
    - Add **QR Code Scanner** for car verification (if needed by the business logic).

## Verification Plan

### Automated Tests
- `npm test` to run the new test suite.

### Manual Verification
- Verify Dark Mode toggling in Settings.
- Verify that a fresh login correctly refreshes tokens before they expire.
- Monitor app size and performance metrics during build.

---

### Open Questions
1. **Testing**: Do you have a preference for any specific testing library (e.g., Detox for E2E)?
2. **Prioritization**: Which area should we tackle first? My recommendation is **Testing** followed by **Security**.
3. **Checklist Marks**: Some items in your checklist were marked ✅ but I didn't find the implementation (e.g., Unit Testing). Should I treat those as "To be verified" or "Need implementation"?
