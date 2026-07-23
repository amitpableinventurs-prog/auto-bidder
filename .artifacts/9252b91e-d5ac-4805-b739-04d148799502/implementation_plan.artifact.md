# Fix RCTImageView Cast Error

The app is crashing with the error "Value for uri cannot be cast from Double to String" in `RCTImageView`. This happens when a number (typically an asset ID from `require`) is passed to the `uri` property of an `Image` source object.

## Proposed Changes

I have identified two locations where `brand.logo` is incorrectly passed into `{ uri: brand.logo }` when `brand.logo` might be a numeric asset ID.

### apps/mobile

#### [MODIFY] [BrandDetails.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/BrandDetails.tsx)
- Update the `Image` source for the brand logo to handle both strings (URIs) and numbers (asset IDs).

#### [MODIFY] [MainHome.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/MainHome.tsx)
- Update the `Image` source for popular brands to handle both strings and numbers.

## Verification Plan

### Manual Verification
- Navigate to the "All Brands" screen and click on a brand to open `BrandDetails`.
- Verify that the brand logo displays correctly and the app doesn't crash.
- On the `MainHome` screen, verify that the logos in the "Explore Popular Brands" section display correctly.
