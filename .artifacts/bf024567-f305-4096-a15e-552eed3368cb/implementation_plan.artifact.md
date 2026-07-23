# Implementation Plan - Distributor "Share & Earn" Program

Implement a comprehensive Distributor program where users can earn commissions by referring new sellers and listings.

## User Review Required

> [!IMPORTANT]
> The implementation relies on capturing a `ref` parameter from deep links. Ensure that the app's deep linking is correctly configured in `app.json` (scheme: `autobidder`).

> [!NOTE]
> Commissions are currently hardcoded in the mock backend logic: 1,000 INR for an ACTIVE listing and 2% for a SOLD car. These can be made configurable in the Admin settings later.

## Proposed Changes

### Mobile App (apps/mobile)

#### [MODIFY] [MainHome.tsx](file:///C:/Users/Vaibhav%20Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/MainHome.tsx)
- Add `useEffect` to listen for incoming deep links using `expo-linking`.
- Extract `ref` parameter from the URL.
- Store the captured `ref` code in `AsyncStorage` (e.g., `distributor_referral_code`).

#### [MODIFY] [Register.tsx](file:///C:/Users/Vaibhav%20Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/Register.tsx)
- Read `distributor_referral_code` from `AsyncStorage` on mount.
- Include the referral code in the `register` API call.

#### [MODIFY] [FillCarDetails.tsx](file:///C:/Users/Vaibhav%20Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/FillCarDetails.tsx)
- Read `distributor_referral_code` from `AsyncStorage`.
- Include `referredByDistributorCode` in the `createListing` payload.

---

### Admin Module (apps/admin)

#### [MODIFY] [index.html](file:///C:/Users/Vaibhav%20Soni/StudioProjects/auto-bidder/auto-bidder/apps/admin/index.html)
- Add a new "Distributors" navigation item and module.
- Implement `renderDistributors` to display a list of all distributors with their performance (referrals, total earned).
- Add actions to suspend/activate distributors.
- Enhance the "Commissions" view to allow processing payouts for pending earnings.

#### [MODIFY] [app.js](file:///C:/Users/Vaibhav%20Soni/StudioProjects/auto-bidder/auto-bidder/apps/admin/app.js)
- Add API methods for fetching and managing distributors:
    - `getDistributors()`
    - `updateDistributorStatus(id, status)`
    - `processPayout(id)`

---

### Backend API (services/api)

#### [MODIFY] [index.ts](file:///C:/Users/Vaibhav%20Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/routes/index.ts)
- Add Admin routes for distributor management:
    - `GET /api/admin/distributors`
    - `PATCH /api/admin/distributors/:id/status`
    - `POST /api/admin/payouts/:id/process`
- Ensure `refreshDistributorCommission` is triggered when a listing's status is updated to `ACTIVE` or `SOLD`.

## Verification Plan

### Automated Tests
- N/A (Manual verification on device/simulator is preferred for deep linking).

### Manual Verification
1. **Deep Link Test**: Open `autobidder://list?ref=AB-DIST-1001` on a device. Verify `distributor_referral_code` is saved in logs/storage.
2. **Signup Attribution**: Register a new user after clicking the link. Check if the user is attributed in the database.
3. **Listing Attribution**: Create a car listing. Verify `referredByDistributorCode` is correctly populated in the database.
4. **Earnings Calculation**: Approve the listing in Admin. Check if the Distributor's "Pending Earnings" increase.
5. **Payout Process**: Process a payout in Admin. Check if the balance is updated.
