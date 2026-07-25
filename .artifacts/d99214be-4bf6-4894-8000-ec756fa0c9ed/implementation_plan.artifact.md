# Stability and Crash Prevention Plan

This plan aims to improve the overall stability of the AutoBidder app by addressing common crash points, improving error handling, and resolving cross-platform styling issues.

## User Review Required

> [!IMPORTANT]
> Some changes involve adding fallback values to state updates. This ensures the app doesn't crash if the API returns unexpected data (e.g., empty objects instead of expected arrays).

## Proposed Changes

### [API Layer]

#### [MODIFY] [api.ts](file:///C:/Users/Vaibhav%20Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/api.ts)
- Add a timeout to the `fetch` request in the `request` function to prevent hanging requests from blocking the UI or causing issues.
- Ensure `request` returns a consistent empty object/array if parsing fails but the response was ok.

### [UI Layer - Robustness]

#### [MODIFY] [ListingManagement.tsx](file:///C:/Users/Vaibhav%20Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/ListingManagement.tsx)
- Add null-coalescing operator `|| []` when setting listings state to prevent crashes during filtering.
- Wrap `fetchListings` in a `try-catch` block (it currently uses `.catch`, which is fine, but `res.listings` access needs to be safer).

#### [MODIFY] [LiveAuction.tsx](file:///C:/Users/Vaibhav%20Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/LiveAuction.tsx)
- Add validation in `onBidCreated` socket listener to ensure `bid` and `bid.amount` exist before attempting to sort the bids array.
- Add error boundaries to real-time update logic.

#### [MODIFY] [MainHome.tsx](file:///C:/Users/Vaibhav%20Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/MainHome.tsx)
- Fix potential crash if `heroBanners` is null/undefined when starting auto-play.
- Wrap navigation calls in `try-catch` to handle invalid paths from remote config/sliders.

### [Cross-Platform Fixes]

#### [MODIFY] Multiple Files
- Wrap `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, and `elevation` in `Platform.select` to avoid "shadow*" property warnings and potential crashes on the web platform.
- Target files: `BidPopup.tsx`, `CalendarModal.tsx`, `Activity.tsx`, `AllBrands.tsx`, `BrandDetails.tsx`, `BuyCarList.tsx`, `KYCVerification.tsx`, `PhoneLoginOnboarding.tsx`, `PlaceBid.tsx`, `Profile.tsx`, `Register.tsx`, `SellerDashboard.tsx`, `SellerMeetingOptions.tsx`, `SplashScreen.tsx`, `UpdateOffer.tsx`.

## Verification Plan

### Manual Verification
- Verify the app loads on both Android/iOS emulators and Web.
- Test "My Inventory" screen with a simulated empty API response.
- Test real-time bidding in "Live Auction" and ensure no crashes occur on new bid arrival.
- Check browser console for shadow property warnings.
