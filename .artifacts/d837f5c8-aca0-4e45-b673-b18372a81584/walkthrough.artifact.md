# Walkthrough - UI Overlap & Safe Area Fixes

I have implemented a comprehensive set of fixes to ensure the application is fully responsive and respects safe areas (notches, punch-holes, and gesture areas) on both Android and iOS.

## Key Improvements

### 1. Robust `ScreenWrapper`
Standardized the `ScreenWrapper` component to handle safe area insets more effectively:
- Added `edges` prop to selectively apply insets.
- Automatically handles horizontal insets for landscape and foldable devices.
- Integrated `paddingTop` and `paddingBottom` logic to prevent overlap with status and navigation bars.

### 2. Standardized Headers
Updated `MainHeader.tsx` and internal headers across several screens:
- Removed hardcoded `paddingTop: 20` and replaced it with `insets.top`.
- Added horizontal safe area padding to ensure content is not cut off in landscape mode.

### 3. Responsive Modals & Popups
Fixed common overlap issues in modals:
- **`BottomSelectModal`**: Added bottom inset padding to prevent content from overlapping with the home indicator/gesture area.
- **`BidPopup`**: Wrapped content in a `ScrollView` and added safe area padding to ensure usability on smaller devices or in landscape mode.
- **`CalendarModal`**: Verified centering and responsiveness.

### 4. Screen-Specific Fixes
Applied safe area best practices to the following key screens:
- `MainHome.tsx`, `SellCar.tsx`, `BuyCarList.tsx`, `FillCarDetails.tsx`, `CarCamera.tsx`, `CameraGuidance.tsx`, `PhoneLoginOnboarding.tsx`, `CarDetails.tsx`, `LiveAuction.tsx`, `Profile.tsx`, `Settings.tsx`, `Wallet.tsx`, and `Wishlist.tsx`.

## Technical Details

- **Safe Area Context**: Migrated from standard `SafeAreaView` to a more flexible approach using `useSafeAreaInsets()` for absolute positioning and custom layouts.
- **Flexbox over Fixed Units**: Replaced several fixed pixel values with flexible layouts to improve responsiveness across device sizes.
- **Landscape Support**: Specifically addressed orientation-switching screens (like `CarCamera` and `CameraGuidance`) to ensure controls remain accessible.

> [!TIP]
> The app now uses `ScreenWrapper` as the primary layout component, which ensures consistency and simplifies safe area management for future screens.
