# Walkthrough - Distributor "Share & Earn" Program

I have implemented the complete end-to-end flow for the Distributor program, enabling users to refer sellers and earn commissions.

## Changes Made

### Mobile App - Referral Attribution
- **Deep Link Handling**: Added a listener in `MainHome.tsx` to capture the `ref` parameter from links like `autobidder://list?ref=AB-DIST-1001`.
- **Persistence**: Captured referral codes are stored in `AsyncStorage` and persisted across app restarts.
- **Attribution**: The referral code is automatically sent during user registration and car listing creation, ensuring proper credit to the distributor.

### Backend API - Financial Logic
- **Data Models**: Added `Commission` and `Payout` models to Prisma for robust financial tracking.
- **Automated Earnings**: Implemented logic to automatically accrue commissions when a referred listing becomes `ACTIVE` (₹1,000) or `SOLD` (2% of price).
- **Wallet Integration**: Updated the user wallet to show commission credits and withdrawal (payout) debits.
- **Payout Requests**: Added an API endpoint for users to request payouts with bank details.

### Admin Module - Management
- **Distributor Directory**: Admins can now view all distributors, their referral counts, and total earnings.
- **Status Control**: Added ability to activate or suspend distributors.
- **Payout Management**: Enhanced the payout dashboard to process real payout requests from the database.
- **Commission Logs**: A centralized log of all accrued platform and distributor commissions.

## Verification Results

### Deep Link Test
- Verified that `queryParams.ref` is correctly extracted and stored when the app is opened via a referral URL.

### Data Consistency
- Verified that `referredByUserId` and `referredByDistributorCode` are correctly populated in both `User` and `Listing` tables upon creation.

### Commission Trigger
- Verified that updating a listing status in Admin correctly increments the Distributor's `referralEarnings` and creates a `Commission` record.

> [!TIP]
> To test the flow, share a link from the Distributor tab in the DNP screen, open it on another device (or simulator), and register/list a car. You will see the earnings reflect in the Distributor's dashboard immediately after admin approval.
